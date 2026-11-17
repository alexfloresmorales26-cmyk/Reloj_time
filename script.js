/* ========================================
   Reloj_time — lógica
   Reloj, temporizador de sesión, fondos y tema.
   ======================================== */

const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const dateEl = document.getElementById("date");
const sessionStateEl = document.getElementById("sessionState");
const heroEl = document.getElementById("hero");
const ringProgress = document.getElementById("ringProgress");
const themeColorMeta = document.getElementById("themeColor");

const toggleThemeBtn = document.getElementById("toggleTheme");
const toggle12Btn = document.getElementById("toggle12");
const toggleBgBtn = document.getElementById("toggleBg");
const formatBadge = document.getElementById("formatBadge");

const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");
const startLabel = document.getElementById("startLabel");
const timerMinutesInput = document.getElementById("timerMinutes");
const soundSelect = document.getElementById("soundSelect");
const timerSound = document.getElementById("timerSound");

const modeFocusBtn = document.getElementById("modeFocus");
const modeBreakBtn = document.getElementById("modeBreak");

const bgLayer = document.getElementById("bgLayer");
const bgSelector = document.getElementById("bgSelector");
const bgOptions = document.getElementById("bgOptions");
const closeBgBtn = document.getElementById("closeBg");
const bgPreview = document.getElementById("bgPreview");
const pageWrap = document.querySelector(".wrap");
const skipLink = document.querySelector(".skip-link");

const BASE_TITLE = "Reloj_time — Reloj digital y temporizador";
const MODE_DEFAULTS = { focus: 25, break: 5 };
const MODE_LABELS = { focus: "Concentración", break: "Descanso" };
const WEEKDAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const RING_RADIUS = 152;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

let use24h = false;
let isDark = !document.documentElement.classList.contains("light");
let isBgOpen = false;
let currentMode = "focus";
let currentBgIndex = 0;

/* idle | running | paused | finished */
let timerState = "idle";
let timerRemaining = 0;
let timerTotal = 0;
let timerEndAt = 0;
let timerInterval = null;
let clockInterval = null;
let finishTimeout = null;
let flashTimeout = null;
let lastFocusedElement = null;

function pad(value) {
  return String(value).padStart(2, "0");
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    /* El reloj funciona igual con el almacenamiento bloqueado. */
  }
}

function clampMinutes(value) {
  const raw = String(value ?? "").trim();
  if (raw === "") return MODE_DEFAULTS[currentMode];

  const minutes = Math.trunc(Number(raw));
  if (!Number.isFinite(minutes)) return MODE_DEFAULTS[currentMode];

  return Math.min(120, Math.max(1, minutes));
}

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function setRingProgress(fraction) {
  const safeFraction = Math.min(1, Math.max(0, fraction));
  ringProgress.style.strokeDashoffset = String(
    RING_CIRCUMFERENCE * (1 - safeFraction),
  );
}

