/* ========================================
   Reloj Digital - Reloj_time
   Lógica funcional:
   - Reloj en tiempo real (12/24h)
   - Modo claro/oscuro con persistencia
   - Temporizador de sesión con sonido al terminar
   - Fondos traseros dinámicos
   ======================================== */

// Elementos del reloj
const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const dateEl = document.getElementById("date");

// Elementos de controles principales
const toggle12Btn = document.getElementById("toggle12");
const toggleThemeBtn = document.getElementById("toggleTheme");
const toggleBgBtn = document.getElementById("toggleBg");

// Elementos del temporizador
const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");
const timerMinutesInput = document.getElementById("timerMinutes");
const soundSelect = document.getElementById("soundSelect");
const timerSound = document.getElementById("timerSound");

// Selector de fondos
const bgSelector = document.getElementById("bgSelector");
const bgOptions = document.getElementById("bgOptions");
const bgLayer = document.getElementById("bgLayer");

// Estado
let use24h = false;
let isDark = true;
let isBgSelectorOpen = false;

// Estado del temporizador
let timerSeconds = 0;
let timerInterval = null;
let timerRunning = false;
let timerPaused = false;

// ==========================================
// RELOJ
// ==========================================

const weekdays = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];

const months = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  let period = "AM";

  if (!use24h) {
    period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
  }

  timeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  periodEl.textContent = use24h ? "" : period;

  const weekday = weekdays[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  dateEl.textContent = `${weekday}, ${day} de ${month} de ${year}`;
}

setInterval(updateClock, 1000);
updateClock();

// ==========================================
// TEMA CLARO / OSCURO
// ==========================================

function applyTheme(dark) {
  if (dark) {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    toggleThemeBtn.querySelector(".btn-icon").textContent = "☀️";
    toggleThemeBtn.querySelector(".btn-label").textContent = "Modo claro";
  } else {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    toggleThemeBtn.querySelector(".btn-icon").textContent = "🌙";
    toggleThemeBtn.querySelector(".btn-label").textContent = "Modo oscuro";
  }
  localStorage.setItem("reloj_theme", dark ? "dark" : "light");
}

toggleThemeBtn.addEventListener("click", () => {
  isDark = !isDark;
  applyTheme(isDark);
});

const savedTheme = localStorage.getItem("reloj_theme");
if (savedTheme !== null) {
  isDark = savedTheme === "dark";
} else {
  isDark = true;
}
applyTheme(isDark);

// ==========================================
// FORMATO 12 / 24 HORAS
// ==========================================

toggle12Btn.addEventListener("click", () => {
  use24h = !use24h;
  updateClock();
});

// ==========================================
// FONDOS TRASEROS
// ==========================================

const backgrounds = [
  {
    id: "bg-azul",
    name: "Azul profundo",
    image: "assets/backgrounds/bg-azul.png",
    gradient:
      "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.14), transparent 40%)",
  },
  {
    id: "bg-purpura",
    name: "Púrpura",
    image: "assets/backgrounds/bg-purpura.png",
    gradient:
      "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(168, 85, 247, 0.14), transparent 40%)",
  },
  {
    id: "bg-verde",
    name: "Esmeralda",
    image: "assets/backgrounds/bg-verde.png",
    gradient:
      "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.14), transparent 40%)",
  },
  {
    id: "bg-naranja",
    name: "Ámbar",
    image: "assets/backgrounds/bg-naranja.png",
    gradient:
      "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 158, 11, 0.14), transparent 40%)",
  },
  {
    id: "bg-rosa",
    name: "Rosa",
    image: "assets/backgrounds/bg-rosa.png",
    gradient:
      "radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(236, 72, 153, 0.14), transparent 40%)",
  },
];

let currentBgIndex = 0;

function renderBgOptions() {
  bgOptions.innerHTML = "";
  backgrounds.forEach((bg, index) => {
    const option = document.createElement("div");
    option.className = `bg-option ${index === currentBgIndex ? "active" : ""}`;
    option.style.backgroundImage = bg.image ? `url(${bg.image})` : "none";
    option.title = bg.name;
    option.addEventListener("click", () => selectBackground(index));
    bgOptions.appendChild(option);
  });
}

