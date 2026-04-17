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


function toggleMenu() {
    document.getElementById("nav-menu").classList.toggle("show");
}


// =======================================
// HASIL INPUT KOTA DUMMY
// =======================================
function openModal() {
  const kota = document.querySelector(".search-box input").value;

  if (kota === "") {
    alert("Masukkan kota dulu!");
    return;
  }

  // set nama kota
  document.getElementById("kotaHasil").innerText = "📍 " + kota.toUpperCase();

  // tampilkan modal
  document.getElementById("modalHasil").style.display = "flex";

    const now = new Date();
    document.getElementById("timeNow").innerText =
    "Update: " + now.toLocaleTimeString("id-ID", {
        hour: '2-digit',
        minute: '2-digit'
    });

  loadChart();
}

function closeModal() {
  document.getElementById("modalHasil").style.display = "none";
}

// HUBUNGKAN KE TOMBOL CARI
document.querySelector(".btn-search").addEventListener("click", openModal);


// DUMMY CHART
function loadChart() {
  const ctx = document.getElementById('chartDummy').getContext('2d');
  const clusterData = ['Cerah','Cerah','Berawan','Hujan','Cerah'];

  // destroy chart lama biar gak numpuk
  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['15.00','18.00','21.00','24.00','03.00'],
      datasets: [
        {
          label: '🌡️ Suhu',
          data: [24, 26, 25, 23, 22],
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255,152,0,0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7
        },
        {
          label: '🌧️ Hujan',
          data: [10, 15, 20, 18, 12],
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33,150,243,0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 5
        },
        {
          label: '💨 Angin',
          data: [5, 7, 9, 8, 6],
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76,175,80,0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 5
        }
      ]
    },
    options: {
        responsive: true,
        plugins: {
        legend: {
            position: 'bottom'
        },
        tooltip: {
            enabled: true,
            backgroundColor: 'rgba(255,255,255,0.95)',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 12,
            displayColors: false,

            callbacks: {
            title: function(context) {
                return "⏰ " + context[0].label; // waktu
            },
            label: function(context) {
                const dataIndex = context.dataIndex;

                const cluster = clusterData[dataIndex];
                const suhu = context.chart.data.datasets[0].data[dataIndex];
                const hujan = context.chart.data.datasets[1].data[dataIndex];
                const angin = context.chart.data.datasets[2].data[dataIndex];

                return [
                "📊 Cluster: " + cluster,
                "🌡️ Suhu: " + suhu + "°C",
                "🌧️ Hujan: " + hujan + " mm",
                "💨 Angin: " + angin + " kph"
                ];
            }
            }
        }
        },
        scales: {
            x: {
            position: 'top', // 🔥 PINDAH KE ATAS
            ticks: {
                callback: function(value) {
                const labels = ['🌤️ 15.00','🌥️ 18.00','🌙 21.00','🌙 24.00','🌅 03.00'];
                return labels[value];
                }
            },
            grid: {
                display: false
            }
            },
            y: {
            grid: {
                color: 'rgba(0,0,0,0.05)'
            }
            }
        }
    }
  });
}

// =======================================
// RESET BUTON (SEARCH CITY)
// =======================================

function resetSearchInput() {
    document.getElementById("cityInput").value = "";
    document.getElementById("weatherCard").classList.add("hidden");
    document.getElementById("trendContainer").classList.add("hidden");

    loadDefaultComparison();
    loadDefaultComparisonChart();

    document.getElementById("compareDesc").innerHTML =
        "<strong>Perbandingan pendekatan algoritma clustering sebelum dilakukan prediksi.</strong>";
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
    setInterval(() => {
        index++;
        moveSlide();
    }, 4000);

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
// ENTER KEY NAVIGATION
// =======================================
const inputs = document.querySelectorAll(".input-group input");
inputs.forEach((input, i) => {
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputs[i + 1]?.focus();
        }
    });
});

// =======================================
/*BUBLE PARTICLE*/
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
/*SCROOL REVEAL*/
// =======================================
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
    reveals.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
            el.classList.add("show");
        }
    });
});

// =============================
// animasi HUJAN DERAS(HOME ONLY)
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
//Mouse dan KLIK//
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
/* sparkle ikut mouse*/
// =======================================
document.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastTime < 16) return; // ±60fps
  lastTime = now;

  spawnSparkle(e.clientX, e.clientY, 2, 6);
});

// =======================================
// sparkle pas klik //
// =======================================
document.addEventListener("mousedown", (e) => {
  spawnSparkle(e.clientX, e.clientY, 12, 40);
});