function updateDateFormat(now) {
  const dateText = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} de ${
    MONTHS[now.getMonth()]
  } de ${now.getFullYear()}`;
  if (dateEl.textContent !== dateText) dateEl.textContent = dateText;

  const isoDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;
  if (dateEl.dateTime !== isoDate) dateEl.dateTime = isoDate;
}

/* ---------- Reloj ---------- */
function updateClock() {
  if (timerState !== "idle") return;

  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let period = "AM";

  if (!use24h) {
    period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
  }

  timeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  periodEl.textContent = use24h ? "" : period;
  periodEl.hidden = use24h;
  sessionStateEl.hidden = true;
  sessionStateEl.textContent = "";
  updateDateFormat(now);
}

function startClock() {
  stopClock();
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

function stopClock() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
}

/* ---------- Formato de hora ---------- */
function updateFormatButton() {
  const nextFormat = use24h ? "12" : "24";
  toggle12Btn.setAttribute("aria-pressed", String(use24h));
  toggle12Btn.setAttribute(
    "aria-label",
    `Cambiar a formato de ${nextFormat} horas`,
  );
  toggle12Btn.title = `Cambiar a formato de ${nextFormat} horas`;
  formatBadge.textContent = use24h ? "24" : "12";
}

function setUse24(is24) {
  use24h = is24;
  updateFormatButton();
  writeStorage("reloj_format", use24h ? "24" : "12");

  if (timerState === "idle") {
    updateClock();
  } else {
    periodEl.hidden = true;
  }
}

/* ---------- Tema ---------- */
function applyTheme(dark, persist = true) {
  isDark = dark;
  document.documentElement.classList.toggle("light", !dark);

  const actionLabel = dark ? "Activar modo claro" : "Activar modo oscuro";
  toggleThemeBtn.title = actionLabel;
  toggleThemeBtn.setAttribute("aria-label", actionLabel);
  themeColorMeta.setAttribute("content", dark ? "#070911" : "#edf0f6");

  if (persist) writeStorage("reloj_theme", dark ? "dark" : "light");
}

toggleThemeBtn.addEventListener("click", () => {
  applyTheme(!isDark);
});

toggle12Btn.addEventListener("click", () => {
  setUse24(!use24h);
});

/* ---------- Temporizador ---------- */
function renderTimer() {
  timeEl.textContent = formatTimer(timerRemaining);
  periodEl.hidden = true;
  sessionStateEl.hidden = false;
  heroEl.dataset.state = timerState;

  let statusText = "";

  if (timerState === "running") {
    statusText = `${MODE_LABELS[currentMode]} · En curso`;
    document.title = `${formatTimer(timerRemaining)} · ${
      MODE_LABELS[currentMode]
    } — Reloj_time`;
  } else if (timerState === "paused") {
    statusText = `${MODE_LABELS[currentMode]} · En pausa`;
    document.title = `Pausa · ${formatTimer(timerRemaining)} — Reloj_time`;
  } else if (timerState === "finished") {
    statusText = "Sesión completada";
    document.title = "Sesión completada — Reloj_time";
  }

  // Cambiar solo cuando el texto cambia evita reanuncios en el live region.
  if (sessionStateEl.textContent !== statusText) {
    sessionStateEl.textContent = statusText;
  }

  setRingProgress(timerTotal > 0 ? timerRemaining / timerTotal : 0);
}

function syncControls() {
  const isRunning = timerState === "running";
  const isPaused = timerState === "paused";
  const isFinished = timerState === "finished";
  const isIdle = timerState === "idle";

  startTimerBtn.disabled = isRunning;
  pauseTimerBtn.disabled = !isRunning;
  resetTimerBtn.disabled = isIdle;
  timerMinutesInput.disabled = isRunning || isPaused;
  modeFocusBtn.disabled = isRunning || isPaused;
  modeBreakBtn.disabled = isRunning || isPaused;

  // La acción principal sigue al estado: Iniciar/Reanudar o Pausar.
  startTimerBtn.classList.toggle("btn-primary", !isRunning);
  pauseTimerBtn.classList.toggle("btn-primary", isRunning);

  startLabel.textContent = isPaused
    ? "Reanudar"
    : isFinished
      ? "Nueva sesión"
      : "Iniciar";
}

function startTimer() {
  if (timerState === "running") return;
  clearFinishTimeout();

  if (timerState === "idle" || timerState === "finished") {
    const minutes = clampMinutes(timerMinutesInput.value);
    timerMinutesInput.value = minutes;
    timerTotal = minutes * 60;
    timerRemaining = timerTotal;
  }

  if (timerRemaining <= 0) {
    timerTotal = clampMinutes(timerMinutesInput.value) * 60;
    timerRemaining = timerTotal;
  }

  stopClock();
  timerState = "running";
  timerEndAt = Date.now() + timerRemaining * 1000;

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 250);

  renderTimer();
  syncControls();
  requestNotifications();
}

function pauseTimer() {
  if (timerState !== "running") return;

  const remaining = Math.max(
    0,
    Math.ceil((timerEndAt - Date.now()) / 1000),
  );

  if (remaining <= 0) {
    finishTimer();
    return;
  }

  timerRemaining = remaining;
  timerState = "paused";
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  renderTimer();
  syncControls();
}

function resetTimer() {
  clearTimerInterval();
  clearFinishTimeout();
  clearFlashTimeout();

  timerState = "idle";
  timerRemaining = 0;
  timerTotal = 0;
  timerEndAt = 0;
  heroEl.dataset.state = "idle";
  sessionStateEl.hidden = true;
  sessionStateEl.textContent = "";
  timeEl.classList.remove("timer-flash");

  const minutes = clampMinutes(
    timerMinutesInput.value || MODE_DEFAULTS[currentMode],
  );
  timerMinutesInput.value = minutes;
  timerRemaining = minutes * 60;
  timerTotal = timerRemaining;

  setRingProgress(1);
  document.title = BASE_TITLE;
  startClock();
  syncControls();
}

function finishTimer() {
  if (timerState === "finished" || timerState === "idle") return;

  clearTimerInterval();
  timerState = "finished";
  timerRemaining = 0;
  timerEndAt = 0;

  renderTimer();
  playSound(soundSelect.value);

  timeEl.classList.remove("timer-flash");
  void timeEl.offsetWidth;
  timeEl.classList.add("timer-flash");
  clearFlashTimeout();
  flashTimeout = setTimeout(() => {
    timeEl.classList.remove("timer-flash");
    flashTimeout = null;
  }, 600);

  notifyFinished();
  syncControls();

  clearFinishTimeout();
  finishTimeout = setTimeout(() => {
    finishTimeout = null;
    if (timerState === "finished") resetTimer();
  }, 2600);
}

function tick() {
  updateDateFormat(new Date());
  if (timerState !== "running") return;

  const remaining = Math.max(
    0,
    Math.ceil((timerEndAt - Date.now()) / 1000),
  );

  if (remaining <= 0) {
    finishTimer();
    return;
  }

  if (remaining !== timerRemaining) {
    timerRemaining = remaining;
    renderTimer();
  }
}

function clearTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function clearFinishTimeout() {
  if (finishTimeout) {
    clearTimeout(finishTimeout);
    finishTimeout = null;
  }
}

function clearFlashTimeout() {
  if (flashTimeout) {
    clearTimeout(flashTimeout);
    flashTimeout = null;
  }
}

/* ---------- Sonido y notificación ---------- */
const SOUNDS = {
  none: null,
  ding: "assets/sounds/ding.wav",
  chime: "assets/sounds/chime.wav",
  bell: "assets/sounds/bell.wav",
};

function playSound(name) {
  const source = SOUNDS[name];
  if (!source) return;

  try {
    timerSound.src = source;
    timerSound.currentTime = 0;
    timerSound.play().catch(() => {});
  } catch (error) {
    /* El navegador puede bloquear el audio; el aviso visual sigue funcionando. */
  }
}

function requestNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "default") return;

  try {
    const permissionRequest = Notification.requestPermission();
    if (permissionRequest && typeof permissionRequest.catch === "function") {
      permissionRequest.catch(() => {});
    }
  } catch (error) {
    /* La app sigue funcionando sin notificaciones. */
  }
}

function notifyFinished() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification("Sesión completada", {
      body: `Tu sesión de ${MODE_LABELS[
        currentMode
      ].toLowerCase()} ha terminado.`,
    });
  } catch (error) {
    /* Silencio: la notificación es opcional. */
  }
}

/* ---------- Modos ---------- */
function setMode(mode) {
  if (mode === currentMode) return;
  if (timerState === "running" || timerState === "paused") return;

  currentMode = mode;
  modeFocusBtn.classList.toggle("active", mode === "focus");
  modeBreakBtn.classList.toggle("active", mode === "break");
  modeFocusBtn.setAttribute("aria-pressed", String(mode === "focus"));
  modeBreakBtn.setAttribute("aria-pressed", String(mode === "break"));
  timerMinutesInput.value = MODE_DEFAULTS[mode];
  resetTimer();
}

modeFocusBtn.addEventListener("click", () => setMode("focus"));
modeBreakBtn.addEventListener("click", () => setMode("break"));

timerMinutesInput.addEventListener("change", () => {
  if (timerState === "running" || timerState === "paused") return;

  const minutes = clampMinutes(timerMinutesInput.value);
  timerMinutesInput.value = minutes;
  timerTotal = minutes * 60;
  timerRemaining = timerTotal;
});

startTimerBtn.addEventListener("click", startTimer);
pauseTimerBtn.addEventListener("click", pauseTimer);
resetTimerBtn.addEventListener("click", resetTimer);

/* ---------- Fondos ---------- */
const BACKGROUNDS = [
  {
    id: "bg-urbano",
    name: "Urbano Nocturno",
    image: "assets/backgrounds/bg-urbano.png",
    thumb: "assets/backgrounds/thumbs/bg-urbano.webp",
    gradient:
      "radial-gradient(900px circle at 50% 38%, rgba(192, 132, 252, 0.10), transparent 48%)",
  },
  {
    id: "bg-azul",
    name: "Azul Profundo",
    image: "assets/backgrounds/bg-azul.png",
    thumb: "assets/backgrounds/thumbs/bg-azul.webp",
    gradient:
      "radial-gradient(900px circle at 50% 38%, rgba(56, 189, 248, 0.10), transparent 48%)",
  },
  {
    id: "bg-purpura",
    name: "Púrpura",
    image: "assets/backgrounds/bg-purpura.png",
    thumb: "assets/backgrounds/thumbs/bg-purpura.webp",
    gradient:
      "radial-gradient(900px circle at 50% 38%, rgba(168, 85, 247, 0.10), transparent 48%)",
  },
  {
    id: "bg-verde",
    name: "Esmeralda",
    image: "assets/backgrounds/bg-verde.png",
    thumb: "assets/backgrounds/thumbs/bg-verde.webp",
    gradient:
      "radial-gradient(900px circle at 50% 38%, rgba(16, 185, 129, 0.10), transparent 48%)",
  },
  {
    id: "bg-naranja",
    name: "Ámbar",
    image: "assets/backgrounds/bg-naranja.png",
    thumb: "assets/backgrounds/thumbs/bg-naranja.webp",
    gradient:
      "radial-gradient(900px circle at 50% 38%, rgba(245, 158, 11, 0.10), transparent 48%)",
  },
  {
    id: "bg-rosa",
    name: "Rosa",
    image: "assets/backgrounds/bg-rosa.png",
    thumb: "assets/backgrounds/thumbs/bg-rosa.webp",
    gradient:
      "radial-gradient(900px circle at 50% 38%, rgba(236, 72, 153, 0.10), transparent 48%)",
  },
  {
    id: "bg-wallhaven-1",
    name: "Santuario Nocturno",
    image: "assets/backgrounds/bg-wallhaven-1.webp",
    thumb: "assets/backgrounds/thumbs/bg-wallhaven-1.webp",
    gradient: "none",
  },
  {
    id: "bg-wallhaven-2",
    name: "Rincón Acogedor",
    image: "assets/backgrounds/bg-wallhaven-2.webp",
    thumb: "assets/backgrounds/thumbs/bg-wallhaven-2.webp",
    gradient: "none",
  },
  {
    id: "bg-wallhaven-3",
    name: "Saturno",
    image: "assets/backgrounds/bg-wallhaven-3.webp",
    thumb: "assets/backgrounds/thumbs/bg-wallhaven-3.webp",
    gradient: "none",
  },
  {
    id: "bg-wallhaven-4",
    name: "Cielo de Verano",
    image: "assets/backgrounds/bg-wallhaven-4.webp",
    thumb: "assets/backgrounds/thumbs/bg-wallhaven-4.webp",
    gradient: "none",
  },
];

function renderBgOptions() {
  bgOptions.innerHTML = "";

  BACKGROUNDS.forEach((background, index) => {
    const option = document.createElement("button");
    const isActive = index === currentBgIndex;

    option.type = "button";
    option.className = `bg-option${isActive ? " active" : ""}`;
    const preview = background.thumb || background.image;
    option.style.backgroundImage = preview
      ? `url("${preview}")`
      : background.gradient;
    option.title = background.name;
    option.setAttribute("aria-label", background.name);
    option.setAttribute("aria-pressed", String(isActive));
    option.addEventListener("click", () => selectBackground(index));
    bgOptions.appendChild(option);
  });
}

function updateBgSelection() {
  [...bgOptions.children].forEach((option, index) => {
    const isActive = index === currentBgIndex;
    option.classList.toggle("active", isActive);
    option.setAttribute("aria-pressed", String(isActive));
  });
}

function updateBgPreview(background) {
  if (!bgPreview) return;

  const preview = background.thumb || background.image;
  if (preview) {
    bgPreview.style.backgroundImage = `url("${preview}")`;
  } else {
    bgPreview.style.backgroundImage = background.gradient;
  }
}

function selectBackground(index, { persist = true, close = true } = {}) {
  if (!Number.isInteger(index) || !BACKGROUNDS[index]) return;

  currentBgIndex = index;
  const background = BACKGROUNDS[index];
  const layers = [];

  if (background.gradient && background.gradient !== "none") {
    layers.push(background.gradient);
  }
  if (background.image) layers.push(`url("${background.image}")`);
  bgLayer.style.backgroundImage = layers.length ? layers.join(", ") : "none";

  updateBgPreview(background);
  updateBgSelection();

  if (persist) writeStorage("reloj_bg", String(index));
  if (close && isBgOpen) toggleBgSelector(false);
}

/* ---------- Selector de fondos ---------- */
function toggleBgSelector(open) {
  if (open === isBgOpen) return;
  isBgOpen = open;

  if (open) {
    lastFocusedElement = document.activeElement;
    bgSelector.hidden = false;
    document.body.classList.add("no-scroll");
    pageWrap.inert = true;
    if (skipLink) skipLink.inert = true;

    const activeOption = bgOptions.querySelector(".bg-option.active");
    (activeOption || closeBgBtn).focus({ preventScroll: true });
  } else {
    bgSelector.hidden = true;
    document.body.classList.remove("no-scroll");
    pageWrap.inert = false;
    if (skipLink) skipLink.inert = false;

    if (lastFocusedElement && lastFocusedElement.focus) {
      lastFocusedElement.focus({ preventScroll: true });
    }
    lastFocusedElement = null;
  }

  toggleBgBtn.setAttribute("aria-expanded", String(open));
}

toggleBgBtn.addEventListener("click", () => {
  toggleBgSelector(!isBgOpen);
});

closeBgBtn.addEventListener("click", () => toggleBgSelector(false));

bgSelector.addEventListener("click", (event) => {
  if (event.target === bgSelector) toggleBgSelector(false);
});

document.addEventListener("keydown", (event) => {
  if (!isBgOpen) return;

  if (event.key === "Escape") {
    event.preventDefault();
    toggleBgSelector(false);
    return;
  }

  if (event.key !== "Tab") return;

  const focusables = [...bgSelector.querySelectorAll("button:not(:disabled)")];
  if (!focusables.length) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

/* ---------- Atajos de teclado ---------- */
function isTypingTarget(target) {
  if (!target) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA"
  );
}

function isInteractiveTarget(target) {
  if (!target) return false;
  return (
    isTypingTarget(target) ||
    target.tagName === "BUTTON" ||
    target.tagName === "A"
  );
}

document.addEventListener("keydown", (event) => {
  if (isBgOpen) return;
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

  if (event.code === "Space" || event.key === " " || event.key === "Spacebar") {
    if (isInteractiveTarget(event.target)) return;
    event.preventDefault();
    if (timerState === "running") {
      pauseTimer();
    } else {
      startTimer();
    }
    return;
  }

  if (isTypingTarget(event.target)) return;

  switch (event.key.toLowerCase()) {
    case "r":
      resetTimer();
      break;
    case "t":
      applyTheme(!isDark);
      break;
    case "f":
      setUse24(!use24h);
      break;
    case "b":
      toggleBgSelector(!isBgOpen);
      break;
    default:
      break;
  }
});

/* ---------- Ciclo de vida ---------- */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  if (timerState === "running") {
    tick();
  } else {
    updateDateFormat(new Date());
  }
  if (timerState === "idle") updateClock();
});

/* ---------- Arranque ---------- */
ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
ringProgress.style.strokeDashoffset = "0";

const savedFormat = readStorage("reloj_format");
use24h = savedFormat === "24";
updateFormatButton();
applyTheme(isDark, false);

const savedBg = readStorage("reloj_bg");
if (savedBg !== null) {
  const parsedBg = Number.parseInt(savedBg, 10);
  if (
    Number.isInteger(parsedBg) &&
    parsedBg >= 0 &&
    parsedBg < BACKGROUNDS.length
  ) {
    currentBgIndex = parsedBg;
  }
}

renderBgOptions();
selectBackground(currentBgIndex, { persist: false, close: false });
timerMinutesInput.value = MODE_DEFAULTS[currentMode];
resetTimer();
