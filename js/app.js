// ============================================
// RULETA DOBLE - BASTA TECNOLÓGICO
// ============================================

const canvas = document.getElementById("ruleta");
const ctx = canvas.getContext("2d");

// Geometría: todo se calcula a partir del tamaño del canvas
const CENTRO_X = canvas.width / 2;
const CENTRO_Y = canvas.height / 2;
const RADIO_MAX = canvas.width / 2 - 10;
const DOS_PI = Math.PI * 2;
// El puntero está ARRIBA del canvas. En el sistema de ángulos del canvas
// (0 = derecha, crece en sentido horario), "arriba" es -90°, es decir -π/2.
const ANGULO_PUNTERO = -Math.PI / 2;
// Cada anillo ocupa una franja, como fracción del radio máximo
const ANILLOS = {
  letras:     { interno: 0.62, externo: 1.0 },
  categorias: { interno: 0.24, externo: 0.60 },
  centro: 0.21
};

// Ángulo actual de cada ruleta (cada una gira por su cuenta)
let rotacionLetras = 0;
let rotacionCategorias = 0;

// --------------------------------------------
// Parte un texto en 2 líneas como máximo (por espacios)
// --------------------------------------------
function partirTexto(texto) {
  const palabras = texto.split(" ");
  if (palabras.length < 2) return [texto];

  // Busca el corte que deje las dos líneas más parejas
  let mejor = 1;
  let diferencia = Infinity;
  for (let i = 1; i < palabras.length; i++) {
    const a = palabras.slice(0, i).join(" ").length;
    const b = palabras.slice(i).join(" ").length;
    if (Math.abs(a - b) < diferencia) {
      diferencia = Math.abs(a - b);
      mejor = i;
    }
  }
  return [palabras.slice(0, mejor).join(" "), palabras.slice(mejor).join(" ")];
}

// --------------------------------------------
// Dibuja un anillo dividido en segmentos iguales.
// Sirve para CUALQUIER ruleta.
// --------------------------------------------
function dibujarAnillo({ items, radioInterno, radioExterno, rotacion, colorDe, colorTexto, fuente, multilinea = false }) {
  const paso = DOS_PI / items.length;

  items.forEach((texto, i) => {
    const inicio = rotacion + i * paso;
    const fin = inicio + paso;

    // 1) El segmento: un "pedazo de dona"
    ctx.beginPath();
    ctx.arc(CENTRO_X, CENTRO_Y, radioExterno, inicio, fin);
    ctx.arc(CENTRO_X, CENTRO_Y, radioInterno, fin, inicio, true);
    ctx.closePath();
    ctx.fillStyle = colorDe(i);
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2) El texto, rotado hacia el centro del segmento
    ctx.save();
    ctx.translate(CENTRO_X, CENTRO_Y);
    ctx.rotate(inicio + paso / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colorTexto;
    ctx.font = fuente;

    const lineas = multilinea ? partirTexto(texto) : [texto];
    const alto = 15; // separación entre líneas
    lineas.forEach((linea, n) => {
      const desplazamiento = (n - (lineas.length - 1) / 2) * alto;
      ctx.fillText(linea, radioExterno - 12, desplazamiento);
    });
    ctx.restore();
  });
}

// --------------------------------------------
// El círculo central decorativo
// --------------------------------------------
function dibujarCentro() {
  const radio = RADIO_MAX * ANILLOS.centro;

  ctx.beginPath();
  ctx.arc(CENTRO_X, CENTRO_Y, radio, 0, DOS_PI);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "#22d3ee";
  ctx.font = "bold 20px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("BASTA", CENTRO_X, CENTRO_Y);
}

