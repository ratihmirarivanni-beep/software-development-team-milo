from flask import Flask, request, jsonify, render_template
import joblib
import requests
import pandas as pd
import os
import datetime

app = Flask(__name__)

# ===========================================
# LOAD MODEL
# ===========================================
kmeans = joblib.load("models/kmeans.joblib")

# ===========================================
# CLASS UNTUK INTERPRETASI CUACA
# ===========================================
class WeatherInterpreter:
    def __init__(self, rain, temp_min, temp_max, wind, res=None):
        self.rain = rain
        self.temp_min = temp_min
        self.temp_max = temp_max
        self.wind = wind
        self.res = res

    def get_category(self):
        hour = datetime.datetime.now().hour
        is_night = hour >= 18 or hour < 6

        if self.rain > 15:
            kategori = "Hujan"
        elif self.wind > 4.5 and self.temp_max < 15:
            kategori = "Berangin"
        elif self.temp_max <= 10:
            kategori = "Mendung"
        elif self.temp_max >= 24 and self.rain < 1:
            kategori = "Cerah" if is_night else "Panas"  
        else:
            kategori = "Cerah"

        return kategori

# ===========================================
# API CONFIG
# ===========================================
API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
GEOCODE_URL = "http://api.openweathermap.org/geo/1.0/direct"

# ===========================================
# GET WEATHER DARI OPENWEATHERMAP
# ===========================================
import datetime

def get_weather(city):
    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        res = response.json()
    except Exception as e:
        raise ValueError(f"Gagal koneksi API cuaca: {e}")

    temp     = res["main"]["temp"]
    temp_min = res["main"]["temp_min"]
    temp_max = res["main"]["temp_max"]
    wind     = res["wind"]["speed"] * 3.6

    rain = 0.0
    try:
        f_url = f"{FORECAST_URL}?q={city}&appid={API_KEY}&units=metric"
        f_res = requests.get(f_url, timeout=5).json()

        now = datetime.datetime.utcnow().timestamp()  

        closest = min(
            f_res["list"],
            key=lambda x: abs(x["dt"] - now)
        )

        rain_raw = (
            closest.get("rain", {}).get("3h", None) or
            closest.get("rain", {}).get("1h", None) or
            0.0
        )
        rain = round(rain_raw / 3, 2)

        print(f"Forecast dipilih: {closest['dt_txt']} | rain: {rain}")

    except:
        rain = (
            res.get("rain", {}).get("1h", None) or
            res.get("rain", {}).get("3h", None) or
            0.0
        )

    df = pd.DataFrame([{
        "precipitation": rain,
        "temp_min": temp_min,
        "temp_max": temp_max,
        "wind": wind
    }])

    return df, (rain, temp_min, temp_max, wind), res
# ===========================================
# FORECAST 8 JAM KE DEPAN
# ===========================================
def get_forecast(city):
    url = f"{FORECAST_URL}?q={city}&appid={API_KEY}&units=metric"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        res = response.json()

        result = []

        for item in res.get("list", [])[:8]:
            time = item["dt_txt"][11:16]
            temp = item["main"]["temp"]
            rain = item.get("rain", {}).get("3h", 0)
            wind = item["wind"]["speed"] * 3.6

            df = pd.DataFrame([{
                "precipitation": rain,
                "temp_min": temp,
                "temp_max": temp,
                "wind": wind
            }])

            km_cluster = int(kmeans.predict(df.values)[0])
            print(time, temp, rain, wind, km_cluster)

            kategori = WeatherInterpreter(rain, temp, temp, wind).get_category()

            result.append({
                "time": time,
                "temp": temp,
                "rain": rain,
                "wind": wind,
                "kmeans": {
                    "cluster": km_cluster,
                    "kategori": kategori
                }
            })

        return result

    except Exception as e:
        print("FORECAST ERROR:", e)
        return []

# ===========================================
# ENDPOINT PREDIKSI (CITY)
# ===========================================
@app.route("/predict", methods=["GET"])
def predict_weather():
    city = request.args.get("city")
    print(f"City diterima: '{city}'")  
    if not city:
        return jsonify({"error": "City kosong"}), 400

    try:
        scaled, original_values, raw = get_weather(city)
        rain, temp_min, temp_max, wind = original_values

        km_cluster = int(kmeans.predict(scaled.values)[0])
        kategori_manual = WeatherInterpreter(rain, temp_max, temp_max, wind).get_category()

        return jsonify({
            "city": city,
            "raw_weather": {
                "temp_c": temp_max,
                "humidity": raw["main"]["humidity"],
                "precip_mm": rain,
                "wind_kph": wind,
                "description": raw["weather"][0]["description"]
            },
            "trend": get_forecast(city),
            "manual_interpretation": kategori_manual,
            "kmeans": {
                "cluster": km_cluster,
                "kategori": kategori_manual
            }
        })

    except Exception as e:
        print(f"Error predict: {e}")  
        return jsonify({"error": "Gagal mengambil data cuaca", "detail": str(e)}), 500
# ===========================================
# ENDPOINT PREDIKSI MANUAL
# ===========================================
@app.route("/predict/manual", methods=["POST"])
def predict_manual():
    data = request.get_json()
    try:
        temp = float(data["temp"])
        rain = float(data["rain"])
        wind = float(data["wind"])
    except:
        return jsonify({"error": "Input tidak valid"}), 400

    df = pd.DataFrame([{
        "precipitation": rain,
        "temp_min": temp,
        "temp_max": temp,
        "wind": wind
    }])

    km_cluster = int(kmeans.predict(df.values)[0])
    kategori_manual = WeatherInterpreter(rain, temp, temp, wind).get_category()

    return jsonify({
        "manual_interpretation": kategori_manual,
        "kmeans": {
            "cluster": km_cluster,
            "kategori": kategori_manual
        }
    })

# ===========================================
# ENDPOINT AUTO-SUGGEST KOTA
# ===========================================
@app.route("/suggest", methods=["GET"])
def suggest_city():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([])

    url = f"{GEOCODE_URL}?q={query}&limit=20&appid={API_KEY}"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        res = response.json()

        suggestions = []
        seen = set()

        for city in res:
            if city.get("country") != "ID":
                continue

            name  = city.get("name", "").strip()
            state = city.get("state", "")

            if not name:
                continue

            if not name.lower().startswith(query.lower()):
                continue

            parts = [p for p in [name, state] if p]
            label = ", ".join(parts)

            if label not in seen:
                seen.add(label)
                suggestions.append(label)

        return jsonify(suggestions[:8])

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===========================================
# HOME
# ===========================================
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