function selectBackground(index) {
  currentBgIndex = index;
  const bg = backgrounds[index];

  // Aplicar fondo: imagen + gradiente dinámico
  if (bg.image) {
    bgLayer.style.backgroundImage = `url(${bg.image}), ${bg.gradient}`;
  } else {
    bgLayer.style.backgroundImage = bg.gradient;
  }

  localStorage.setItem("reloj_bg", index);
  renderBgOptions();
  toggleBgSelector(false);
}

function toggleBgSelector(open) {
  isBgSelectorOpen = open;
  bgSelector.style.display = open ? "block" : "none";
}

toggleBgBtn.addEventListener("click", () => {
  toggleBgSelector(!isBgSelectorOpen);
});

// Cargar fondo guardado
const savedBg = localStorage.getItem("reloj_bg");
if (savedBg !== null) {
  currentBgIndex = parseInt(savedBg, 10);
  if (isNaN(currentBgIndex) || currentBgIndex < 0 || currentBgIndex >= backgrounds.length) {
    currentBgIndex = 0;
  }
} else {
  currentBgIndex = 0;
}

renderBgOptions();
selectBackground(currentBgIndex);

// ==========================================
// EFECTO MOUSE PARA FONDO DINÁMICO
// ==========================================

document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  document.body.style.setProperty("--mouse-x", `${x}%`);
  document.body.style.setProperty("--mouse-y", `${y}%`);
});

// ==========================================
// TEMPORIZADOR DE SESIÓN
// ==========================================

const SOUNDS = {
  none: null,
  ding: "assets/sounds/ding.wav",
  chime: "assets/sounds/chime.wav",
  bell: "assets/sounds/bell.wav",
};

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}";
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTimer(timerSeconds);
}

function playSound(name) {
  const src = SOUNDS[name];
  if (!src) return;
  try {
    timerSound.src = src;
    timerSound.currentTime = 0;
    timerSound.play().catch(() => {
      // El navegador puede bloquear autoplay sin interacción previa
    });
  } catch (err) {
    console.warn("No se pudo reproducir el sonido:", err);
  }
}

function startTimer() {
  if (timerRunning) return;

  // Si no hay tiempo cargado, usar el valor del input
  if (timerSeconds === 0) {
    const mins = parseInt(timerMinutesInput.value, 10) || 25;
    timerSeconds = mins * 60;
  }

  timerRunning = true;
  timerPaused = false;
  startTimerBtn.disabled = true;
  pauseTimerBtn.disabled = false;
  resetTimerBtn.disabled = false;
  timerMinutesInput.disabled = true;

  timerInterval = setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      updateTimerDisplay();
    } else {
      finishTimer();
    }
  }, 1000);

  updateTimerDisplay();
}

function pauseTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerPaused = true;
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  startTimerBtn.querySelector(".btn-icon").textContent = "▶️";
  startTimerBtn.querySelector(".btn-label").textContent = "Reanudar";
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerPaused = false;
  const mins = parseInt(timerMinutesInput.value, 10) || 25;
  timerSeconds = mins * 60;
  updateTimerDisplay();
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  timerMinutesInput.disabled = false;
  startTimerBtn.querySelector(".btn-icon").textContent = "▶️";
  startTimerBtn.querySelector(".btn-label").textContent = "Iniciar";
}

function finishTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerSeconds = 0;
  updateTimerDisplay();

  // Reproducir sonido al terminar la sesión
  const selectedSound = soundSelect.value;
  playSound(selectedSound);

  // Notificación visual
  timerDisplay.classList.add("flash");
  setTimeout(() => timerDisplay.classList.remove("flash"), 600);

  // Alerta nativa (opcional)
  try {
    new Notification("Reloj_time", {
      body: "Tu sesión ha terminado.",
      icon: null,
    });
  } catch (err) {
    // Notificaciones no soportadas o bloqueadas
  }

  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = false;
  timerMinutesInput.disabled = false;
  startTimerBtn.querySelector(".btn-icon").textContent = "▶️";
  startTimerBtn.querySelector(".btn-label").textContent = "Iniciar";
}

startTimerBtn.addEventListener("click", startTimer);
pauseTimerBtn.addEventListener("click", pauseTimer);
resetTimerBtn.addEventListener("click", resetTimer);

timerMinutesInput.addEventListener("change", () => {
  if (!timerRunning) {
    const mins = parseInt(timerMinutesInput.value, 10) || 25;
    timerSeconds = mins * 60;
    updateTimerDisplay();
  }
});

// Inicializar temporizador
resetTimer();
