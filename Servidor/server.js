const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Puerto
const PORT = 3000;

// Servir la carpeta cliente
app.use(express.static(path.join(__dirname, "../cliente")));

// ============================
// SALAS
// ============================

const salas = {};

// ============================
// GENERAR CÓDIGO
// ============================

function generarCodigo() {

    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let codigo = "";

    for (let i = 0; i < 6; i++) {

        codigo += caracteres.charAt(
            Math.floor(Math.random() * caracteres.length)
        );

    }

    return codigo;

}

// ============================
// SOCKET.IO
// ============================

io.on("connection", (socket) => {

    console.log("Jugador conectado:", socket.id);

    // -------------------------
    // CREAR SALA
    // -------------------------

    socket.on("crearSala", () => {

        let codigo;

        do {

            codigo = generarCodigo();

        } while (salas[codigo]);

        salas[codigo] = {

            jugadores: [socket.id]

        };

        socket.join(codigo);

        socket.emit("salaCreada", codigo);

        console.log("Sala creada:", codigo);

    });

    // -------------------------
    // UNIRSE
    // -------------------------

    socket.on("unirseSala", (codigo) => {

        const sala = salas[codigo];

        if (!sala) {

            socket.emit("errorSala", "La sala no existe.");

            return;

        }

        if (sala.jugadores.length >= 2) {

            socket.emit("errorSala", "La sala está llena.");

            return;

        }

        sala.jugadores.push(socket.id);

        socket.join(codigo);

        io.to(codigo).emit("inicioJuego");

        console.log("Jugador unido:", codigo);

    });

    // -------------------------
    // DISPAROS
    // -------------------------

    socket.on("disparo", (datos) => {

        const rooms = [...socket.rooms];

        const sala = rooms.find(r => r !== socket.id);

        if (!sala) return;

        socket.to(sala).emit("disparoRecibido", datos);

    });

    // -------------------------
    // DESCONECTAR
    // -------------------------

    socket.on("disconnect", () => {

        console.log("Jugador desconectado:", socket.id);

        for (const codigo in salas) {

            salas[codigo].jugadores =
                salas[codigo].jugadores.filter(
                    id => id !== socket.id
                );

            if (salas[codigo].jugadores.length === 0) {

                delete salas[codigo];

                console.log("Sala eliminada:", codigo);

            }

        }

    });

});

// ============================
// INICIAR SERVIDOR
// ============================

server.listen(PORT, () => {

    console.log("--------------------------------");

    console.log("Servidor iniciado");

    console.log("http://localhost:3000");

    console.log("--------------------------------");

});