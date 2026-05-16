// =======================================
// NAVBAR SCROLL EFFECT
// =======================================
function changeNavbarBackground() {
    const navbar = document.querySelector('.navbar');
    const heroHeight = document.getElementById('beranda').offsetHeight;

    if (window.scrollY >= heroHeight - 80) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}
window.addEventListener('scroll', changeNavbarBackground);
window.addEventListener('load', changeNavbarBackground);


// =======================================
// NAVBAR: Toggle menu (mode mobile)
// =======================================
function toggleMenu() {
    document.getElementById("nav-menu").classList.toggle("show");
}

// =======================================
// INPUT HANDLING: Enter key & tombol aksi
// =======================================
document.addEventListener("DOMContentLoaded", () => {

    // Navigasi pada input kota
    document.getElementById("cityInput").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            searchCity();
        }
    });

    // tombol search
    document.querySelector(".btn-search").addEventListener("click", searchCity); 

    // Navigasi input manual 
    const inputs = [
        {
            temp: document.getElementById("m_temp"),
            rain: document.getElementById("m_rain"),
            wind: document.getElementById("m_wind")
        },
        {
            temp: document.getElementById("m_temp_mobile"),
            rain: document.getElementById("m_rain_mobile"),
            wind: document.getElementById("m_wind_mobile")
        }
    ];

    inputs.forEach(group => {
        if (!group.temp || !group.rain || !group.wind) return;

        group.temp.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                group.rain.focus();
            }
        });

        group.rain.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                group.wind.focus();
            }
        });

        group.wind.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                predictManual();
            }
        });
    });

    // ENTER di suhu → pindah ke hujan
    tempInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            rainInput.focus();
        }
    });

    // ENTER di hujan → pindah ke angin
    rainInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            windInput.focus();
        }
    });

    // ENTER di angin → JALANKAN PREDIKSI
    windInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            predictManual();
        }
    });

});

// =======================================
// MODAL: Tutup modal hasil kota
// =======================================
function closeModal() {
  document.getElementById("modalHasil").style.display = "none";

    // aktifkan scroll lagi
    document.body.style.overflow = "auto";

    // destroy chart biar bersih
    if (window.myChart) {
        window.myChart.destroy();
        window.myChart = null;
    }
}

// =======================================
// API CALL: Ambil data cuaca berdasarkan kota
// =======================================
async function searchCity() {
    const rawCity = document.getElementById("cityInput").value.trim();
    const loading = document.getElementById("loadingOverlay");
    const btn = document.querySelector(".btn-search");

    if (!rawCity) {
        alert("Masukkan kota dulu!");
        return;
    }

    // ✅ Ambil nama kota saja, hapus " City" kalau ada
    let city = rawCity.split(",")[0].trim();
    city = city.replace(/\s*city$/i, "").trim();

    loading.style.display = "flex";
    btn.disabled = true;

    try {
        const response = await fetch(`/predict?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        showCityResult(data);

    } catch (error) {
        console.error(error);
        alert("Gagal mengambil data");
    } finally {
        loading.style.display = "none";
        btn.disabled = false;
    }
}

// =======================================
// SUGGEST KOTA: Autocomplete input kota
// =======================================
let debounceTimer;
let activeIndex = -1; 
const cache = {};

async function fetchSuggestions(query) {
  if (cache[query]) return cache[query];
  const response = await fetch(`/suggest?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  const result = Array.isArray(data) ? data : [];
  cache[query] = result;
  return result;
}

document.getElementById("cityInput").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  const dropdown = document.getElementById("suggestions");
  clearTimeout(debounceTimer);
  dropdown.innerHTML = "";
  activeIndex = -1; 
  if (query.length < 1) return;
  if (cache[query]) {
    fetchSuggestions(query).then(suggestions => renderSuggestions(suggestions, dropdown));
    return;
  }
  debounceTimer = setTimeout(async () => {
    const suggestions = await fetchSuggestions(query);
    renderSuggestions(suggestions, dropdown);
  }, 250);
});

document.getElementById("cityInput").addEventListener("keydown", (e) => {
  const dropdown = document.getElementById("suggestions");
  const items = dropdown.querySelectorAll(".dropdown-item");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex = (activeIndex + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex = (activeIndex - 1 + items.length) % items.length;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex >= 0 && items[activeIndex]) {
      items[activeIndex].click();
    }
    return;
  } else if (e.key === "Escape") {
    dropdown.innerHTML = "";
    activeIndex = -1;
    return;
  }

  items.forEach((item, i) => {
    item.classList.toggle("active", i === activeIndex);
  });
});

