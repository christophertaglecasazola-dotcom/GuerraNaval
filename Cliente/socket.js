// =====================================
// CONEXIÓN CON EL SERVIDOR
// =====================================

// socket.js

const socket = io();

// Guardaremos datos de la partida

let salaActual = null;
let jugadorId = null;
let miTurno = false;



// =====================================
// CREAR SALA
// =====================================


document
.getElementById("crearSala")
.addEventListener("click",()=>{


    socket.emit("crearSala");


});




// =====================================
// RECIBIR CÓDIGO DE SALA
// =====================================


socket.on("salaCreada",(data)=>{


    salaActual = data.codigo;

    jugadorId = data.jugador;


    document
    .getElementById("codigoSala")
    .textContent = data.codigo;



    document
    .getElementById("estadoSala")
    .textContent =
    "Comparte este código con otro jugador";


});




// =====================================
// UNIRSE A SALA
// =====================================


document
.getElementById("unirseSala")
.addEventListener("click",()=>{


    let codigo =
    document
    .getElementById("codigoEntrada")
    .value
    .toUpperCase();



    socket.emit(
        "unirseSala",
        {
            codigo:codigo
        }
    );


});





// =====================================
// SALA COMPLETA
// =====================================


socket.on("jugadoresListos",(data)=>{


    salaActual=data.codigo;


    document
    .getElementById("estadoSala")
    .textContent =
    "⚔️ Partida iniciada";


});





// =====================================
// INICIO DEL JUEGO
// =====================================


socket.on("iniciarJuego",(data)=>{


    miTurno=data.turno;


    if(miTurno){


        mostrarMensaje(
            "🎯 Tu turno"
        );


    }
    else{


        mostrarMensaje(
            "⏳ Esperando rival"
        );


    }



});






// =====================================
// ENVIAR DISPARO
// =====================================


function enviarDisparo(fila,columna){


    if(!miTurno){

        mostrarMensaje(
            "Espera tu turno"
        );

        return;

    }



    socket.emit(
        "disparar",
        {
            sala:salaActual,
            fila:fila,
            columna:columna
        }
    );

}





// =====================================
// RESULTADO DEL DISPARO
// =====================================


socket.on("resultadoDisparo",(data)=>{


    if(data.tipo==="impacto"){


        mostrarMensaje(
            "💥 ¡Impacto!"
        );


    }


    if(data.tipo==="agua"){


        mostrarMensaje(
            "🌊 Agua"
        );


    }


    if(data.tipo==="hundido"){


        mostrarMensaje(
            "🔥 ¡Barco destruido!"
        );


    }



});






// =====================================
// CAMBIO DE TURNO
// =====================================


socket.on("cambiarTurno",(data)=>{


    miTurno=data.turno;



    if(miTurno){


        mostrarMensaje(
            "🎯 Tu turno"
        );


    }
    else{


        mostrarMensaje(
            "⏳ Turno enemigo"
        );


    }


});





// =====================================
// VICTORIA
// =====================================


socket.on("ganador",()=>{


    mostrarResultado(
        "🏆 ¡Victoria Total!",
        "🎉 ¡Felicidades comandante! Has destruido toda la flota enemiga.",
        true
    );


});





// =====================================
// DERROTA
// =====================================


socket.on("perdedor",()=>{


    mostrarResultado(
        "⚓ Fin de la batalla",
        "Buena pelea comandante. Tu flota fue destruida.",
        false
    );


});






// =====================================
// FUNCIONES VISUALES
// =====================================


function mostrarMensaje(texto){


    document
    .getElementById("tituloMensaje")
    .textContent=texto;


}




function mostrarResultado(titulo,texto,victoria){


    let panel =
    document
    .getElementById("resultado");


    panel.classList.remove("oculto");



    document
    .getElementById("resultadoTitulo")
    .textContent=titulo;



    document
    .getElementById("resultadoTexto")
    .textContent=texto;



    if(victoria){


        panel.classList.add("victoria");


    }
    else{


        panel.classList.add("derrota");


    }


}
// Te recomiendo unificar o asegurar este orden en tu cliente:

// =====================================
// ESCUCHAS DE SOCKET (CLIENTE)
// =====================================

socket.on("mostrarBarcos", (data) => {
    data.forEach(pos => {
        let casilla = buscarCasillaJugador(pos.fila, pos.columna);
        if (casilla) {
            casilla.classList.add("barco");
            casilla.textContent = "🚢";
        }
    });
});

// Cuando tú disparas y recibes respuesta de tu ataque
socket.on("resultadoDisparo", (data) => {
    let casilla = buscarCasillaEnemiga(data.fila, data.columna);
    if (!casilla) return;

    if (data.tipo === "agua") {
        casilla.classList.add("agua");
        casilla.textContent = "🌊";
        mostrarMensaje("浪 Agua");
    }
    if (data.tipo === "impacto") {
        casilla.classList.add("impacto");
        casilla.textContent = "💥";
        mostrarMensaje("💥 ¡Impacto!");
    }
    if (data.tipo === "hundido") {
        casilla.classList.add("destruido");
        casilla.textContent = "❌";
        mostrarMensaje("🔥 ¡Barco enemigo destruido!");
    }
});

// 🔥 NUEVO: Cuando el enemigo te dispara a ti (Actualiza tu tablero izquierdo "TU FLOTA")
socket.on("resultadoDisparoDefensor", (data) => {
    let casilla = buscarCasillaJugador(data.fila, data.columna);
    if (!casilla) return;

    if (data.tipo === "agua") {
        casilla.classList.add("agua");
        casilla.textContent = "🌊";
        mostrarMensaje("⏳ El enemigo falló. Tu turno.");
    } else if (data.tipo === "impacto" || data.tipo === "hundido") {
        casilla.classList.remove("barco");
        casilla.classList.add("impacto");
        casilla.textContent = "💥";
        mostrarMensaje("⚠️ ¡Nos han dado!");
    }
});

// 🔥 CORREGIDO: Actualizar el estado lateral derecho
socket.on("actualizarFlota", (data) => {
    if (!data.barco) return;

    // Convertimos a minúsculas para asegurar que encuentre el ID del HTML
    let barco = document.getElementById(data.barco.toLowerCase());
    if (!barco) return;

    let barra = barco.querySelector("span");
    if (!barra) return;

    let vida = "";
    for (let i = 0; i < data.vida; i++) {
        vida += "█";
    }
    barra.textContent = vida;

    if (data.destruido) {
        barco.classList.add("destruido");
        barra.textContent = "❌ Destruido";
    }
});