const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')
const { drawSummary } = require('./screen/summary')
const { drawLeaderBoard } = require('./screen/leader_board')
const { drawQuestion } = require('./screen/question')
const { drawQuestionEnd } = require('./screen/question_end')
const { drawWaiting } = require('./screen/waiting')
const { drawPreStream } = require('./screen/pre_stream')

const SCREENS = {
    WAITING: 0,
    QUESTION: 1,
    QUESTION_END:2,
    LEADER_BOARD: 3,
    SUMMARY: 4,
    PRE_STREAM: 5
}

const test_screen = null
class CanvasHandler {

    constructor(w, h) {
        this.canvas = createCanvas(w, h)
        this.bg = null 
        this.layer_question = null 
        this.layer_question_end_0 = null
        this.layer_question_end_1 = null
        this.layer_question_end_2 = null
        this.layer_question_end_3 = null
        this.layer_leader_board = null

        this.sample_avatar = null 
        this.requiredFrames = 0
        this.skipFrames = 0
    }

    loadImages = async () => {
        this.bg = await loadImage(__dirname + '/layer/background.jpg')
        this.layer_question = await loadImage( __dirname + '/layer/question.svg')
        this.layer_question_ends = [
            await loadImage( __dirname + '/layer/question_end_0.svg'),
            await loadImage( __dirname + '/layer/question_end_1.svg'),
            await loadImage( __dirname + '/layer/question_end_2.svg'),
            await loadImage( __dirname + '/layer/question_end_3.svg')
        ]
        this.layer_leader_board = await loadImage( __dirname + '/layer/leader_board.svg')

        this.sample_avatar = await loadImage(__dirname + '/layer/avatar.jpg')
    }

    drawCanvas = (screen, data) => {
        this.requiredFrames ++ 

        let genImg = false
        //(test_screen != null)
        switch (screen) {
            case SCREENS.WAITING: 
                return drawWaiting(this.canvas, data, this.bg, genImg)
            case SCREENS.QUESTION: 
                return drawQuestion(this.canvas, data, this.bg, this.layer_question, genImg)
            case SCREENS.QUESTION_END: 
                let correct_answer = data.question.correct_answers[0]
                return drawQuestionEnd(this.canvas, data, this.bg, this.layer_question_ends[correct_answer], this.sample_avatar, genImg)
            case SCREENS.LEADER_BOARD: 
                return drawLeaderBoard(this.canvas, data, this.bg, this.layer_leader_board, this.sample_avatar,genImg)
            case SCREENS.SUMMARY: 
                return drawSummary(this.canvas, data, this.bg, genImg)
            case SCREENS.PRE_STREAM: 
                return drawPreStream(this.canvas, this.bg, genImg)
            default: 
                return null
        }
    }
    
}



module.exports = {
    CanvasHandler, 
    SCREENS,
    test_screen
}