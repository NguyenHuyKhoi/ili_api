const { createCanvas, registerFont, loadImage } = require('canvas')
const { drawLeaderBoard } = require('./screen/leader_board')
const { drawQuestionMultiple } = require('./screen/question_multiple')
const { drawQuestionMultipleEnd } = require('./screen/question_multiple_end')
const { drawQuestionPicWord } = require('./screen/question_pic_word')
const { drawQuestionPicWordEnd } = require('./screen/question_pic_word_end')
const { drawQuestionTF } = require('./screen/question_tf')
const { drawQuestionTFEnd } = require('./screen/question_tf_end')
const { drawQuestionWordTable } = require('./screen/question_word_table')
const { drawQuestionWordTableEnd } = require('./screen/question_word_table_end')
const { drawWaiting } = require('./screen/waiting')
const { drawWaitingLive } = require('./screen/waiting_live')
const { drawEnd } = require('./screen/end')

const EXTENSION_TEMPLATE = 'jpg'
const SCREEN_IDS = {
    WAITING_LIVE_ID: 0,
    WAITING_ID: 1,
    QUESTION_MULTIPLE_ID: 2,
    QUESTION_MULTIPLE_END_ID: 3,
    QUESTION_TF_ID: 4,
    QUESTION_TF_END_ID: 5,
    QUESTION_PICWORD_ID: 6,
    QUESTION_PICWORD_END_ID: 7,
    QUESTION_WORD_TABLE_ID: 8,
    QUESTION_WORD_TABLE_END_ID: 9,
    LEADER_BOARD_ID: 10,
    END_ID: 11
}
var SCREENS = {
    WATING_LIVE: {
        id: SCREEN_IDS.WAITING_LIVE_ID,
        drawFunc: drawWaitingLive,
        templateName: 'waiting_live'
        //'waiting_live'
    },
    WAITING: {
        id: SCREEN_IDS.WAITING_ID,
        drawFunc: drawWaiting,
        templateName: 'waiting'
    },
    QUESTION_MULTIPLE: {
        id: SCREEN_IDS.QUESTION_MULTIPLE_ID,
        drawFunc: drawQuestionMultiple,
        templateName: 'question_multiple'
    },
    QUESTION_MULTIPLE_END: {
        id: SCREEN_IDS.QUESTION_MULTIPLE_END_ID,
        drawFunc: drawQuestionMultipleEnd,
        templateName: 'question_multiple_end'
    },
    QUESTION_TF: {
        id: SCREEN_IDS.QUESTION_TF_ID,
        drawFunc: drawQuestionTF,
        templateName: 'question_tf'
    },
    QUESTION_TF_END: {
        id: SCREEN_IDS.QUESTION_TF_END_ID,
        drawFunc: drawQuestionTFEnd,
        templateName: 'question_tf_end'
    },
    QUESTION_PICWORD: {
        id: SCREEN_IDS.QUESTION_PICWORD_ID,
        drawFunc: drawQuestionPicWord,
        templateName: 'question_pic_word'
    },
    QUESTION_PICWORD_END: {
        id: SCREEN_IDS.QUESTION_PICWORD_END_ID,
        drawFunc: drawQuestionPicWordEnd,
        templateName: 'question_pic_word_end'
    },
    QUESTION_WORD_TABLE: {
        id: SCREEN_IDS.QUESTION_WORD_TABLE_ID,
        drawFunc: drawQuestionWordTable,
        templateName: 'question_word_table'
    },
    QUESTION_WORD_TABLE_END: {
        id: SCREEN_IDS.QUESTION_WORD_TABLE_END_ID,
        drawFunc: drawQuestionWordTableEnd,
        templateName: 'question_word_table_end'
    },
    LEADER_BOARD: {
        id: SCREEN_IDS.LEADER_BOARD_ID,
        drawFunc: drawLeaderBoard,
        templateName: 'leader_board'
    },
    END: {
        id: SCREEN_IDS.END_ID,
        drawFunc: drawEnd,
        templateName: 'end'
    }
}

const test_screen = SCREEN_IDS.WAITING_LIVE_ID

class CanvasHandler {

    constructor(w, h) {
        this.canvas = createCanvas(w, h)

        this.bgs = new Array(20)
        this.requiredFrames = 0
        this.skipFrames = 0
        this.remoteImageObjs = []

        this.sample_avatar = null
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


    prepare = async () => {
        try {
            this.sample_avatar = await loadImage(__dirname + '/layer/avatar.jpg')
            registerFont('./src/util/canvas/setofont.woff', { family: 'SetoFont-SP', weight: '100', style: 'Not-Rotated' })
            await Promise.all(Object.values(SCREENS).map(async (screen) => {
                var path =`${__dirname}/layer/${EXTENSION_TEMPLATE}/${screen.templateName}.${EXTENSION_TEMPLATE}` ;
                this.bgs[screen.id] = await loadImage(path) 
            }))
        }
        catch (err) {
            console.log("Err on load image: ", err);
        }

    }

    drawCanvas = async (screen, data) => {
        this.requiredFrames ++ 
        var newCanvas = this.canvas
        //(test_screen != null)
        
        try {
            var bg = this.bgs[screen.id]
            console.log("Background not null:", (bg != null));
            var drawFunc = screen.drawFunc
            if (drawFunc != undefined) {
                newCanvas = drawFunc(this.canvas, bg, data, false) 
            }
        }
        catch (err) {
            console.log("Err: ", err);
        }
        finally {
            return newCanvas
        }
    }
    
}

module.exports = {
    CanvasHandler, 
    SCREENS,
    SCREEN_IDS,
    test_screen
}