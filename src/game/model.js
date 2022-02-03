const mongoose = require('mongoose')
const { QuestionSchema } = require('../question/model')
const GameSchema = new mongoose.Schema({
    userId: {type: String, required: true, ref: 'User'},
    subject: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String},
    cover: {type: String},
    visibility: {type: String, required: true},
    questions: {type: [QuestionSchema], required: true}
}, {
    timestamps: true
})

const Game =  mongoose.model('Game', GameSchema)
module.exports = {
    Game
}