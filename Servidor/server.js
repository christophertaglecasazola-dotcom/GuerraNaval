// server.js


const express =
require("express");


const http =
require("http");


const {Server} =
require("socket.io");



const {

crearSala,

unirSala,

obtenerSala

}=require("./salas");



const {

crearFlota,

disparar,

gano

}=require("./juego");





const app =
express();



const servidor =
http.createServer(app);



const io =
new Server(servidor,{
    cors:{
        origin:"*"
    }
});





let partidas={};






io.on(
"connection",
(socket)=>{


console.log(
"Jugador conectado:",
socket.id
);




// CREAR SALA

socket.on("crearSala", () => {

    console.log("================================");
    console.log("Evento crearSala recibido");
    console.log("Jugador:", socket.id);

    let codigo = crearSala(socket);

    console.log("Código generado:", codigo);

    socket.join(codigo);

    socket.emit("salaCreada", {
        codigo: codigo,
        jugador: socket.id
    });

    console.log("Evento salaCreada enviado");
    console.log("================================");

});



// UNIR SALA


socket.on(
"unirseSala",
(data)=>{


let sala =
unirSala(
data.codigo,
socket
);



if(!sala){


socket.emit(
"errorSala",
"Codigo incorrecto"
);


return;


}





socket.join(
data.codigo
);



let juego1 =
crearFlota();



let juego2 =
crearFlota();




partidas[data.codigo]={


jugador1:sala.jugador1,


jugador2:sala.jugador2,



tableros:{


[sala.jugador1]:juego1,


[sala.jugador2]:juego2


},



turno:sala.jugador1


};





io.to(data.codigo)
.emit(
"jugadoresListos",
{
codigo:data.codigo
}
);






io.to(sala.jugador1)
.emit(
"iniciarJuego",
{
turno:true
}
);



io.to(sala.jugador2)
.emit(
"iniciarJuego",
{
turno:false
}
);





});








// DISPARO


socket.on(
"disparar",
(data)=>{


let partida =
partidas[data.sala];



if(!partida)
return;




if(
partida.turno !== socket.id
){

return;

}





let enemigo =
partida.jugador1===socket.id
?
partida.jugador2
:
partida.jugador1;






let juego =
partida.tableros[enemigo];




let resultado =
disparar(
juego,
data.fila,
data.columna
);






io.to(socket.id)
.emit(
"resultadoDisparo",
{

...resultado,

fila:data.fila,

columna:data.columna

}

);






if(
gano(juego)
){


io.to(socket.id)
.emit(
"ganador"
);



io.to(enemigo)
.emit(
"perdedor"
);



return;


}






// Si fue agua cambia turno

if(resultado.tipo==="agua"){



partida.turno=enemigo;



io.to(partida.jugador1)
.emit(
"cambiarTurno",
{
turno:
partida.turno===partida.jugador1
}
);



io.to(partida.jugador2)
.emit(
"cambiarTurno",
{
turno:
partida.turno===partida.jugador2
}
);



}



});






socket.on(
"disconnect",
()=>{


console.log(
"Jugador desconectado"
);


});



});







servidor.listen(
3000,
()=>{


console.log(
"--------------------------------"
);


console.log(
"Servidor iniciado"
);


console.log(
"http://localhost:3000"
);


console.log(
"--------------------------------"
);


});