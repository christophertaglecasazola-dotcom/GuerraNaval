// salas.js


const salas = {};





function generarCodigo(){


    let caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    let codigo="";



    for(let i=0;i<5;i++){


        codigo +=
        caracteres[
            Math.floor(
                Math.random()
                *
                caracteres.length
            )
        ];


    }



    return codigo;


}






function crearSala(socket){


    let codigo;



    do{


        codigo=generarCodigo();


    }
    while(salas[codigo]);





    salas[codigo]={


        jugador1:socket.id,


        jugador2:null,


        turno:null,


        juegos:{}


    };



    return codigo;


}







function unirSala(codigo,socket){



    let sala =
    salas[codigo];



    if(!sala){

        return false;

    }



    if(sala.jugador2){


        return false;


    }



    sala.jugador2 =
    socket.id;



    return sala;


}






function obtenerSala(codigo){


    return salas[codigo];


}






function eliminarSala(codigo){


    delete salas[codigo];


}







module.exports={

    crearSala,

    unirSala,

    obtenerSala,

    eliminarSala

};