// juego.js


const barcosBase = [

    {
        nombre:"acorazado",
        tamaño:6,
        vida:6
    },

    {
        nombre:"portaaviones",
        tamaño:5,
        vida:5
    },

    {
        nombre:"buque",
        tamaño:4,
        vida:4
    },

    {
        nombre:"crucero",
        tamaño:3,
        vida:3
    },

    {
        nombre:"destructor",
        tamaño:2,
        vida:2
    }

];



// Crear tablero vacío

function crearTablero(){

    let tablero=[];


    for(let i=0;i<10;i++){

        tablero.push(
            Array(10).fill(null)
        );

    }


    return tablero;

}





// Crear barcos aleatorios

function crearFlota(){


    let tablero = crearTablero();


    let barcos=[];



    barcosBase.forEach(base=>{


        let colocado=false;



        while(!colocado){


            let horizontal =
            Math.random() < 0.5;



            let fila =
            Math.floor(Math.random()*10);



            let columna =
            Math.floor(Math.random()*10);



            let posiciones=[];



            for(
                let i=0;
                i<base.tamaño;
                i++
            ){


                let f =
                horizontal ? fila : fila+i;


                let c =
                horizontal ? columna+i : columna;



                if(
                    f>=10 ||
                    c>=10 ||
                    tablero[f][c]
                ){

                    posiciones=[];

                    break;

                }


                posiciones.push(
                    {
                        fila:f,
                        columna:c
                    }
                );


            }



            if(posiciones.length===base.tamaño){


                posiciones.forEach(pos=>{


                    tablero
                    [pos.fila]
                    [pos.columna]=base.nombre;


                });



                barcos.push({

                    nombre:base.nombre,

                    vida:base.vida,

                    posiciones:posiciones

                });



                colocado=true;


            }


        }


    });



    return {

        tablero,
        barcos

    };


}







// Procesar disparo


function disparar(juego,fila,columna){


    let barcoEncontrado=null;



    for(let barco of juego.barcos){



        let existe =
        barco.posiciones.find(
            p=>
            p.fila===fila &&
            p.columna===columna
        );



        if(existe){

            barcoEncontrado=barco;

            break;

        }

    }




    if(!barcoEncontrado){


        return {

            tipo:"agua"

        };


    }





    barcoEncontrado.vida--;



    if(barcoEncontrado.vida<=0){



        return {

            tipo:"hundido",

            barco:
            barcoEncontrado.nombre

        };


    }





    return {


        tipo:"impacto",

        barco:
        barcoEncontrado.nombre,

        vida:
        barcoEncontrado.vida


    };


}







// Revisar ganador


function gano(juego){


    return juego.barcos.every(
        barco=>barco.vida<=0
    );


}




module.exports={

    crearFlota,

    disparar,

    gano

};