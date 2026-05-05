const gallery = document.getElementById("gallery");
const toggleBtn = document.getElementById("modeToggle");

const TOTAL_IMAGES = 1000; // 🔥 ajusta esto a tu cantidad real
const BATCH_SIZE = 20;

let loaded = 0;
let mode = "sequential"; // o "random"
let usedRandom = new Set();

// 📦 Generar número random sin repetir
function getRandomImage() {
  if (usedRandom.size >= TOTAL_IMAGES) return null;

  let num;
  do {
    num = Math.floor(Math.random() * TOTAL_IMAGES) + 1;
  } while (usedRandom.has(num));

  usedRandom.add(num);
  return num;
}

// 📦 Obtener siguiente imagen
function getNextImage() {
  if (mode === "sequential") {
    loaded++;
    return loaded;
  } else {
    return getRandomImage();
  }
}

// 🖼 Crear imagen
function createImage(src) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "image";
  img.loading = "lazy";
  return img;
}

// 📥 Cargar batch
function loadImages() {
  for (let i = 0; i < BATCH_SIZE; i++) {
    const num = getNextImage();
    if (!num) return;

    const path = `images/${num}.jpg`; // 🔥 ruta base
    const img = createImage(path);

    gallery.appendChild(img);
  }
}

// 🔁 Scroll infinito
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadImages();
  }
});

// 🔀 Cambiar modo
toggleBtn.addEventListener("click", () => {
  mode = mode === "sequential" ? "random" : "sequential";

  // reset
  gallery.innerHTML = "";
  loaded = 0;
  usedRandom.clear();

  loadImages();
});

// 🚀 Inicial
loadImages();