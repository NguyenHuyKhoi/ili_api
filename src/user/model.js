const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    username: { type: String},
    name: { type: String},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: ''},
    banner: { type: String, default: ''},
    isAdmin: { type: Boolean, default: false },
}, {
    timestamps: true
})

module.exports = mongoose.model('User', UserSchema)