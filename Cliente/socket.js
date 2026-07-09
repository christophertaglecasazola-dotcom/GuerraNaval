// =====================================
// CONEXIÓN CON EL SERVIDOR
// =====================================


const socket = io("http://localhost:3000");


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