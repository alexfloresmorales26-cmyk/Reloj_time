/* ========================================
   Reloj Digital - Reloj_time
   Lógica funcional:
   - Reloj en tiempo real (12/24h)
   - Temporizador de sesión con sonido al terminar
   - Fondos traseros dinámicos
   - Modo claro/oscuro con persistencia
   ======================================== */

// Elementos del reloj
const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const dateEl = document.getElementById("date");

// Controles principales
const toggleThemeBtn = document.getElementById("toggleTheme");
const toggle12Btn = document.getElementById("toggle12");
const toggleBgBtn = document.getElementById("toggleBg");

// Temporizador
const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");
const timerMinutesInput = document.getElementById("timerMinutes");
const soundSelect = document.getElementById("soundSelect");
const timerSound = document.getElementById("timerSound");

// Modo Concentración / Descanso
const modeFocusBtn = document.getElementById("modeFocus");
const modeBreakBtn = document.getElementById("modeBreak");

// Fondo
const bgLayer = document.getElementById("bgLayer");
const bgSelector = document.getElementById("bgSelector");
const bgOptions = document.getElementById("bgOptions");
const closeBgBtn = document.getElementById("closeBg");
const bgPreview = document.getElementById("bgPreview");

// Estado
let use24h = false;
let isDark = true;
let isBgOpen = false;

// Estado del temporizador
let timerSeconds = 0;
let timerInterval = null;
let timerRunning = false;

// Modo del temporizador
let currentMode = "focus"; // "focus" | "break"
const MODE_DEFAULTS = {
  focus: 25,  // minutos
  break: 5,   // minutos
};

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

let clockInterval = setInterval(updateClock, 1000);
updateClock();

// ==========================================
// TEMA CLARO / OSCURO
// ==========================================

function applyTheme(dark) {
  if (dark) {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    toggleThemeBtn.textContent = "☀️";
    toggleThemeBtn.title = "Modo claro";
    toggleThemeBtn.setAttribute("aria-pressed", "true");
  } else {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    toggleThemeBtn.textContent = "🌙";
    toggleThemeBtn.title = "Modo oscuro";
    toggleThemeBtn.setAttribute("aria-pressed", "false");
  }
  localStorage.setItem("reloj_theme", dark ? "dark" : "light");

  // Animación de flip en el emoji del theme toggle
  toggleThemeBtn.setAttribute("data-state-change", "");
  toggleThemeBtn.addEventListener("animationend", () => {
    toggleThemeBtn.removeAttribute("data-state-change");
  }, { once: true });
}

toggleThemeBtn.addEventListener("click", () => {
  isDark = !isDark;
  applyTheme(isDark);
});

const savedTheme = localStorage.getItem("reloj_theme");
isDark = savedTheme !== null ? savedTheme === "dark" : true;
applyTheme(isDark);

// ==========================================
// FORMATO 12 / 24 HORAS
// ==========================================

toggle12Btn.addEventListener("click", () => {
  use24h = !use24h;
  updateClock();
  triggerEmojiFlip(toggle12Btn);
});

// ==========================================
// FONDOS TRASEROS
// ==========================================

