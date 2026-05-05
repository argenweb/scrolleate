const gallery = document.getElementById("gallery");
const toggleBtn = document.getElementById("modeToggle");

const TOTAL_IMAGES = 100;
const BATCH_SIZE = 10;

let mode = "sequential";
let imageOrder = [];
let currentIndex = 0;
let isLoading = false;

// 🔀 Shuffle real
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🧠 Inicializar orden correcto
function initOrder() {
  const base = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);
  imageOrder = mode === "random" ? shuffle(base) : base;
  currentIndex = 0;
}

// 📦 Obtener siguiente imagen
function getNextImage() {
  if (currentIndex >= imageOrder.length) return null;
  return imageOrder[currentIndex++];
}

// 🖼️ Crear imagen full width
function createImage(src) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "full-image";
  return img;
}

// 📥 Cargar imágenes
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

// 🔁 Scroll infinito
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 300
  ) {
    loadImages();
  }
});

// 🔀 Toggle modo
toggleBtn.addEventListener("click", () => {
  mode = mode === "sequential" ? "random" : "sequential";

  reset();
  initOrder();
  loadImages();
});

// 🔄 Reset
function reset() {
  gallery.innerHTML = "";
  currentIndex = 0;
}

// 🚀 INIT
initOrder();
loadImages();