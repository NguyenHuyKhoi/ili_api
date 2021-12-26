const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
    index: {type: Number, required: true},
    title: {type: String, required: true},
    image: {type: String},
    answers: {type: [String], required: true},
    correct_answers: {type: [Number], required: true},
    time_limit: {type: Number, required: true},
    score: {type: Number}
})

const GameSchema = new mongoose.Schema({
    userId: {type: String, required: true, ref: 'User'},
    title: {type: String, required: true},
    description: {type: String},
    cover: {type: String},
    language: {type: String, required: true},
    visibility: {type: String, required: true},
    questions: {type: [QuestionSchema], required: true}
}, {
    timestamps: true
})

const Game =  mongoose.model('Game', GameSchema)
module.exports = {
    Game,
    QuestionSchema
}