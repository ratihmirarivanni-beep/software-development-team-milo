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


