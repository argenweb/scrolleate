const gallery = document.getElementById("gallery");
const toggleBtn = document.getElementById("modeToggle");

const TOTAL_IMAGES = 248; // ajustar esta cantidad cada vez que se suben img
const BATCH_SIZE = 500;

let mode = "random"; // arranca en random directamente
let imageOrder = [];
let currentIndex = 0;
let isLoading = false;

/* =========================
   🎲 RANDOM PROFESIONAL (SEED)
========================= */

// PRNG (mulberry32)
function createSeededRandom(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Shuffle con seed
function shuffleWithSeed(array, seed) {
  const random = createSeededRandom(seed);

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

/* =========================
   🧠 ORDEN DE IMÁGENES
========================= */

function generateUniqueSeed() {
  let lastSeed = localStorage.getItem("lastSeed");
  let newSeed;

  do {
    newSeed = Date.now() + Math.floor(Math.random() * 100000);
  } while (newSeed == lastSeed);

  localStorage.setItem("lastSeed", newSeed);
  return newSeed;
}

function initOrder() {
  const base = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);

  if (mode === "random") {
    const seed = generateUniqueSeed();
    console.log("🎲 Seed usada:", seed);

    imageOrder = shuffleWithSeed(base, seed);
  } else {
    imageOrder = base;
  }

  currentIndex = 0;
}

/* =========================
   📦 IMÁGENES
========================= */

function getNextImage() {
  if (currentIndex >= imageOrder.length) return null;
  return imageOrder[currentIndex++];
}

function createImage(src) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "full-image";
  return img;
}

/* =========================
   📥 CARGA
========================= */

function loadImages() {
  if (isLoading) return;
  isLoading = true;

  let count = 0;

  while (count < BATCH_SIZE) {
    const num = getNextImage();
    if (!num) break;

    const img = createImage(`images/${num}.jpg`);
    gallery.appendChild(img);

    count++;
  }

  isLoading = false;
}

/* =========================
   🔁 SCROLL INFINITO
========================= */

window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 300
  ) {
    loadImages();
  }
});

/* =========================
   🔀 TOGGLE MODO
========================= */

toggleBtn.addEventListener("click", () => {
  mode = mode === "sequential" ? "random" : "sequential";

  reset();
  initOrder();
  loadImages();
});

/* =========================
   🔄 RESET
========================= */

function reset() {
  gallery.innerHTML = "";
  currentIndex = 0;
}

/* =========================
   🚀 INIT
========================= */

initOrder();
loadImages();