const backgrounds = [
  {
    id: "bg-urbano",
    name: "Urbano Nocturno",
    image: "assets/backgrounds/bg-urbano.png",
    gradient:
      "radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(192, 132, 252, 0.10), transparent 45%)",
  },
  {
    id: "bg-azul",
    name: "Azul Profundo",
    image: "assets/backgrounds/bg-azul.png",
    gradient:
      "radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.10), transparent 45%)",
  },
  {
    id: "bg-purpura",
    name: "Púrpura",
    image: "assets/backgrounds/bg-purpura.png",
    gradient:
      "radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(168, 85, 247, 0.10), transparent 45%)",
  },
  {
    id: "bg-verde",
    name: "Esmeralda",
    image: "assets/backgrounds/bg-verde.png",
    gradient:
      "radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.10), transparent 45%)",
  },
  {
    id: "bg-naranja",
    name: "Ámbar",
    image: "assets/backgrounds/bg-naranja.png",
    gradient:
      "radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 158, 11, 0.10), transparent 45%)",
  },
  {
    id: "bg-rosa",
    name: "Rosa",
    image: "assets/backgrounds/bg-rosa.png",
    gradient:
      "radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(236, 72, 153, 0.10), transparent 45%)",
  },
  // Fondos Wallhaven (con desenfoque/frosted glass)
  {
    id: "bg-wallhaven-1",
    name: "Noche Estrellada",
    image: "assets/backgrounds/bg-wallhaven-1.png",
    gradient: "none",
    blur: true,
  },
  {
    id: "bg-wallhaven-2",
    name: "Aurora",
    image: "assets/backgrounds/bg-wallhaven-2.png",
    gradient: "none",
    blur: true,
  },
  {
    id: "bg-wallhaven-3",
    name: "Bosque Nocturno",
    image: "assets/backgrounds/bg-wallhaven-3.png",
    gradient: "none",
    blur: true,
  },
  {
    id: "bg-wallhaven-4",
    name: "Ciudad Futurista",
    image: "assets/backgrounds/bg-wallhaven-4.png",
    gradient: "none",
    blur: true,
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

  if (bg.image) {
    if (bg.gradient && bg.gradient !== "none") {
      bgLayer.style.backgroundImage = `url(${bg.image}), ${bg.gradient}`;
    } else {
      bgLayer.style.backgroundImage = `url(${bg.image})`;
    }
  } else {
    bgLayer.style.backgroundImage = bg.gradient;
  }

  // Aplicar/quitar efecto de desenfoque (frosted glass)
  if (bg.blur) {
    bgLayer.classList.add("bg-blur");
  } else {
    bgLayer.classList.remove("bg-blur");
  }

  // Actualizar preview en el botón
  updateBgPreview(bg);

  localStorage.setItem("reloj_bg", index);
  renderBgOptions();
  toggleBgSelector(false);
}

function updateBgPreview(bg) {
  if (!bgPreview) return;
  
  if (bg.image) {
    bgPreview.style.backgroundImage = `url(${bg.image})`;
    bgPreview.style.backgroundSize = "cover";
    bgPreview.style.backgroundPosition = "center";
  } else {
    bgPreview.style.backgroundImage = bg.gradient;
  }
  
  // Indicar si tiene blur con un pequeño borde interno
  if (bg.blur) {
    bgPreview.classList.add("has-blur");
  } else {
    bgPreview.classList.remove("has-blur");
  }
}

function toggleBgSelector(open) {
  isBgOpen = open;
  bgSelector.hidden = !open;
  toggleBgBtn.setAttribute("aria-expanded", String(open));
}

toggleBgBtn.addEventListener("click", () => {
  toggleBgSelector(!isBgOpen);
  triggerEmojiFlip(toggleBgBtn);
});

closeBgBtn.addEventListener("click", () => {
  toggleBgSelector(false);
});

// Cerrar al hacer clic fuera del panel
bgSelector.addEventListener("click", (e) => {
  if (e.target === bgSelector) toggleBgSelector(false);
});

// Cargar fondo guardado
const savedBg = localStorage.getItem("reloj_bg");
if (savedBg !== null) {
  currentBgIndex = parseInt(savedBg, 10);
  if (
    isNaN(currentBgIndex) ||
    currentBgIndex < 0 ||
    currentBgIndex >= backgrounds.length
  ) {
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
  return `${pad(m)}:${pad(s)}`;
}

function updateTimerDisplay() {
  timeEl.textContent = formatTimer(timerSeconds);
}

function playSound(name) {
  const src = SOUNDS[name];
  if (!src) return;
  try {
    timerSound.src = src;
    timerSound.currentTime = 0;
    timerSound.play().catch(() => {
      // Navegador puede bloquear autoplay sin interacción previa
    });
  } catch (err) {
    console.warn("No se pudo reproducir el sonido:", err);
  }
}

function startTimer() {
  if (timerRunning) return;

  if (timerSeconds === 0) {
    const mins = parseInt(timerMinutesInput.value, 10) || 25;
    timerSeconds = mins * 60;
  }

  timerRunning = true;
  startTimerBtn.disabled = true;
  pauseTimerBtn.disabled = false;
  resetTimerBtn.disabled = false;
  timerMinutesInput.disabled = true;

  // Pausar reloj mientras el temporizador corre
  clearInterval(clockInterval);
  clockInterval = null;

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
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;

  // Reanudar reloj mientras está pausado
  if (!clockInterval) {
    clockInterval = setInterval(updateClock, 1000);
    updateClock();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  const mins = parseInt(timerMinutesInput.value, 10) || MODE_DEFAULTS[currentMode];
  timerSeconds = mins * 60;
  updateTimerDisplay();
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  timerMinutesInput.disabled = false;

  // Reanudar reloj si no estaba corriendo
  if (!clockInterval) {
    clockInterval = setInterval(updateClock, 1000);
    updateClock();
  }
}

function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  // Actualizar botones
  modeFocusBtn.classList.toggle("active", mode === "focus");
  modeBreakBtn.classList.toggle("active", mode === "break");
  modeFocusBtn.setAttribute("aria-pressed", mode === "focus");
  modeBreakBtn.setAttribute("aria-pressed", mode === "break");

  // Actualizar input de minutos
  timerMinutesInput.value = MODE_DEFAULTS[mode];

  // Resetear temporizador
  resetTimer();
}

// Event listeners para modo
modeFocusBtn.addEventListener("click", () => setMode("focus"));
modeBreakBtn.addEventListener("click", () => setMode("break"));

// Cambiar minutos al cambiar modo (solo si no está corriendo)
timerMinutesInput.addEventListener("change", () => {
  if (!timerRunning) {
    const mins = parseInt(timerMinutesInput.value, 10) || MODE_DEFAULTS[currentMode];
    timerSeconds = mins * 60;
    updateTimerDisplay();
  }
});

function finishTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerSeconds = 0;
  updateTimerDisplay();

  // Sonido al terminar la sesión
  const selectedSound = soundSelect.value;
  playSound(selectedSound);

  // Efecto visual flash
  timeEl.classList.add("timer-flash");
  setTimeout(() => timeEl.classList.remove("timer-flash"), 500);

  // Notificación del navegador
  try {
    new Notification("Reloj_time", {
      body: "Tu sesión ha terminado.",
    });
  } catch (err) {
    // Notificaciones no soportadas o bloqueadas
  }

  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = false;
  timerMinutesInput.disabled = false;

  // Reanudar reloj
  if (!clockInterval) {
    clockInterval = setInterval(updateClock, 1000);
    updateClock();
  }
}

startTimerBtn.addEventListener("click", startTimer);
pauseTimerBtn.addEventListener("click", pauseTimer);
resetTimerBtn.addEventListener("click", resetTimer);

// Inicializar temporizador
resetTimer();

// Helper: animación flip en emoji
function triggerEmojiFlip(btn) {
  btn.setAttribute("data-state-change", "");
  btn.addEventListener("animationend", () => {
    btn.removeAttribute("data-state-change");
  }, { once: true });
}

// ==========================================
// ENTRADA DEL HERO UNA VEZ (design-taste-frontend rule 5)
// ==========================================
const hero = document.querySelector(".hero");
if (hero) {
  hero.setAttribute("data-enter", "");
}
