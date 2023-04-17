const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create-room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('join-room', (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
            socket.join(roomId);
            socket.to(roomId).emit('join-room', { roomId, userId: socket.id });
        } else {
            console.log('Room not found');
        }
    });

    socket.on('send-signal', ({ roomId, userId, signal }) => {
        socket.to(userId).emit('receive-signal', { signal, from: socket.id });
    });

    socket.on('send-message', (message) => {
        socket.broadcast.emit('receive-message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Server listening on port 3001');
});
