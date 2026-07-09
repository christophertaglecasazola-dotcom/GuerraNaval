// =====================================
// CONEXIÓN CON EL SERVIDOR
// =====================================

const socket = io();

// Elementos HTML
const btnCrear = document.getElementById("crearSala");
const btnUnirse = document.getElementById("unirseSala");

const inputCodigo = document.getElementById("codigoSala");
const codigoGenerado = document.getElementById("codigoGenerado");


// =====================================
// CREAR SALA
// =====================================

btnCrear.addEventListener("click", () => {

    socket.emit("crearSala");

});


// =====================================
// UNIRSE A UNA SALA
// =====================================

btnUnirse.addEventListener("click", () => {

    const codigo = inputCodigo.value.trim().toUpperCase();

    if(codigo === ""){

        alert("Ingrese un código.");

        return;

    }

    socket.emit("unirseSala", codigo);

});


// =====================================
// RESPUESTA DEL SERVIDOR
// =====================================

// Código generado

socket.on("salaCreada",(codigo)=>{

    codigoGenerado.innerHTML =
    "Código de sala: <b>" + codigo + "</b>";

    cambiarMensaje("Esperando al segundo jugador...");

});


// Ambos jugadores conectados

socket.on("inicioJuego",()=>{

    cambiarMensaje("¡Jugador conectado! Comienza la partida.");

});


// Error

socket.on("errorSala",(mensaje)=>{

    alert(mensaje);

});


// =====================================
// DISPARAR
// =====================================

function enviarDisparo(fila,columna){

    socket.emit("disparo",{

        fila:fila,
        columna:columna

    });

}


// =====================================
// RECIBIR DISPARO
// =====================================

socket.on("disparoRecibido",(datos)=>{

    console.log("Disparo recibido:",datos);

});


// =====================================
// RESULTADO DEL DISPARO
// =====================================

socket.on("resultadoDisparo",(datos)=>{

    console.log(datos);

});