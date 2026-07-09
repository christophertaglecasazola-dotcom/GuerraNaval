// ==============================
// CONFIGURACIÓN
// ==============================

const TAMANO = 10;

// Matriz del tablero
let tablero = [];

// Referencias HTML
const grid = document.getElementById("grid");
const mensaje = document.getElementById("mensaje");

// ==============================
// CREAR TABLERO
// ==============================

function crearTablero() {

    tablero = [];

    grid.innerHTML = "";

    for (let fila = 0; fila < TAMANO; fila++) {

        tablero[fila] = [];

        for (let columna = 0; columna < TAMANO; columna++) {

            tablero[fila][columna] = 0;

            const casilla = document.createElement("div");

            casilla.classList.add("casilla");

            casilla.dataset.fila = fila;
            casilla.dataset.columna = columna;

            casilla.addEventListener("click", clickCasilla);

            grid.appendChild(casilla);

        }

    }

}

// ==============================
// CLICK EN UNA CASILLA
// ==============================

function clickCasilla(evento) {

    const fila = Number(evento.target.dataset.fila);
    const columna = Number(evento.target.dataset.columna);

    mensaje.textContent =
        `Seleccionaste (${fila}, ${columna})`;

    // De momento solo cambia el color.
    // Después enviaremos el disparo por Socket.IO.

    evento.target.classList.add("agua");

    console.log("Fila:", fila);
    console.log("Columna:", columna);

}

// ==============================
// ACTUALIZAR MENSAJE
// ==============================

function cambiarMensaje(texto){

    mensaje.textContent = texto;

}

// ==============================
// INICIO
// ==============================

crearTablero();