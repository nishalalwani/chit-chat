const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const userRoutes = require('./Routes/userRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const messageRoutes = require('./Routes/messageRoute');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const User = require('./models/userModel');

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log("Server is connected to database")
    } catch (err) {
        console.log("Server is not connected to Database", err.message)
    }
}
connectDb();

app.get("/", (req, res) => {
    res.send("API is running")
})
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes)

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, console.log(`Server is running on port ${PORT}`));

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
    },
    pingTimeout: 60000,
})

let onlineUsers = {};
let socketUserMap = {};
const userIdToSocketMapping= new Map()
const socketToUserIdMapping = new Map()

io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected`);


    socket.on("setup", async(userData) => {
        const userId = userData?.data._id;
        if (userId) {
            socket.join(userId);
            await User.findByIdAndUpdate(userId, {lastSeen:Date.now()})
            onlineUsers[userId] = true;
            socketUserMap[socket.id] = userId;
            io.emit("userOnline", userId);
            socket.emit("onlineUsers", onlineUsers);
            socket.emit("connected");
        }
    });

    socket.on("join chat", (room) => {
        socket.join(room);
    });

    socket.on("typing", ({ selectedChat, userData }) => {
        const users = selectedChat?.users;
        users?.forEach((u) => {
            if (u._id !== userData?.data._id) {
                socket.in(u._id).emit("typing", userData);
            }
        });
    });

    socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
    });

    socket.on("new message", (newMessageStatus) => {
        const chat = newMessageStatus.chat;
        if (!chat.users) {
            return console.log("chat.users not defined");
        }
        chat.users.forEach((user) => {
            if (user._id !== newMessageStatus.sender._id) {
                socket.in(user._id).emit("message received", newMessageStatus);
            }
        });
    });

    socket.on("join-room",(data)=>{
        const{roomId,userId}=data;
        console.log(`User ${socket.id} joined room ${roomId}`);
        userIdToSocketMapping.set(userId,socket.id)
        socketToUserIdMapping.set(socket.id,userId)
        socket.join(roomId);
        socket.emit('joined-room',{roomId})
        socket.broadcast.to(roomId).emit("user-joined",{userId})
        
    })

    socket.on('call-user', (data) => {
        const fromUserId = socketToUserIdMapping.get(socket.id);
        const { userId, offer } = data;
        const socketId = userIdToSocketMapping.get(userId);
        if (socketId) {
          socket.to(socketId).emit('incoming-call', { from: fromUserId, offer });
        }
      });
      
      socket.on('call-accepted', ({ userId, ans }) => {
        const socketId = userIdToSocketMapping.get(userId);
        if (socketId) {
          socket.to(socketId).emit('call-accepted', { ans });
        }
      });

    socket.on("disconnect", async() => {
        const userId = socketUserMap[socket.id];
        if (userId) {
            delete onlineUsers[userId];
            delete socketUserMap[socket.id];
            await User.findByIdAndUpdate(userId,{ lastSeen: Date.now() })
            io.emit('userOffline', userId);
            console.log(`User ${socket.id} disconnected`);
            io.emit('disconnectedTime', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
    });
});