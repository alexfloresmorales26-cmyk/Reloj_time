# Reloj Digital / Reloj_time

Reloj digital con temporizador tipo Pomodoro, fondos nocturnos personalizables y modo claro/oscuro. Inspirado en [pomodorotimer.online](https://pomodorotimer.online/es).

![Reloj Digital](assets/backgrounds/bg-urbano.png)

## Características

### 🕐 Reloj en tiempo real
- Formato 12h / 24h (botón 🕒)
- Fecha en español (día, mes, año)
- Actualización cada segundo

### ⏱️ Temporizador de sesión (Pomodoro)
- **Modo Concentración** 🎯 — 25 min por defecto
- **Modo Descanso** ☕ — 5 min por defecto
- Controles: Iniciar ▶️ / Pausar ⏸️ / Reiniciar 🔄
- Input de minutos personalizable (1-120)
- Sonido al terminar: Ding / Chime / Campana / Ninguno
- Notificación del navegador + flash visual al finalizar
- El reloj se pausa automáticamente mientras el temporizador corre

### 🎨 Fondos traseros (10 opciones)
Accesibles desde el botón 🖼️ en la barra inferior:

**Degradados con efecto mouse-tracking:**
1. **Urbano Nocturno** (predeterminado) — ciudad nocturna con glow violeta
2. **Azul Profundo**
3. **Púrpura**
4. **Esmeralda**
5. **Ámbar**
6. **Rosa**

**Imágenes Wallhaven con efecto *frosted glass* (desenfoque):**
7. **Noche Estrellada**
8. **Aurora**
9. **Bosque Nocturno**
10. **Ciudad Futurista**

### 🌙 Modo claro / oscuro
- Botón 🌙 / ☀️ en la barra inferior
- Persistencia en `localStorage`
- Adapta todos los colores y el efecto de fondo

### 💫 Detalles de craft
- Easings personalizados (`--ease-out`, `--ease-in-out`, `--ease-drawer`)
- Transiciones por propiedad (nunca `transition: all`)
- Solo `transform`/`opacity` animados (60fps garantizado)
- `scale(0.97)` en `:active` (feedback táctil)
- `@starting-style` para entrada del hero
- `@media (prefers-reduced-motion: reduce)` respetado
- `@media (hover: hover) and (pointer: fine)` para hover solo en desktop
- Accesibilidad: `aria-pressed`, `aria-expanded`, `aria-label`, skip link

## Uso

### Opción A: Servidor local (recomendado)
```bash
cd "Reloj digital"
python3 -m http.server 8080
# Abre http://localhost:8080
```

### Opción B: Abrir directo
```bash
xdg-open index.html
# O doble click en el archivo
```
> ⚠️ Al abrir como `file://` algunas funciones pueden fallar (notificaciones, sonidos, CORS). Usa la Opción A para experiencia completa.

## Atajos de teclado
| Tecla | Acción |
|-------|--------|
| `Espacio` | Iniciar / Pausar temporizador |
| `R` | Reiniciar temporizador |
| `T` | Alternar tema claro/oscuro |
| `F` | Alternar formato 12/24h |
| `B` | Abrir selector de fondos |

## Estructura del proyecto
```
Reloj digital/
├── index.html          # Estructura semántica
├── style.css           # Estilos + tokens + animaciones
├── script.js           # Lógica (reloj, timer, fondos, tema)
├── assets/
│   ├── backgrounds/    # 10 fondos (6 gradientes + 4 wallhaven)
│   └── sounds/         # ding.wav, chime.wav, bell.wav
└── README.md
```

## Personalización

### Cambiar duraciones por defecto
En `script.js`:
```js
const MODE_DEFAULTS = {
  focus: 25,  // minutos concentración
  break: 5,   // minutos descanso
};
```

### Agregar más fondos
1. Pon la imagen en `assets/backgrounds/`
2. En `script.js`, agrega entrada al array `backgrounds`:
```js
{
  id: "bg-mi-fondo",
  name: "Mi Fondo",
  image: "assets/backgrounds/mi-fondo.png",
  gradient: "none",        // o un radial-gradient
  blur: true               // true = frosted glass, false = gradiente mouse
}
```

### Cambiar colores (tokens CSS)
En `style.css`, sección `:root`:
```css
:root {
  --accent: #c084fc;           // color principal (violeta)
  --accent-glow: rgba(192,132,252,.35);
  --bg-color: #0a0b14;         // fondo base oscuro
  --text-color: #ffffff;
  --text-muted: #9aa3b8;
  /* ... */
}
```

## Tecnologías
- HTML5 semántico + CSS3 + Vanilla JS (ES6+)
- Sin dependencias, sin build step
- Fuentes del sistema (`ui-monospace`, `Segoe UI`, etc.)

## Licencia
MIT — Úsalo, modifícalo, compártelo.