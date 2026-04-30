from flask import Flask, request, jsonify, render_template
import joblib
import requests
import numpy as np
import pandas as pd

app = Flask(__name__)

# ===========================================
# LOAD MODEL
# ===========================================
kmeans = joblib.load("models/kmeans.joblib")


# ===========================================
# CLASS UNTUK INTERPRETASI CUACA
# ===========================================
class WeatherInterpreter:
    def __init__(self, rain, temp_min, temp_max, wind):
        self.rain = rain
        self.temp_min = temp_min
        self.temp_max = temp_max
        self.wind = wind

    def get_category(self):
        if self.temp_max >= 24 and self.rain < 1:
            return "Panas"
        elif self.wind > 4.5 and self.temp_max < 15:
            return "Berangin"
        elif self.rain > 15:
            return "Hujan"
        elif self.temp_max <= 10:
            return "Mendung"
        return "Cerah"

# ===========================================
# GET WEATHER DARI OPENWEATHERMAP
# ===========================================
API_KEY = "2ccd023b3e382b75cf2f831208594ccf"
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

def get_weather(city):
    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric"

    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        res = response.json()
    except Exception as e:
        raise ValueError(f"Gagal koneksi API cuaca: {e}")

    temp = res["main"]["temp"]
    rain = res.get("rain", {}).get("1h", 0)
    wind = res["wind"]["speed"] * 3.6

    # Data untuk model
    df = pd.DataFrame([{
        "precipitation": rain,
        "temp_min": temp,
        "temp_max": temp,
        "wind": wind
    }])

    return df, (rain, temp, temp, wind), res

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

            km_cluster = int(kmeans.predict(df)[0])
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
    if not city:
        return jsonify({"error": "City kosong"}), 400

    try:
        scaled, original_values, raw = get_weather(city)
        rain, temp_min, temp_max, wind = original_values

        km_cluster = int(kmeans.predict(scaled)[0])
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

    km_cluster = int(kmeans.predict(df)[0])
    kategori_manual = WeatherInterpreter(rain, temp, temp, wind).get_category()

    return jsonify({
        "manual_interpretation": kategori_manual,
        "kmeans": {
            "cluster": km_cluster,
            "kategori": kategori_manual
        }
    })

# ===========================================
# HOME
# ===========================================
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
