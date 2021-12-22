const mongoose = require('mongoose')

const MatchSchema = new mongoose.Schema({
    title: {type: String, required: true},
    gameId: {type: String, require: true, ref: 'Game'},
    hostId: {type: String, require: true, ref: 'User'},
    pinCode: {type: String, require: true},
})


module.exports = mongoose.model('Match', MatchSchema)