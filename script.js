const gallery = document.getElementById("gallery");
const toggleBtn = document.getElementById("modeToggle");

const TOTAL_IMAGES = 100;      // total real
const SHUFFLE_POOL_SIZE = 100; // cantidad a mostrar en random
const BATCH_SIZE = 25;
const TARGET_ROW_HEIGHT = 250;

let loaded = 0;
let mode = "sequential";

let shuffleList = [];
let shuffleIndex = 0;

let buffer = [];

// 🔀 Shuffle correcto del TOTAL y luego recorte
function generateRandomSelection(total, size) {
  const arr = Array.from({ length: total }, (_, i) => i + 1);

  // Fisher-Yates completo
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, size);
}

// 📦 Obtener siguiente imagen
function getNextImage() {
  if (mode === "sequential") {
    loaded++;
    if (loaded > TOTAL_IMAGES) return null;
    return loaded;
  } else {
    if (shuffleIndex >= shuffleList.length) return null;
    return shuffleList[shuffleIndex++];
  }
}

// 📦 Cargar imagen
function loadImage(num) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `images/${num}.jpg?cache=${Date.now()}`; // evita cache fuerte

    img.onload = () => {
      resolve({
        element: img,
        ratio: img.width / img.height
      });
    };

    img.onerror = () => resolve(null);
  });
}

// 🧠 Construir fila
function buildRow(images) {
  const row = document.createElement("div");
  row.className = "row";

  const totalRatio = images.reduce((sum, img) => sum + img.ratio, 0);
  const containerWidth = window.innerWidth;
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
    if (!num) return;

    const data = await loadImage(num);
    if (!data) continue;

    buffer.push(data);

    let rowRatio = buffer.reduce((sum, img) => sum + img.ratio, 0);

    if (rowRatio * TARGET_ROW_HEIGHT >= window.innerWidth) {
      buildRow(buffer);
      buffer = [];
    }
  }
}

// 🔁 Scroll infinito
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    loadImages();
  }
});

// 🔀 Toggle modo
toggleBtn.addEventListener("click", () => {
  mode = mode === "sequential" ? "random" : "sequential";

  gallery.innerHTML = "";
  loaded = 0;
  buffer = [];

  if (mode === "random") {
    shuffleList = generateRandomSelection(TOTAL_IMAGES, SHUFFLE_POOL_SIZE);
    shuffleIndex = 0;
  }

  loadImages();
});

// 📱 Reflow resize
window.addEventListener("resize", () => {
  const imgs = Array.from(document.querySelectorAll("img")).map(img => ({
    element: img,
    ratio: img.naturalWidth / img.naturalHeight
  }));

  gallery.innerHTML = "";
  buffer = [];

  imgs.forEach(img => {
    buffer.push(img);

    let rowRatio = buffer.reduce((sum, i) => sum + i.ratio, 0);

    if (rowRatio * TARGET_ROW_HEIGHT >= window.innerWidth) {
      buildRow(buffer);
      buffer = [];
    }
  });
});

// 🚀 Inicial (IMPORTANTE: iniciar random bien si quisieras)
loadImages();