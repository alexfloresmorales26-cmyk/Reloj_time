/* ========================================
   Reloj Digital - Lógica funcional
   Reloj_time
   ======================================== */

const timeEl = document.getElementById("time");
const periodEl = document.getElementById("period");
const dateEl = document.getElementById("date");

const toggle12Btn = document.getElementById("toggle12");
const toggleThemeBtn = document.getElementById("toggleTheme");

let use24h = false;
let isDark = true;

// Formatear número con cero a la izquierda
function pad(n) {
  return String(n).padStart(2, "0");
}

// Obtener nombre del día en español
const weekdays = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Obtener nombre del mes en español
const months = [
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

function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  let period = "AM";

  if (!use24h) {
    period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12; // medianoche -> 12, mediodía -> 12
  }

  timeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  periodEl.textContent = use24h ? "" : period;

  const weekday = weekdays[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  dateEl.textContent = `${weekday}, ${day} de ${month} de ${year}`;
}

// Actualizar cada segundo
setInterval(updateClock, 1000);
updateClock();

// --- Alternar formato 12 / 24 horas ---
toggle12Btn.addEventListener("click", () => {
  use24h = !use24h;
  updateClock();
});

// --- Alternar modo claro / oscuro ---
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

// Cargar tema guardado
const savedTheme = localStorage.getItem("reloj_theme");
if (savedTheme !== null) {
  isDark = savedTheme === "dark";
  applyTheme(isDark);
} else {
  // Por defecto oscuro
  applyTheme(true);
}

// --- Efecto de mouse para el fondo dinámico ---
document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  document.body.style.setProperty("--mouse-x", `${x}%`);
  document.body.style.setProperty("--mouse-y", `${y}%`);
});
