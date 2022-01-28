const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
    index: {type: Number, required: true},
    typeId: {type: Number, required: true},
    typeName: {type: String, required: true},
    title: {type: String, required: true},
    images: {type: [String]},
    image: {type: String},
    answers: {type: [String]}   ,
    correct_answer: {type: String},
    correct_answers: {type: [String]},
    char_table: {type: [Object]},
    time_limit: {type: Number, required: true},
    score: {type: Number, required: true}
})

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
    Game,
    QuestionSchema
}