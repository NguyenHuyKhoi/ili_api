const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const authRoute = require('./src/auth/route')
const userRoute = require('./src/user/route')

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

app.use(express.json())
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)
app.listen( 8800, () => {
    console.log('Backend server is running.')
})