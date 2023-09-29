const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 3001
const connectDB = require('./backend/config/db')
const userRoutes = require('./backend/routes/userRoutes');
const chatRoutes = require("./backend/routes/chatRoutes");
const imageRoutes = require("./backend/routes/imageRoute");
const commentRoutes = require('./backend/routes/commentRoutes')
const messageRoutes = require('./backend/routes/messageRoutes')
const { errorHandler, notFound } = require('./backend/middleware/errorMiddleware');

connectDB();
const app = express();
dotenv.config();
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())

// {
//   origin: 'http://localhost:3000', // Replace with your frontend's URL
//   credentials: true, // Allow cookies and authentication headers to be included
// }

app.get('/',(req,res)=>{
    res.send("API is running successfully")
})


app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/image',imageRoutes)
app.use('/api/comment',commentRoutes)
app.use('/api/message',messageRoutes)

app.use(notFound)
// app.use(errorHandler)

const server = app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})


const io = require("socket.io")(server,{
    pingTimeout: 60000,
    cors: {
        origin: "https://pavangram.netlify.app",
    }
})


io.on("connection",(socket)=>{
    // console.log(`${new Date()} : New connection ${socket.id}`);
    console.log("connected to socket.io")

    socket.on('setup',(userData)=>{
        socket.join(userData._id)
        console.log(userData._id)
        socket.emit('connected');
    })


    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log("User Joined Room "+room)
    })

    socket.on('typing',(room)=>socket.in(room).emit("typing"))
    socket.on('stop typing',(room)=>socket.in(room).emit("stop typing"))

    socket.on('new message',(newMessageReceived)=>{
        let chat  = newMessageReceived.chat;

        if(!chat.users) return console.log('chat users not defined')


        chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived)
        });
    })
})




// @import url('https://fonts.googleapis.com/css2?family=Grand+Hotel&family=Work+Sans:wght@300&display=swap');