const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat: ${chatId}`);
    });

    socket.on('newMessage', (message) => {
        const chat = message.chat;
        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach(user => {
            if (user._id == message.sender._id) return;
            socket.in(user._id).emit('messageReceived', message);
        });
    });

    socket.on('typing', (chatId, userId) => {
        socket.in(chatId).emit('typing', userId);
    });

    socket.on('stopTyping', (chatId, userId) => {
        socket.in(chatId).emit('stopTyping', userId);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
