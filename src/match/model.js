const mongoose = require('mongoose')
const { QuestionSchema } = require('../game/model')
const PlayerSchema = new mongoose.Schema({
    socketId: {type: String, required: true},
    name: {type: String, required: true},
    score: {type: Number, require: true},
    rank: {type: Number},
    correctNum: {type: Number},
    incorrectNum: {type: Number},
    unanswerNum: {type: Number}
})

const AnswerPlayerSchema = new mongoose.Schema({
    socketId: {type: String, require: true},
    name: {type: String, require: true},
    answerIndex: {type: Number, require: true}, 
    answerTime: {type: Number, require: true},
    isCorrect: {type: Boolean, require: true},
    earnScore: {type: Number, required: true}
})

const ProgressSchema = new mongoose.Schema({
    question: {type: QuestionSchema, required: true},
    answers: {type: [AnswerPlayerSchema], required: true},
    correctNum: {type: Number},
    incorrectNum: {type: Number},
    unanswerNum: {type: Number},
    answerTimeAvg: {type: Number}
})

const MatchSchema = new mongoose.Schema({
    game: {type: Object, require: true},
    isFinished: {type: Boolean, default: false},
    questionIndex: {type: Number},
    pinCode: {type: String,  require: true},
    host: { type: Object , require: true},
    players: {type: [PlayerSchema], required: true},
    progress: {type: [ProgressSchema]},
    startAt: {type: Date, required: true },
    finishAt: {type: Date, required: true}
})



module.exports = mongoose.model('Match', MatchSchema)