// --------------------------------------------
// Redibuja todo el canvas
// --------------------------------------------
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ruleta externa: letras
  dibujarAnillo({
    items: CONFIG.letras,
    radioInterno: RADIO_MAX * ANILLOS.letras.interno,
    radioExterno: RADIO_MAX * ANILLOS.letras.externo,
    rotacion: rotacionLetras,
    colorDe: (i) => CONFIG.coloresLetras[i % CONFIG.coloresLetras.length],
    colorTexto: "#f1f5f9",
    fuente: "bold 22px 'Segoe UI', sans-serif"
  });

  // Ruleta interna: categorías
  dibujarAnillo({
    items: CONFIG.categorias.map((c) => c.nombre),
    radioInterno: RADIO_MAX * ANILLOS.categorias.interno,
    radioExterno: RADIO_MAX * ANILLOS.categorias.externo,
    rotacion: rotacionCategorias,
    colorDe: (i) => CONFIG.categorias[i].color,
    colorTexto: "#0f172a",
    fuente: "bold 12px 'Segoe UI', sans-serif",
    multilinea: true
  });

  dibujarCentro();
}
// ============================================
// ANIMACIÓN
// ============================================

const btnGirar = document.getElementById("btn-girar");
const resultado = document.getElementById("resultado");
let girando = false;

// Curva de desaceleración: empieza rápido y frena suave.
// t va de 0 (inicio) a 1 (fin); devuelve el avance real, también de 0 a 1.
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

// Deja un ángulo entre 0 y 2π (útil para la etapa 5)
function normalizar(angulo) {
  return ((angulo % DOS_PI) + DOS_PI) % DOS_PI;
}

// Anima varias ruletas a la vez en un solo ciclo de dibujo.
// Cada "giro" dice: desde dónde, hasta dónde, cuánto dura y cómo aplicar el ángulo.
function animarGiros(giros) {
  return new Promise((resolver) => {
    const inicio = performance.now();
    const duracionTotal = Math.max(...giros.map((g) => g.duracion));

    function cuadro(ahora) {
      const transcurrido = Math.max(0, ahora - inicio);

      giros.forEach((g) => {
        const progreso = Math.min(transcurrido / g.duracion, 1);
        g.aplicar(g.desde + (g.hasta - g.desde) * easeOutQuart(progreso));
      });

      dibujar();

      if (transcurrido < duracionTotal) {
        requestAnimationFrame(cuadro);
      } else {
        resolver(); // avisa que terminó
      }
    }

    requestAnimationFrame(cuadro);
  });
}

// Entre "min" y "max" vueltas completas, más un ángulo al azar
function giroAleatorio(minVueltas, maxVueltas) {
  const vueltas = minVueltas + Math.random() * (maxVueltas - minVueltas);
  return vueltas * DOS_PI;
}
// ============================================
// RESULTADO
// ============================================

const dialogo = document.getElementById("dialogo-resultado");
const dialogoLetra = document.getElementById("dialogo-letra");
const dialogoCategoria = document.getElementById("dialogo-categoria");

// Dado el ángulo de una ruleta y su número de segmentos,
// devuelve el índice del segmento que está bajo el puntero.
function indiceBajoPuntero(rotacion, total) {
  const paso = DOS_PI / total;
  // Segmento i ocupa [rotacion + i*paso, rotacion + (i+1)*paso).
  // Buscamos i tal que: ANGULO_PUNTERO - rotacion caiga en [i*paso, (i+1)*paso)
  const relativo = normalizar(ANGULO_PUNTERO - rotacion);
  return Math.floor(relativo / paso);
}

function mostrarResultado(letra, categoria) {
  dialogoLetra.textContent = letra;
  dialogoCategoria.textContent = categoria.nombre;
  dialogo.style.setProperty("--color-categoria", categoria.color);
  dialogo.showModal();

  resultado.textContent = `${letra} + ${categoria.nombre}`;
}

// Clic en el fondo oscuro (fuera de la tarjeta) cierra el diálogo.
// Funciona porque el padding está en el <form>: un clic dentro del contenido
// tiene como target al form o sus hijos, y uno fuera tiene al <dialog> mismo.
dialogo.addEventListener("click", (evento) => {
  if (evento.target === dialogo) dialogo.close();
});

// ============================================
// TEMPORIZADOR
// ============================================

