const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const { createServer } = require("http")
const { Server } = require("socket.io")
//Config socket 

var cors = require('cors')
const authRoute = require('./src/auth/route')
const userRoute = require('./src/user/route')
const gameRoute = require('./src/game/route')
const questionRoute = require('./src/question/route')
const collectionRoute = require('./src/collection/route')
const matchRoute = require('./src/match/route')
const registerMatchHandlers = require('./src/match/socket')
const app = express()
const httpServer = createServer(app)

dotenv.config()
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
// const whitelist = ["https://localhost:3000", "https://ili-client.herokuapp.com"]
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   },
//   credentials: true,
// }
// app.use(cors(corsOptions))


// Socket 
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});

const onConnection = (socket) => {
    registerMatchHandlers(io, socket)
}
io.on("connection", onConnection);

// DB
mongoose
    .connect(process.env.MONGO_URL, {
    })
    .then( () => {
        console.log('Connect DB is successfully.')
    })
    .catch( (err) => {
        console.log(err)
    })

// Middleware
app.use(express.json())

// Allow CORS
app.use(cors())
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/game', gameRoute)
app.use('/api/collection', collectionRoute)
app.use('/api/question', questionRoute)
app.use('/api/match', matchRoute)

httpServer.listen(process.env.PORT || 8800, () => {
    console.log('Backend server is running in port 8800')
})
