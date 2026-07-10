// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const { crearSala, unirSala, obtenerSala } = require("./salas");
const { crearFlota, disparar, gano } = require("./juego");

const app = express();
const rutaRaiz = path.resolve(__dirname, "..");

app.use(express.static(rutaRaiz));

app.get("/", (req, res) => {
    res.sendFile(path.join(rutaRaiz, "index.html"));
});

const servidor = http.createServer(app);
const io = new Server(servidor, {
    cors: { origin: "*" }
});

let partidas = {};

io.on("connection", (socket) => {
    console.log("Jugador conectado:", socket.id);

    socket.on("crearSala", () => {
        let codigo = crearSala(socket);
        socket.join(codigo);
        socket.emit("salaCreada", { codigo: codigo, jugador: socket.id });
    });

    // 🔥 CORREGIDO: Enviar barcos individuales al iniciar
    socket.on("unirseSala", (data) => {
        let sala = unirSala(data.codigo, socket);
        if (!sala) {
            socket.emit("errorSala", "Codigo incorrecto");
            return;
        }

        socket.join(data.codigo);

        let juego1 = crearFlota();
        let juego2 = crearFlota();

        partidas[data.codigo] = {
            jugador1: sala.jugador1,
            jugador2: sala.jugador2,
            tableros: {
                [sala.jugador1]: juego1,
                [sala.jugador2]: juego2
            },
            turno: sala.jugador1
        };

        // Extraer posiciones planas [{fila, columna}] para cada cliente
        const posicionesJ1 = juego1.barcos.flatMap(b => b.posiciones);
        const posicionesJ2 = juego2.barcos.flatMap(b => b.posiciones);

        // Envío directo a cada socket
        io.to(sala.jugador1).emit("mostrarBarcos", posicionesJ1);
        io.to(sala.jugador2).emit("mostrarBarcos", posicionesJ2);

        io.to(data.codigo).emit("jugadoresListos", { codigo: data.codigo });
        io.to(sala.jugador1).emit("iniciarJuego", { turno: true });
        io.to(sala.jugador2).emit("iniciarJuego", { turno: false });
    });

    // 🔥 CORREGIDO: Envío de impactos cruzados (Atacante y Defensor)
    socket.on("disparar", (data) => {
        let partida = partidas[data.sala];
        if (!partida || partida.turno !== socket.id) return;

        let enemigo = partida.jugador1 === socket.id ? partida.jugador2 : partida.jugador1;
        let juego = partida.tableros[enemigo];

        let resultado = disparar(juego, data.fila, data.columna);

        // 1. Respuesta al atacante (para que pinte el tablero derecho "ENEMIGO")
        io.to(socket.id).emit("resultadoDisparo", {
            ...resultado,
            fila: data.fila,
            columna: data.columna
        });

        // 2. Respuesta al defensor (para que actualice su barra lateral de "MIS BARCOS")
        io.to(enemigo).emit("actualizarFlota", {
            barco: resultado.barco,
            vida: resultado.vida !== undefined ? resultado.vida : 0,
            destruido: resultado.tipo === "hundido"
        });

        // 3. Respuesta al defensor (para que dibuje el fuego/agua en su propio tablero "TU FLOTA")
        io.to(enemigo).emit("resultadoDisparoDefensor", {
            fila: data.fila,
            columna: data.columna,
            tipo: resultado.tipo
        });

        if (gano(juego)) {
            io.to(socket.id).emit("ganador");
            io.to(enemigo).emit("perdedor");
            return;
        }

        if (resultado.tipo === "agua") {
            partida.turno = enemigo;

            io.to(partida.jugador1).emit("cambiarTurno", {
                turno: partida.turno === partida.jugador1
            });
            io.to(partida.jugador2).emit("cambiarTurno", {
                turno: partida.turno === partida.jugador2
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("Jugador desconectado");
    });
});

servidor.listen(3000, "0.0.0.0", () => {
    console.log("Servidor iniciado en http://localhost:3000");
});