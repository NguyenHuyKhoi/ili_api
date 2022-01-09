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
        this.remoteImageObjs = []

        // Array of objects : {url, image}
    }
    
    getRemoteImages = (url) => {
        let obj = this.remoteImageObjs.find((item) => item.url == url)
        if (!obj) {
            return null
        }
        return obj.image
    }

    // All urls are difference each others
    loadRemoteImages = async (urls) => {
        console.log("Require to load remote image urls: ", urls)
        await Promise.all(urls.map(async (url) => {
            // Check if load remote image before
            var obj = this.remoteImageObjs.find((item) => item.url == url)

            if (!obj) {
                console.log("No Load image url before or current batch: ", url)
                let image = await loadImage(url)
                this.remoteImageObjs.push({
                    url,
                    image
                })
            }
            else {
                console.log("Loaded image url before:", url)
            }
        }));
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

    drawCanvas = async (screen, data) => {
        this.requiredFrames ++ 
        var newCanvas = this.canvas
        let genImg = false
        //(test_screen != null)
        switch (screen) {
            case SCREENS.WAITING: 
                newCanvas = await drawWaiting(this.canvas, data, this.bg, genImg)
                break
            case SCREENS.QUESTION: 
                newCanvas = await drawQuestion(this.canvas, data, this.bg, this.layer_question, genImg)
                break
            case SCREENS.QUESTION_END: 
                let correct_answer = data.question.correct_answers[0]
                newCanvas = await drawQuestionEnd(this.canvas, data, this.bg, this.layer_question_ends[correct_answer], genImg)
                break
            case SCREENS.LEADER_BOARD: 
                newCanvas = await drawLeaderBoard(this.canvas, data, this.bg, this.layer_leader_board, genImg)
                break
            case SCREENS.SUMMARY: 
                newCanvas = await drawSummary(this.canvas, data, this.bg, genImg)
                break
            case SCREENS.PRE_STREAM: 
                newCanvas = await drawPreStream(this.canvas, this.bg, genImg)
                break
            default: 
                break
                
        }
        return newCanvas
    }
    
}

module.exports = {
    CanvasHandler, 
    SCREENS,
    test_screen
}