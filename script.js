/* ========================================
   Reloj Digital - Reloj_time
   Lógica funcional
   ======================================== */

const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const dateEl = document.getElementById("date");

const toggleThemeBtn = document.getElementById("toggleTheme");
const toggle12Btn = document.getElementById("toggle12");
const toggleBgBtn = document.getElementById("toggleBg");

const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");
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
const bgCenterBlur = document.getElementById("bgCenterBlur");

let use24h = false;
let isDark = true;
let isBgOpen = false;

let timerSeconds = 0;
let timerInterval = null;
let timerRunning = false;

let currentMode = "focus";
const MODE_DEFAULTS = { focus: 25, break: 5 };

const weekdays = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function pad(n){ return String(n).padStart(2,"0"); }

function updateClock(){
  if (timerRunning) return;
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let period = "AM";
  if (!use24h){
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

function applyTheme(dark, animate = false){
  document.body.classList.toggle("light", !dark);
  toggleThemeBtn.textContent = dark ? "☀️" : "🌙";
  toggleThemeBtn.title = dark ? "Modo claro" : "Modo oscuro";
  toggleThemeBtn.setAttribute("aria-pressed", String(dark));
  localStorage.setItem("reloj_theme", dark ? "dark" : "light");
  if (animate) triggerEmojiFlip(toggleThemeBtn);
}

toggleThemeBtn.addEventListener("click", () => {
  isDark = !isDark;
  applyTheme(isDark, true);
});

const savedTheme = localStorage.getItem("reloj_theme");
isDark = savedTheme !== null ? savedTheme === "dark" : true;
applyTheme(isDark);

toggle12Btn.addEventListener("click", () => {
  use24h = !use24h;
  if (timerRunning){
    const now = new Date();
    periodEl.textContent = use24h ? "" : (now.getHours() >= 12 ? "PM" : "AM");
  } else {
    updateClock();
  }
  triggerEmojiFlip(toggle12Btn);
});

const backgrounds = [
  { id:"bg-urbano", name:"Urbano Nocturno", image:"assets/backgrounds/bg-urbano.png", gradient:"radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(192, 132, 252, 0.10), transparent 45%)" },
  { id:"bg-azul", name:"Azul Profundo", image:"assets/backgrounds/bg-azul.png", gradient:"radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.10), transparent 45%)" },
  { id:"bg-purpura", name:"Púrpura", image:"assets/backgrounds/bg-purpura.png", gradient:"radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(168, 85, 247, 0.10), transparent 45%)" },
  { id:"bg-verde", name:"Esmeralda", image:"assets/backgrounds/bg-verde.png", gradient:"radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.10), transparent 45%)" },
  { id:"bg-naranja", name:"Ámbar", image:"assets/backgrounds/bg-naranja.png", gradient:"radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245, 158, 11, 0.10), transparent 45%)" },
  { id:"bg-rosa", name:"Rosa", image:"assets/backgrounds/bg-rosa.png", gradient:"radial-gradient(900px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(236, 72, 153, 0.10), transparent 45%)" },
  { id:"bg-wallhaven-1", name:"Noche Estrellada", image:"assets/backgrounds/bg-wallhaven-1.png", gradient:"none", blur:true },
  { id:"bg-wallhaven-2", name:"Aurora", image:"assets/backgrounds/bg-wallhaven-2.png", gradient:"none", blur:true },
  { id:"bg-wallhaven-3", name:"Bosque Nocturno", image:"assets/backgrounds/bg-wallhaven-3.png", gradient:"none", blur:true },
  { id:"bg-wallhaven-4", name:"Ciudad Futurista", image:"assets/backgrounds/bg-wallhaven-4.png", gradient:"none", blur:true },
];

let currentBgIndex = 0;

function renderBgOptions(){
  bgOptions.innerHTML = "";
  backgrounds.forEach((bg, index) => {
    const option = document.createElement("div");
    option.className = `bg-option ${index === currentBgIndex ? "active" : ""}`;
    option.style.backgroundImage = bg.image ? `url(${bg.image})` : "none";
    option.title = bg.name;
    option.setAttribute("role","button");
    option.setAttribute("tabindex","0");
    option.setAttribute("aria-label", bg.name);
    option.addEventListener("click", () => selectBackground(index));
    option.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); selectBackground(index); }
    });
    bgOptions.appendChild(option);
  });
}

