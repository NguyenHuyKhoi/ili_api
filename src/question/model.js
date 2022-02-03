
const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
    index: {type: Number},
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
const Question =  mongoose.model('Question', QuestionSchema)
module.exports = {
    Question,
    QuestionSchema
}