require('dotenv').config();
const express = require('express');
const userApi = require('./routes/users');
const fileApi = require('./routes/files');
const messageApi = require('./routes/message');
const Message = require('./models/message');



const cors = require('cors');

const http = require('http');
const WebSocket = require('ws');

require('./config/connect');

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });



const clients = new Map();

wss.on('connection', (ws, req) => {
    const userId = req.url.split('?userId=')[1]; // Extraire userId de l'URL
    if (!userId) {
        ws.close();
        return;
    }

    clients.set(userId, ws);
    console.log(`Utilisateur ${userId} connecté via WebSocket`);



    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            await saveMessage(userId, message);
            broadcastMessage(userId, message);
        } catch (error) {
            console.error("Erreur WebSocket:", error);
        }
    });

    ws.on('close', () => {
        console.log(`Utilisateur ${userId} déconnecté`);
        clients.delete(userId);
    });

    ws.on('error', (error) => {
        console.error('Erreur WebSocket:', error.message);
    });
});

async function saveMessage(senderId, message) {
    try {
        const newMessage = new Message({
            sender: senderId,
            content: message.content,
            targetUserId: message.targetUserId,
        });
        await newMessage.save();
    } catch (error) {
        console.error("Erreur de sauvegarde du message:", error);
    }
}

function broadcastMessage(senderId, message) {
    const targetClient = clients.get(message.targetUserId); // Utilise l'ID du destinataire
    if (targetClient && targetClient.readyState === WebSocket.OPEN) {
        targetClient.send(JSON.stringify({ sender: senderId, content: message.content }));
    }
}



app.use(express.json());


app.use(cors());

app.use('/user', userApi);
app.use('/file', fileApi);
app.use('/message', messageApi);

app.use('/uploads', express.static('uploads'));

const port = process.env.PORT || 4000;


server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});