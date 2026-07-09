// =====================================
// VARIABLES
// =====================================


const tableroJugador =
document.getElementById("tableroJugador");


const tableroEnemigo =
document.getElementById("tableroEnemigo");



const tamaño = 10;



let casillasEnemigas = [];




// =====================================
// CREAR TABLEROS
// =====================================


crearTablero(tableroJugador,false);

crearTablero(tableroEnemigo,true);





function crearTablero(tablero,enemigo){


    for(let fila=0; fila<tamaño; fila++){


        for(let columna=0; columna<tamaño; columna++){



            let casilla =
            document.createElement("div");



            casilla.classList.add("casilla");



            casilla.dataset.fila=fila;

            casilla.dataset.columna=columna;




            if(enemigo){


                casilla.addEventListener(
                    "click",
                    ()=>{

                        dispararCasilla(
                            casilla
                        );

                    }
                );


                casillasEnemigas.push(casilla);


            }



            tablero.appendChild(casilla);


        }

    }


}






// =====================================
// DISPARAR
// =====================================


function dispararCasilla(casilla){


    if(
        casilla.classList.contains("agua") ||
        casilla.classList.contains("impacto")
    ){

        return;

    }




    let fila =
    Number(casilla.dataset.fila);



    let columna =
    Number(casilla.dataset.columna);



    enviarDisparo(
        fila,
        columna
    );


}





// =====================================
// RESULTADO DEL SERVIDOR
// =====================================


socket.on(
"resultadoDisparo",
(data)=>{


    let casilla =
    buscarCasillaEnemiga(
        data.fila,
        data.columna
    );



    if(!casilla)
        return;




    if(data.tipo==="agua"){


        casilla.classList.add(
            "agua"
        );


        casilla.textContent="🌊";


    }




    if(data.tipo==="impacto"){


        casilla.classList.add(
            "impacto"
        );


        casilla.textContent="💥";


    }




    if(data.tipo==="hundido"){


        casilla.classList.add(
            "destruido"
        );


        casilla.textContent="❌";


    }



});





// =====================================
// BUSCAR CASILLA
// =====================================


function buscarCasillaEnemiga(fila,columna){


    return casillasEnemigas.find(
        c=>
        Number(c.dataset.fila)===fila
        &&
        Number(c.dataset.columna)===columna
    );


}







// =====================================
// ACTUALIZAR FLOTA
// =====================================


socket.on(
"actualizarFlota",
(data)=>{


    /*
      data ejemplo:

      {
        barco:"acorazado",
        vida:3,
        destruido:false
      }

    */



    let barco =
    document.getElementById(
        data.barco
    );



    if(!barco)
        return;



    let barra =
    barco.querySelector("span");




    let vida = "";



    for(
        let i=0;
        i<data.vida;
        i++
    ){

        vida += "█";

    }




    barra.textContent=vida;




    if(data.destruido){


        barco.classList.add(
            "destruido"
        );


        barra.textContent="❌ Destruido";


    }



});






// =====================================
// RECIBIR TABLERO PROPIO
// =====================================


socket.on(
"mostrarBarcos",
(data)=>{


    /*
      El servidor enviará:

      [
       {
        fila:2,
        columna:4
       }
      ]

    */



    data.forEach(pos=>{


        let casilla =
        buscarCasillaJugador(
            pos.fila,
            pos.columna
        );



        if(casilla){


            casilla.classList.add(
                "barco"
            );


            casilla.textContent="🚢";


        }


    });


});





function buscarCasillaJugador(fila,columna){


    let lista =
    tableroJugador.children;



    for(let casilla of lista){


        if(
            Number(casilla.dataset.fila)===fila
            &&
            Number(casilla.dataset.columna)===columna
        ){

            return casilla;

        }


    }


}






// =====================================
// REINICIAR
// =====================================


document
.getElementById("reiniciar")
.addEventListener(
"click",
()=>{


    location.reload();


});