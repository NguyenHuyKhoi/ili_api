const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
var cors = require('cors')
const authRoute = require('./src/auth/route')
const userRoute = require('./src/user/route')
const gameRoute = require('./src/game/route')
const collectionRoute = require('./src/collection/route')

const app = express()
dotenv.config()


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
app.use(cors());

app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.use('/api/game', gameRoute)
app.use('/api/collection', collectionRoute)

app.listen( 8800, () => {
    console.log('Backend server is running.')
})