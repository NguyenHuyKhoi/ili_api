const mongoose = require('mongoose')
const Schema = mongoose.Schema
const TokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    token: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Token', TokenSchema)