function renderSuggestions(suggestions, dropdown) {
  dropdown.innerHTML = "";
  activeIndex = -1; 

  suggestions.forEach(city => {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = city;
    item.onclick = async () => {
        let cityOnly = city.split(",")[0].trim();
        cityOnly = cityOnly.replace(/\s*city$/i, "").trim();

        const loading = document.getElementById("loadingOverlay");
        const btn = document.querySelector(".btn-search");

        document.getElementById("cityInput").value = city;
        dropdown.innerHTML = "";

        loading.style.display = "flex";
        btn.disabled = true;

        try {
            const response = await fetch(`/predict?city=${encodeURIComponent(cityOnly)}`);
            const data = await response.json();

            if (data.error) {
                console.log("Error detail:", data); // ✅ lihat full response
                alert(data.error + "\n" + (data.detail || ""));
                return;
            }

            showCityResult(data);

        } catch (error) {
            console.error(error);
            alert("Gagal mengambil data");

        } finally {
            loading.style.display = "none";
            btn.disabled = false;
        }
    };
    dropdown.appendChild(item);
  });
}

// =======================================
// UTIL: Menentukan icon cuaca berdasarkan kondisi & waktu
// =======================================
function getWeatherIcon(kategori) {
    const hour = new Date().getHours(); 
    const isNight = hour >= 18 || hour < 6;

    const k = kategori.toLowerCase();

    if (isNight) {
        if (k.includes("hujan"))    return "fas fa-cloud-moon-rain";
        if (k.includes("berangin")) return "fas fa-wind";
        if (k.includes("mendung"))  return "fas fa-cloud-moon";
        return "fas fa-moon"; 
    } else {
        if (k.includes("hujan"))    return "fas fa-cloud-rain";
        if (k.includes("berangin")) return "fas fa-wind";
        if (k.includes("mendung"))  return "fas fa-cloud";
        if (k.includes("panas"))    return "fas fa-sun";
        return "fas fa-cloud-sun"; 
    }
}

// =======================================
// UI: Menampilkan hasil cuaca dari API ke modal
// =======================================
function showCityResult(data) {
    document.getElementById("modalHasil").style.display = "flex";
    const now = new Date();
    const hour = now.getHours();
    const cluster = data.kmeans.kategori;
    const clusterId = data.kmeans.cluster;
    const interpretasi = data.manual_interpretation;

    const iconClass = getWeatherIcon(interpretasi, hour);
    document.querySelector(".cuaca-icon i").className = iconClass;

    document.body.style.overflow = "hidden";

    document.getElementById("kotaHasil").innerText =
        "📍 " + data.city.toUpperCase();

    // UPDATE JAM SEKARANG
    const formattedDate = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const formattedTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });

    document.getElementById("timeNow").innerHTML =
        `📅 ${formattedDate}<br>⏰ ${formattedTime}`;

    // INFO FORECAST

    document.querySelector(".cuaca-icon h3").innerText =
        data.raw_weather.temp_c + "°C";

    document.querySelector(".cluster-label").innerText = `Cluster ${clusterId}`;
    document.querySelector(".kategori-label").innerText = interpretasi.toUpperCase();

    document.getElementById("rainCity").innerText =
        data.raw_weather.precip_mm + " mm";

    document.getElementById("windCity").innerText =
        data.raw_weather.wind_kph.toFixed(1) + " kph";

    loadForecastChart(data.trend, data.raw_weather);
}

// =======================================
// CHART: Menampilkan grafik forecast + titik real-time
// =======================================
let chartDataGlobal = null;
let realtimeGlobal = null;