const temporizador = document.getElementById("temporizador");
const tiempoTexto = document.getElementById("temporizador-tiempo");
const barraProgreso = document.getElementById("temporizador-progreso");
const btnBasta = document.getElementById("btn-basta");

const SEGUNDOS_URGENTE = 5; // cuándo empieza a ponerse rojo
let idTemporizador = null;

// Tres pitidos generados con código (sin archivos de audio)
function pitar() {
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((retraso) => {
      const oscilador = audio.createOscillator();
      const volumen = audio.createGain();
      oscilador.type = "square";
      oscilador.frequency.value = 880;
      volumen.gain.value = 0.12;
      oscilador.connect(volumen);
      volumen.connect(audio.destination);
      oscilador.start(audio.currentTime + retraso);
      oscilador.stop(audio.currentTime + retraso + 0.15);
    });
    setTimeout(() => audio.close(), 1500);
  } catch (error) {
    // Sin audio disponible: el juego sigue funcionando igual
  }
}

function detenerTemporizador() {
  cancelAnimationFrame(idTemporizador);
  idTemporizador = null;
}

function ocultarTemporizador() {
  detenerTemporizador();
  temporizador.hidden = true;
}

function terminarTemporizador(seAcaboElTiempo) {
  detenerTemporizador();
  btnBasta.disabled = true;
  temporizador.classList.add("terminado");
  tiempoTexto.textContent = seAcaboElTiempo ? "¡Tiempo!" : "¡BASTA!";
  if (seAcaboElTiempo) pitar();
}

function iniciarTemporizador() {
  if (CONFIG.tiempoRespuesta <= 0) return;

  detenerTemporizador();
  const duracion = CONFIG.tiempoRespuesta * 1000;
  const inicio = performance.now();

  temporizador.hidden = false;
  temporizador.classList.remove("urgente", "terminado");
  btnBasta.disabled = false;

  function cuadro(ahora) {
    const restante = Math.max(0, duracion - (ahora - inicio));
    const segundos = Math.ceil(restante / 1000);

    barraProgreso.style.transform = `scaleX(${restante / duracion})`;
    tiempoTexto.textContent = segundos;
    temporizador.classList.toggle("urgente", segundos <= SEGUNDOS_URGENTE);

    if (restante > 0) {
      idTemporizador = requestAnimationFrame(cuadro);
    } else {
      terminarTemporizador(true);
    }
  }

  idTemporizador = requestAnimationFrame(cuadro);
}

btnBasta.addEventListener("click", () => terminarTemporizador(false));

// Al cerrar el diálogo (botón, Esc o clic afuera) arranca la cuenta
dialogo.addEventListener("close", iniciarTemporizador);

async function girar() {
  if (girando) return; // evita doble clic mientras gira
  girando = true;
  btnGirar.disabled = true;
  resultado.textContent = "Girando...";

  await animarGiros([
    {
      desde: rotacionLetras,
      hasta: rotacionLetras + giroAleatorio(4, 7),
      duracion: CONFIG.duracionGiroLetras,
      aplicar: (valor) => { rotacionLetras = valor; }
    },
    {
      desde: rotacionCategorias,
      hasta: rotacionCategorias - giroAleatorio(3, 6), // sentido contrario
      duracion: CONFIG.duracionGiroCategorias,
      aplicar: (valor) => { rotacionCategorias = valor; }
    }
  ]);

  // Guardamos el ángulo "limpio" para que no crezca sin fin
  rotacionLetras = normalizar(rotacionLetras);
  rotacionCategorias = normalizar(rotacionCategorias);

  const letra = CONFIG.letras[indiceBajoPuntero(rotacionLetras, CONFIG.letras.length)];
  const categoria = CONFIG.categorias[indiceBajoPuntero(rotacionCategorias, CONFIG.categorias.length)];
  mostrarResultado(letra, categoria);
  girando = false;
  btnGirar.disabled = false;
}

dibujar();

btnGirar.addEventListener("click", girar);