function selectBackground(index){
  currentBgIndex = index;
  const bg = backgrounds[index];
  if (bg.image){
    if (bg.gradient && bg.gradient !== "none"){
      bgLayer.style.backgroundImage = `url(${bg.image}), ${bg.gradient}`;
    } else {
      bgLayer.style.backgroundImage = `url(${bg.image})`;
    }
  } else {
    bgLayer.style.backgroundImage = bg.gradient;
  }
  if (bg.blur) { bgLayer.classList.add("bg-blur"); bgCenterBlur.classList.add("active"); }
  else { bgLayer.classList.remove("bg-blur"); bgCenterBlur.classList.remove("active"); }
  updateBgPreview(bg);
  localStorage.setItem("reloj_bg", index);
  renderBgOptions();
  toggleBgSelector(false);
}

function updateBgPreview(bg){
  if (!bgPreview) return;
  if (bg.image){
    bgPreview.style.backgroundImage = `url(${bg.image})`;
    bgPreview.style.backgroundSize = "cover";
    bgPreview.style.backgroundPosition = "center";
  } else {
    bgPreview.style.backgroundImage = bg.gradient;
  }
  if (bg.blur) bgPreview.classList.add("has-blur");
  else bgPreview.classList.remove("has-blur");
}

function toggleBgSelector(open){
  isBgOpen = open;
  bgSelector.hidden = !open;
  toggleBgBtn.setAttribute("aria-expanded", String(open));
}

toggleBgBtn.addEventListener("click", () => {
  toggleBgSelector(!isBgOpen);
  triggerEmojiFlip(toggleBgBtn);
});

closeBgBtn.addEventListener("click", () => toggleBgSelector(false));
bgSelector.addEventListener("click", (e) => { if (e.target === bgSelector) toggleBgSelector(false); });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isBgOpen) toggleBgSelector(false);
});

const savedBg = localStorage.getItem("reloj_bg");
if (savedBg !== null){
  currentBgIndex = parseInt(savedBg, 10);
  if (isNaN(currentBgIndex) || currentBgIndex < 0 || currentBgIndex >= backgrounds.length) currentBgIndex = 0;
} else {
  currentBgIndex = 0;
}
renderBgOptions();
selectBackground(currentBgIndex);

document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  document.body.style.setProperty("--mouse-x", `${x}%`);
  document.body.style.setProperty("--mouse-y", `${y}%`);
});

const SOUNDS = { none:null, ding:"assets/sounds/ding.wav", chime:"assets/sounds/chime.wav", bell:"assets/sounds/bell.wav" };

