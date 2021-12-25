const mongoose = require('mongoose')

const MatchSchema = new mongoose.Schema({
    game: {type: Object, require: true},
    is_finished: {type: Boolean, default: false},
    question_index: {type: Number},
    pinCode: {type: String,  require: true},
    host: { type: Object , require: true},
    users: {type: [Object], required: true},
    progress: {type: [Object]}
})


module.exports = mongoose.model('Match', MatchSchema)