const gallery = document.getElementById("gallery");
const toggleBtn = document.getElementById("modeToggle");

const TOTAL_IMAGES = 100;
const BATCH_SIZE = 20;
const TARGET_ROW_HEIGHT = 220;

let mode = "sequential";
let imageOrder = [];
let currentIndex = 0;
let buffer = [];

// 🔀 Shuffle real
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🧠 Inicializar orden SIEMPRE correcto
function initOrder() {
  const base = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);

  imageOrder = mode === "random" ? shuffle(base) : base;

  currentIndex = 0;
}

// 📦 Siguiente imagen
function getNextImage() {
  if (currentIndex >= imageOrder.length) return null;
  return imageOrder[currentIndex++];
}

// 📦 Cargar imagen
function loadImage(num) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `images/${num}.jpg`;

    img.onload = () => {
      resolve({
        element: img,
        ratio: img.naturalWidth / img.naturalHeight
      });
    };

    img.onerror = () => resolve(null);
  });
}

// 📐 Construir fila JUSTIFICADA (SIEMPRE llena ancho)
function buildRow(images) {
  const row = document.createElement("div");
  row.className = "row";

  const containerWidth = gallery.clientWidth;

  const totalRatio = images.reduce((sum, img) => sum + img.ratio, 0);
  const height = containerWidth / totalRatio;

  images.forEach(imgData => {
    const img = imgData.element;
    img.style.height = height + "px";
    img.style.width = height * imgData.ratio + "px";
    row.appendChild(img);
  });

  gallery.appendChild(row);
}

// 📥 Cargar imágenes
async function loadImages() {
  for (let i = 0; i < BATCH_SIZE; i++) {
    const num = getNextImage();
    if (!num) {
      flushBuffer();
      return;
    }

    const data = await loadImage(num);
    if (!data) continue;

    buffer.push(data);

    const rowRatio = buffer.reduce((sum, img) => sum + img.ratio, 0);

    if (rowRatio * TARGET_ROW_HEIGHT >= gallery.clientWidth) {

      // 👉 A veces hacer fila de 1 imagen (SIN romper layout)
      if (buffer.length > 1 && Math.random() < 0.2) {
        buildRow([buffer[0]]);
        buffer.shift();
        continue;
      }

      buildRow(buffer);
      buffer = [];
    }
  }
}

// 🧩 Última fila (sin justificar)
function flushBuffer() {
  if (!buffer.length) return;

  const row = document.createElement("div");
  row.className = "row";

  buffer.forEach(imgData => {
    const img = imgData.element;
    img.style.height = TARGET_ROW_HEIGHT + "px";
    img.style.width = "auto";
    row.appendChild(img);
  });

  gallery.appendChild(row);
  buffer = [];
}

// 🔁 Scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadImages();
  }
});

// 🔀 Toggle
toggleBtn.addEventListener("click", () => {
  mode = mode === "sequential" ? "random" : "sequential";

  reset();
  initOrder();
  loadImages();
});

// 🔄 Reset limpio
function reset() {
  gallery.innerHTML = "";
  buffer = [];
  currentIndex = 0;
}

// 📱 Resize FIX REAL
let resizeTimeout;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    reset();
    initOrder(); // 🔥 ESTO FALTABA
    loadImages();
  }, 200);
});

// 🚀 INIT
initOrder();
loadImages();