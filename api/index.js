const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Message = require('./models/Messages');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws');

dotenv.config();

mongoose.connect(process.env.MONGO_URL);

const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));



// ROUTES

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.get("/profile", (req, res) => {
    const token = req.cookies?.token;
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
            if (err) { 
                res.status(401).json('Unauthorized');
            } else {
                res.json(userData);
            }
        });
    } else {
        res.status(401).json('Token not found')
    }

})

app.post("/register", async (req, res) => {
    const {username, password} = req.body;
    try {
        const hashPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
            username, 
            password:hashPassword
        });
        jwt.sign({ userId: createdUser._id, username }, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {sameSite:"none", secure:true}).status(201).json({
                id: createdUser._id,
            });
        });
    } catch (err) {
        if (err) throw err;
        res.status(500).json('error');
    }
});

app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});
    if(foundUser) {
        const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);
        if(isPasswordCorrect) {
            jwt.sign({ userId: foundUser._id, username }, process.env.JWT_SECRET, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {sameSite:"none", secure:true}).status(200).json({
                    id: foundUser._id,
                });
            });
        } else {
            res.status(401).json('Unauthorized');
        }
    }
});


// WEBSOCKETS

const server = app.listen(4000, () => {
    console.log('Server is running on port 4000');
});

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie;
    if(cookies) {
        const token = cookies.split(';').find(str => str.startsWith('token='));
        if(token){
            const tokenValue = token.split('=')[1];
            if (tokenValue) {
                jwt.verify(tokenValue, process.env.JWT_SECRET, {}, (err, userData) => {
                    if (err) { 
                        connection.close();
                    } else {
                        const {userId, username} = userData;
                        connection.userId = userId;
                        connection.username = username;
                    }
                });
            }
        }
    }

    connection.on('message', async (newMessage) => {
        const parsedMessage = JSON.parse(newMessage.toString());
        const {to, message} = parsedMessage;
        if(to && message) {
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient: to,
                message
            });
            [...wss.clients]
                .filter(client => client.userId === to)
                .forEach(client => {  
                    client.send(JSON.stringify({
                        message, 
                        sender:connection.userId,
                        recipient:to,
                        id:messageDoc._id
                    }));  
                });
        }
    });

    [...wss.clients].forEach(client => {  
        client.send(JSON.stringify({
            online: [...wss.clients].map(client => ({userId: client.userId, username: client.username}))
        }));  
    });
});