function formatTimer(seconds){
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

function clampMinutes(value){
  const n = parseInt(value, 10);
  if (isNaN(n)) return MODE_DEFAULTS[currentMode];
  return Math.min(120, Math.max(1, n));
}

function updateTimerDisplay(){
  if (!timerRunning) return;
  timeEl.textContent = formatTimer(timerSeconds);
}

function playSound(name){
  const src = SOUNDS[name];
  if (!src) return;
  try {
    timerSound.src = src;
    timerSound.currentTime = 0;
    timerSound.play().catch(() => {});
  } catch (err) {
    console.warn("No se pudo reproducir el sonido:", err);
  }
}

function startTimer(){
  if (timerRunning) return;
  if (timerSeconds === 0){
    const mins = clampMinutes(timerMinutesInput.value);
    timerSeconds = mins * 60;
    timerMinutesInput.value = mins;
  }
  if ("Notification" in window && Notification.permission === "default"){
    Notification.requestPermission().catch(() => {});
  }
  timerRunning = true;
  startTimerBtn.disabled = true;
  pauseTimerBtn.disabled = false;
  resetTimerBtn.disabled = false;
  timerMinutesInput.disabled = true;
  periodEl.textContent = "";
  clearInterval(clockInterval);
  clockInterval = null;
  timerInterval = setInterval(() => {
    if (timerSeconds > 0){
      timerSeconds--;
      updateTimerDisplay();
    } else {
      finishTimer();
    }
  }, 1000);
  updateTimerDisplay();
}

function pauseTimer(){
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  if (!clockInterval){
    clockInterval = setInterval(updateClock, 1000);
    updateClock();
  }
}

function resetTimer(){
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  const mins = clampMinutes(timerMinutesInput.value || MODE_DEFAULTS[currentMode]);
  timerMinutesInput.value = mins;
  timerSeconds = mins * 60;
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = true;
  timerMinutesInput.disabled = false;
  if (!clockInterval){
    clockInterval = setInterval(updateClock, 1000);
    updateClock();
  } else {
    updateClock();
  }
}

function setMode(mode){
  if (mode === currentMode) return;
  currentMode = mode;
  modeFocusBtn.classList.toggle("active", mode === "focus");
  modeBreakBtn.classList.toggle("active", mode === "break");
  modeFocusBtn.setAttribute("aria-pressed", mode === "focus");
  modeBreakBtn.setAttribute("aria-pressed", mode === "break");
  timerMinutesInput.value = MODE_DEFAULTS[mode];
  resetTimer();
}

modeFocusBtn.addEventListener("click", () => setMode("focus"));
modeBreakBtn.addEventListener("click", () => setMode("break"));

timerMinutesInput.addEventListener("change", () => {
  if (!timerRunning){
    const mins = clampMinutes(timerMinutesInput.value);
    timerMinutesInput.value = mins;
    timerSeconds = mins * 60;
  }
});

function finishTimer(){
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  const selectedSound = soundSelect.value;
  playSound(selectedSound);
  timeEl.classList.add("timer-flash");
  setTimeout(() => timeEl.classList.remove("timer-flash"), 500);
  if ("Notification" in window && Notification.permission === "granted"){
    try { new Notification("Reloj_time", { body: "Tu sesión ha terminado." }); }
    catch (err){}
  }
  startTimerBtn.disabled = false;
  pauseTimerBtn.disabled = true;
  resetTimerBtn.disabled = false;
  timerMinutesInput.disabled = false;
  setTimeout(() => {
    if (!clockInterval) clockInterval = setInterval(updateClock, 1000);
    updateClock();
  }, 500);
}

startTimerBtn.addEventListener("click", startTimer);
pauseTimerBtn.addEventListener("click", pauseTimer);
resetTimerBtn.addEventListener("click", resetTimer);

resetTimer();

function triggerEmojiFlip(btn){
  btn.setAttribute("data-state-change", "");
  btn.addEventListener("animationend", () => {
    btn.removeAttribute("data-state-change");
  }, { once: true });
}

document.addEventListener("keydown", (e) => {
  const tag = (e.target && e.target.tagName) || "";
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
  switch (e.key){
    case " ":
    case "Spacebar":
      e.preventDefault();
      if (timerRunning) pauseTimer(); else startTimer();
      break;
    case "r":
    case "R":
      resetTimer();
      break;
    case "t":
    case "T":
      isDark = !isDark;
      applyTheme(isDark, true);
      break;
    case "f":
    case "F":
      use24h = !use24h;
      if (timerRunning){
        const now = new Date();
        periodEl.textContent = use24h ? "" : (now.getHours() >= 12 ? "PM" : "AM");
      } else {
        updateClock();
      }
      triggerEmojiFlip(toggle12Btn);
      break;
    case "b":
    case "B":
      toggleBgSelector(!isBgOpen);
      triggerEmojiFlip(toggleBgBtn);
      break;
    default:
      break;
  }
});

const hero = document.querySelector(".hero");
if (hero){
  void hero.offsetHeight;
  hero.setAttribute("data-enter", "");
}
