import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import cors from 'cors';

const APP_PORT = 3002;
const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new socketIo(server, {
    cors: {
        origin: '*',
    },
});

const users = {};

function getSocketId(username) {
    return users[username];
}

function getUsername(socketId) {
    return Object.keys(users).find(key => users[key] === socketId);
}

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
        const username = getUsername(socket.id);
        if (username) {
            delete users[username];
            io.emit('login-acknowledge', Object.keys(users));
        }
    });

    socket.on('login', (data) => {
        users[data.username] = socket.id;
        io.emit('login-acknowledge', Object.keys(users));
    });

    socket.on('group-message', (data) => {
        const username = getUsername(socket.id);
        if (username) {
            io.emit('group-message', data);
        }
    });

    socket.on('private-message', (data) => {
        const toSocketId = getSocketId(data.to);
        if (toSocketId) {
            io.to(toSocketId).emit('private-message', data);
        }
    });
});

server.listen(APP_PORT, () => {
    console.log(`Listening on *:${APP_PORT}`);
});
