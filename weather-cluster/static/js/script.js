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
// SLIDER
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".slider-track");
    const nextBtn = document.querySelector(".slider-btn.next");
    const items = document.querySelectorAll(".feature-item");
    let index = 0;

    nextBtn.addEventListener("click", () => {
        index = (index + 1) % items.length;
        track.style.transform = `translateX(-${index * 100}%)`;
    });
});


/*BUBLE PARTICLE*/
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

/*SCROOL REVEAL*/
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


// =======================================
// INIT DEFAULT VIEW (WAJIB DI BAWAH)
// =======================================
document.addEventListener("DOMContentLoaded", () => {
    loadDefaultComparison();
    loadDefaultComparisonChart();
});