function switchTab(tab) {
    document.querySelectorAll(".chart-tab").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.chart-tab[onclick="switchTab('${tab}')"]`).classList.add("active");
    buildChart(tab);
}

function buildChart(mode = "all") {
    if (!chartDataGlobal) return;

    const { labels, tempData, rainData, windData, clusterData, kategoriData, currentXFraction, currentHour, currentMinute } = chartDataGlobal;
    const realtime = realtimeGlobal;
    const ctx = document.getElementById("chartForecast").getContext("2d");

    if (window.myChart) {
        window.myChart.destroy();
        window.myChart = null;
    }

    const toPoints = (arr) => arr.map((v, i) => ({ x: i, y: v }));

    let datasets = [];
    let legendItems = [];

    if (mode === "all") {
        datasets = [
            {
                label: "Suhu",
                data: toPoints(tempData),
                borderColor: "#ff9800",
                backgroundColor: "rgba(255,152,0,0.15)",
                fill: true, tension: 0.4, pointRadius: 4
            },
            {
                label: "Hujan",
                data: toPoints(rainData),
                borderColor: "#2196f3",
                backgroundColor: "rgba(33,150,243,0.12)",
                fill: true, tension: 0.4, pointRadius: 4
            },
            {
                label: "Angin",
                data: toPoints(windData),
                borderColor: "#4caf50",
                backgroundColor: "rgba(76,175,80,0.12)",
                fill: true, tension: 0.4, pointRadius: 4
            },
            {
                type: "scatter",
                label: "Waktu Sekarang",
                data: [{ x: currentXFraction, y: realtime.temp_c }],
                pointRadius: 8, pointHoverRadius: 10,
                pointBackgroundColor: "red",
                pointBorderColor: "#fff", pointBorderWidth: 2,
                showLine: false
            }
        ];
        legendItems = [
            { label: "Suhu", color: "#ff9800" },
            { label: "Hujan", color: "#2196f3" },
            { label: "Angin", color: "#4caf50" },
            { label: "Waktu Sekarang", color: "red", isDot: true }
        ];
    } else if (mode === "temp") {
        datasets = [{
            label: "Suhu (°C)",
            data: toPoints(tempData),
            borderColor: "#ff9800",
            backgroundColor: "rgba(255,152,0,0.15)",
            fill: true, tension: 0.4, pointRadius: 4
        }];
        legendItems = [{ label: "Suhu (°C)", color: "#ff9800" }];
    } else if (mode === "rain") {
        datasets = [{
            label: "Curah Hujan (mm)",
            data: toPoints(rainData),
            borderColor: "#2196f3",
            backgroundColor: "rgba(33,150,243,0.12)",
            fill: true, tension: 0.4, pointRadius: 4
        }];
        legendItems = [{ label: "Curah Hujan (mm)", color: "#2196f3" }];
    } else if (mode === "wind") {
        datasets = [{
            label: "Angin (kph)",
            data: toPoints(windData),
            borderColor: "#4caf50",
            backgroundColor: "rgba(76,175,80,0.12)",
            fill: true, tension: 0.4, pointRadius: 4
        }];
        legendItems = [{ label: "Angin (kph)", color: "#4caf50" }];
    }

    // Render legend custom di bawah grafik
    const legendEl = document.getElementById("chartLegend");
    legendEl.innerHTML = legendItems.map(item => `
        <span class="legend-item">
            <span class="legend-dot" style="background:${item.color}; border-radius:${item.isDot ? '50%' : '3px'};"></span>
            ${item.label}
        </span>
    `).join("");

    window.myChart = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const first = context[0];
                            let hour = first.dataset.label === "Waktu Sekarang"
                                ? currentHour
                                : parseInt(labels[first.dataIndex].split(":")[0]);
                            let emoji = "🌙", period = "Malam";
                            if (hour >= 5 && hour < 11) { emoji = "🌅"; period = "Pagi"; }
                            else if (hour >= 11 && hour < 15) { emoji = "☀️"; period = "Siang"; }
                            else if (hour >= 15 && hour < 18) { emoji = "🌇"; period = "Sore"; }
                            if (first.dataset.label === "Waktu Sekarang")
                                return `${emoji} ${currentHour}:${String(currentMinute).padStart(2, "0")} (${period})`;
                            return `${emoji} ${labels[first.dataIndex]} (${period})`;
                        },
                        label: () => null,
                        afterBody: function(context) {
                            const i = context[0].dataIndex;
                            if (context[0].dataset.label === "Waktu Sekarang") {
                                return [
                                    `🌡️ Suhu: ${realtime.temp_c}°C`,
                                    `🌧️ Curah Hujan: ${realtime.precip_mm} mm`,
                                    `💨 Angin: ${realtime.wind_kph.toFixed(1)} kph`,
                                    `📌 Real-time data`
                                ];
                            }
                            if (mode === "all") {
                                return [
                                    `🌡️ Suhu: ${tempData[i]}°C`,
                                    `🌧️ Curah Hujan: ${rainData[i]} mm`,
                                    `💨 Angin: ${windData[i]} kph`,
                                    `📌 Cluster: ${clusterData[i]} • ${kategoriData[i]}`
                                ];
                            }
                            if (mode === "temp") return [`🌡️ Suhu: ${tempData[i]}°C`];
                            if (mode === "rain") return [`🌧️ Curah Hujan: ${rainData[i]} mm`];
                            if (mode === "wind") return [`💨 Angin: ${windData[i]} kph`];
                        }
                    }
                }
            },
            interaction: { mode: "nearest", intersect: true },
            scales: {
                x: {
                    type: "linear",
                    min: 0,
                    max: labels.length - 1,
                    ticks: {
                        stepSize: 1,
                        callback: (value) => labels[value] || ""
                    }
                }
            }
        }
    });
}

function loadForecastChart(trend, realtime) {
    const labels = trend.map(item => item.time);
    const tempData = trend.map(item => item.temp);
    const rainData = trend.map(item => item.rain);
    const windData = trend.map(item => item.wind);
    const clusterData = trend.map(item => item.kmeans.cluster);
    const kategoriData = trend.map(item => item.kmeans.kategori);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let currentXFraction = 0;
    for (let i = 0; i < labels.length - 1; i++) {
        const hour1 = parseInt(labels[i].split(":")[0]);
        const hour2 = parseInt(labels[i + 1].split(":")[0]);
        if (currentHour >= hour1 && currentHour <= hour2) {
            const totalMinutes = (hour2 - hour1) * 60;
            const passedMinutes = ((currentHour - hour1) * 60) + currentMinute;
            currentXFraction = i + (passedMinutes / totalMinutes);
            break;
        }
    }

    chartDataGlobal = { labels, tempData, rainData, windData, clusterData, kategoriData, currentXFraction, currentHour, currentMinute };
    realtimeGlobal = realtime;

    // Reset tab ke "Semua" tiap buka modal baru
    document.querySelectorAll(".chart-tab").forEach(btn => btn.classList.remove("active"));
    document.querySelector(".chart-tab[onclick=\"switchTab('all')\"]").classList.add("active");

    buildChart("all");
}

// =======================================
// RESET: Input pencarian kota
// =======================================

function resetSearchInput() {
    document.getElementById("cityInput").value = "";
    document.getElementById("suggestions").innerHTML = ""; // ✅ hilangkan suggest
    activeIndex = -1; // ✅ reset navigasi keyboard
}

// =======================================
// SLIDER
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".slider-track");
    const nextBtn = document.querySelector(".slider-btn.next");
    const prevBtn = document.querySelector(".slider-btn.prev");
    let items = document.querySelectorAll(".feature-item");

    // CLONE FIRST & LAST
    const firstClone = items[0].cloneNode(true);
    const lastClone = items[items.length - 1].cloneNode(true);

    track.appendChild(firstClone);
    track.insertBefore(lastClone, items[0]);

    items = document.querySelectorAll(".feature-item");

    let index = 1;
    const total = items.length;

    track.style.transform = `translateX(-${index * 100}%)`;

    function moveSlide() {
        track.style.transition = "transform 0.5s ease";
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    nextBtn.addEventListener("click", () => {
        if (index >= total - 1) return;
        index++;
        moveSlide();
    });

    prevBtn.addEventListener("click", () => {
        if (index <= 0) return;
        index--;
        moveSlide();
    });

    // AUTO SLIDE
    let autoSlide = setInterval(nextSlide, 4000);

    function nextSlide() {
        index++;
        moveSlide();
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearInterval(autoSlide);
        } else {
            autoSlide = setInterval(nextSlide, 4000);
        }
    });

    // RESET POSITION TANPA KELIATAN
    track.addEventListener("transitionend", () => {
        if (items[index].isSameNode(firstClone)) {
            track.style.transition = "none";
            index = 1;
            track.style.transform = `translateX(-${index * 100}%)`;
        }

        if (items[index].isSameNode(lastClone)) {
            track.style.transition = "none";
            index = total - 2;
            track.style.transform = `translateX(-${index * 100}%)`;
        }
    });
});


// =======================================
// MANUAL INPUT: Tampilkan hasil prediksi manual
// =======================================

function showManualResult(data) {
    // isi data ke modal
    document.getElementById("tempManual").innerText = data.temp + " °C";
    document.getElementById("rainManual").innerText = data.rain + " mm";
    document.getElementById("windManual").innerText = data.wind + " kph";

    document.getElementById("clusterManual").innerText = `Cluster ${data.clusterId} • ${data.kategori}`;

    // icon sederhana (opsional)
    const icon = document.getElementById("iconManual");

    if (data.kategori === "Hujan") {
        icon.className = "fas fa-cloud-rain";
    } else if (data.kategori === "Berangin") {
        icon.className = "fas fa-wind";
    } else if (data.kategori === "Panas") {
        icon.className = "fas fa-sun";
    } else {
        icon.className = "fas fa-cloud-sun";
    }

    document.getElementById("summaryManual").innerText =
        `Berdasarkan input, kondisi cuaca termasuk kategori ${data.kategori}.`;

    document.getElementById("interpretasiManual").innerText =
        "Hasil ini diperoleh dari pengelompokan sederhana berbasis rule (simulasi K-Means).";

    document.getElementById("modalManual").style.display = "flex";
}

// =======================================
// API CALL: Prediksi manual (POST request)
// =======================================

async function predictManual() {
    const temp =
        document.getElementById("m_temp").value ||
        document.getElementById("m_temp_mobile").value;

    const rain =
        document.getElementById("m_rain").value ||
        document.getElementById("m_rain_mobile").value;

    const wind =
        document.getElementById("m_wind").value ||
        document.getElementById("m_wind_mobile").value;

    if (!temp || !rain || !wind) {
        alert("Mohon isi semua data");
        return;
    }

    try {
        const response = await fetch("/predict/manual", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                temp,
                rain,
                wind
            })
        });

        const data = await response.json();

        showManualResult({
            temp,
            rain,
            wind,
            clusterId: data.kmeans.cluster,
            kategori: data.kmeans.kategori
        });

    } catch (error) {
        console.error(error);
        alert("Gagal prediksi manual");
    }
}

function closeManual() {
    document.getElementById("modalManual").style.display = "none";
}

// =======================================
// RESET MANUAL INPUT 
// =======================================
function resetManualInput() {
    document.getElementById("m_temp").value = "";
    document.getElementById("m_rain").value = "";
    document.getElementById("m_wind").value = "";
    
    document.getElementById("m_temp_mobile").value = "";
    document.getElementById("m_rain_mobile").value = "";
    document.getElementById("m_wind_mobile").value = "";
}


// =======================================
// NAV, HERO, FOOTER RESPONSIVE
// =======================================
(function () {
    var btn     = document.getElementById('mobHamburger');
    var sidebar = document.getElementById('mobSidebar');
    var overlay = document.getElementById('mobOverlay');
    var closeX  = document.getElementById('mobSidebarClose');
 
    if (!btn || !sidebar || !overlay) return;
 
    function open() {
        sidebar.classList.add('is-open');
        overlay.classList.add('is-open');
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        sidebar.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
 
    function close() {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-open');
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Scroll effect topbar mobile — sama kayak default
    var topbar = document.querySelector('.mob-topbar');
    if (topbar) {
        function changeMobTopbar() {
            var heroHeight = document.getElementById('beranda').offsetHeight;
            if (window.scrollY >= heroHeight - 80) {
                topbar.classList.add('scrolled');
            } else {
                topbar.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', changeMobTopbar);
        window.addEventListener('load', changeMobTopbar);
    }
 
    btn.addEventListener('click', function () {
        sidebar.classList.contains('is-open') ? close() : open();
    });
 
    if (closeX) closeX.addEventListener('click', close);
    overlay.addEventListener('click', close);
 
    sidebar.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', close);
    });
 
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
    });
})();

// =======================================
// VISUAL EFFECT: Particle background
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    for (let i = 0; i < 40; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = (6 + Math.random() * 6) + "s";
        p.style.animationDelay = Math.random() * 5 + "s";
        document.body.appendChild(p);
    }
});


// =======================================
// VISUAL EFFECT: Scroll reveal animation
// =======================================
function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");

    reveals.forEach(el => {
        const top = el.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {
            el.classList.add("show");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);
window.addEventListener("pageshow", revealOnScroll);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        revealOnScroll();
    }
});

// =============================
// animasi HUJAN (HOME ONLY)
// =============================

document.addEventListener("DOMContentLoaded", () => {
    const rainContainer = document.querySelector(".rain-container");
    if (!rainContainer) return;

    const rainCount = 180; 

    for (let i = 0; i < rainCount; i++) {
        const drop = document.createElement("div");
        drop.className = "rain-drop";

        drop.style.left = Math.random() * 100 + "vw";
        drop.style.animationDuration = (0.6 + Math.random() * 0.5) + "s";
        drop.style.animationDelay = Math.random() * 2 + "s";
        drop.style.opacity = Math.random() * 0.5 + 0.5;

        rainContainer.appendChild(drop);
    }
});


// =======================================
// Mouse dan KLIK
// =======================================
function spawnSparkle(x, y, count = 1, spread = 10) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";

    s.style.left = x + "px";
    s.style.top  = y + "px";

    s.style.transform = `translate(
      ${Math.random() * spread - spread / 2}px,
      ${Math.random() * spread - spread / 2}px
    )`;

    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}

let lastTime = 0;

// =======================================
// sparkle ikut mouse
// =======================================
document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastTime < 16) return; // ±60fps
  lastTime = now;

  spawnSparkle(e.clientX, e.clientY, 2, 6);
});

// =======================================
// sparkle pas klik 
// =======================================
document.addEventListener("mousedown", (e) => {
  spawnSparkle(e.clientX, e.clientY, 12, 40);
});