const { default: axios } = require("axios");
const {CanvasHandler, SCREENS, test_screen} = require("../../util/canvas");
const StreamHandler = require("../../util/stream");
const { MATCH_EVENTS } = require("../handler");
const  Match  = require('../model');
const { emitEventNames } = require("../socket");
const FPS = 16

const YOUTUBE_API_KEY = 'AIzaSyCpmqo8ByzMuPbZ8g97mSCRcs4Wi-bJTe0'
class LiveStreamHandler {
    constructor(matchHandler) {
        this.match = matchHandler.match
        this.matchHandler = matchHandler

        // devired data
        this.question = {}
        this.answer_counts =  [0,0,0,0]
        this.endMatch = false
        this.redrawCanvas = true
        this.nextPageToken = null
    }

    streamTillActive = () => {
        let duration = 1000 / FPS
        var _interval = setInterval(() => {
            if (this.endMatch) {
                clearInterval(_interval)
            }
            this.showCurrentScreen()
        }, duration) 
    }

    updateData = () => {
        const {progress} = this.match
        this.answer_counts =  [0,0,0,0]
        if (progress != undefined && progress.length >=1 ) {
            // update current question: 
            let current = progress[progress.length - 1]
            this.question = current.question
            
            current.answers.forEach((answer, index) => {
                this.answer_counts[answer.answerIndex] ++ 
            })
        }
    }
    convertScreenName = () => {
        switch (this.screen) {
            case SCREENS.WAITING: 
                return 'Waiting screen'
            case SCREENS.QUESTION: 
                return 'Question screen'
            case SCREENS.QUESTION_END: 
                return 'Question end screen'
            case SCREENS.LEADER_BOARD: 
                return 'Leader board screen'
            case SCREENS.SUMMARY: 
                return 'Summary screen'
            default: 
                return ''
        }
    }

    emit = (eventCode, data) => {
        const {match, time} = data
        console.log("Start received emit event:", eventCode, time)
        switch (eventCode) {
            case MATCH_EVENTS.ON_SYNC:
                this.match = match
                this.updateData()
                break
            case MATCH_EVENTS.PLAYER_LEAVE:
                //console.log("Emitted event PLAYER_LEAVE:")
                break
            case MATCH_EVENTS.PLAYER_NOT_ANSWER:
                //console.log("Emitted event PLAYER_NOT_ANSWER:")
                break
            case MATCH_EVENTS.PLAYER_ANSWER_CORRECT:
                //console.log("Emitted event PLAYER_ANSWER_CORRECT:")
                break
            case MATCH_EVENTS.PLAYER_ANSWER_WRONG:
                //console.log("Emitted event PLAYER_ANSWER_WRONG:")
                break
            case MATCH_EVENTS.ON_QUESTION_END:
                //console.log("Emitted event ON_QUESTION_END:", match)
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.QUESTION_END
                this.updateData()
                break 
            case MATCH_EVENTS.ON_COUNTDOWN:
                this.redrawCanvas = true
                this.time = time
                break
            case MATCH_EVENTS.ON_LEADERBOARD: 
                //console.log("Emitted event ON_LEADERBOARD:", match)
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.LEADER_BOARD
                this.updateData()
                break
            case MATCH_EVENTS.ON_SUMMARY:
                //console.log("Emitted event ON_SUMMARY:", match)
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.SUMMARY
                this.updateData()
                break
            case MATCH_EVENTS.ON_QUESTION:
                //console.log("Emitted event ON_QUESTION:", match)
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.QUESTION
                this.updateData()
                break
            case MATCH_EVENTS.ON_KICK_PLAYER:
                //console.log("Emitted event ON_KICK_PLAYER:")
                break
            case MATCH_EVENTS.ON_COUNTDOWN_TO_START: 
                //console.log("Emitted event ON_COUNTDOWN_TO_START:")
                break
            case MATCH_EVENTS.ON_COUNTDOWN_TO_END: 
                //console.log("Emitted event ON_COUNTDOWN_TO_END:")
                break
            case MATCH_EVENTS.ON_END_MATCH: 
                //console.log("Emitted event ON_END_MATCH:")
                this.onEndStream()
                break
            case MATCH_EVENTS.ON_START: 
                //console.log("Emitted event ON_START:")
                //console.log("start stream")
                this.redrawCanvas = true
                this.screen = WAITING
                this.match = match
                break
        }
    }

    prepare = async () => {
        let match = this.match
        this.canvasHandler = new CanvasHandler(1280, 720)
        await this.canvasHandler.loadImages()

        let {streamUrl } = match.livestream
        this.streamHandler = new StreamHandler(streamUrl, FPS)

        this.screen = SCREENS.PRE_STREAM
        this.time = 0
    }


    testScreen = () => {
        switch (test_screen) {
            case SCREENS.WAITING: 
                this.onWaiting()
                break
            case SCREENS.QUESTION: 
                this.onQuestion()
                break
            case SCREENS.QUESTION_END: 
                this.onQuestionEnd()
                break
            case SCREENS.LEADER_BOARD: 
                this.onLeaderboard()
                break
            case SCREENS.SUMMARY: 
                this.onSummary()
                break
        }
    }

    start = async () => {
        // await this.prepare()

        if (test_screen != null) {
            this.testScreen()
            return
        }

        let duration = 1000 / FPS
        var _interval = setInterval(() => {
            if (this.endMatch) {
                clearInterval(_interval)
            }
            this.showCurrentScreen()
        }, duration) 

        this.listenAnswers()
    }

    listenAnswers = () => {
        var _interval = setInterval(async () => {
            if (this.endMatch) {
                clearInterval(_interval)
                console.log("Stop listen to livechat ")
            }
            this.retrieveAnswers()
        }, 5000)
    }

    retrieveAnswers =  async () => {
        let match = this.match
        // if ((this.screen == SCREENS.WAITING) || (this.screen == SCREENS.SUMMARY)) {
        //     console.log("Not rereice answer on Waiting and summary")
        //     return 
        // }
        // if (this.question == {} || this.match.progress.length == 0) {
        //     console.log("No question now ")
        //     return 
        // }

        let stage = match.progress[match.progress.length -1]
        let liveChatId = match.livestream.liveChatId
        console.log("Retrieve answers for chat Id", liveChatId)
        var url = `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=id&part=snippet&part=authorDetails&key=${YOUTUBE_API_KEY}`
        
        if (this.nextPageToken != null) {
            url += `&pageToken=${this.nextPageToken}`
        }
        axios.get(url)
        .then((res) => {
            const {data} = res
            this.nextPageToken = data.nextPageToken
            let msgs = data.items
            msgs.forEach((msg) => {
                let player = {
                    _id: msg.authorDetails.channelId,
                    name: msg.authorDetails.displayName,
                    profile: msg.authorDetails.channelUrl,
                    avatar: msg.authorDetails.profileImageUrl,
                }
                let content = msg.snippet.textMessageDetails.messageText
                let answerIndex = ['1','2','3','4'].indexOf(content)
                if (answerIndex == -1) {
                    console.log("Wrong answer format:", content, this.time, this.time, this.convertScreenName())
                    return 
                }
                else {
                    console.log("Correct answer format:" , content, this.time, this.convertScreenName())
                }
                //let answerTime = Math.abs((new Date()) - stage.startAt) / 1000
                //this.matchHandler.onAnswer(player, answerIndex, answerTime)
            })
        })
        .catch((err) => {
            console.log("Retrieve answer error:", err)
        })
    }
    showCurrentScreen = () => {
        switch (this.screen) {
            case SCREENS.WAITING: 
                this.onWaiting()
                break
            case SCREENS.QUESTION:
                this.onQuestion()
                break
            case SCREENS.QUESTION_END:
                this.onQuestionEnd()
                break
            case SCREENS.LEADER_BOARD:
                this.onLeaderboard()
                break
            case SCREENS.SUMMARY: 
                this.onSummary()
            case SCREENS.PRE_STREAM: 
                this.onPreStream()
                break

        }
    }

    onStreamFrame = (data) => {
        if (this.redrawCanvas) {
            this.canvasHandler.canvas = this.canvasHandler.drawCanvas(this.screen, data)
            this.redrawCanvas = false
        }
        //let canvas =  this.canvasHandler.drawCanvas(this.screen, data)
        this.streamHandler.stream(this.canvasHandler.canvas)
    }

    onWaiting = () => {
        let match = this.match
        const {game} = match
        const data = {
            title: game.title,
            description: 'Stay tuned! Starting in',
            time: this.time
        }

        this.onStreamFrame(data)
    }

    onQuestion = () => {
        const match = this.match
        const {game, questionIndex} = match
        const question = this.question
        const data = {
            question,
            round_index: `Round ${questionIndex} / ${game.questions.length}`,
            time: this.time
        }

        this.onStreamFrame(data)
    }

    onQuestionEnd = () => {
        let match = this.match
        const {progress, questionIndex} = match
        const stage = progress[progress.length - 1]
        const {question, answers} = stage 
        const data = {
            question,
            userAnswers: answers,
            round_index: `Result of round ${questionIndex}`,
            time: this.time
        }

        this.onStreamFrame(data)
    }

    onLeaderboard = () => {
        let match = this.match
        const {players} = match 
        const data = {
            players,
            time : this.time
        }

        this.onStreamFrame(data)
    }

    onSummary = () => {
        let match = this.match
        const {game} = match
        const data = {
            title: game.title,
            description: 'Game end in',
            time: this.time
        }
        this.onStreamFrame(data)
    }

    onPreStream = () => {
        this.onStreamFrame({})
    }

    onEndStream =  () => {

        this.endMatch = true
        setTimeout(() => {
            this.streamHandler.end()
        }, 1000)
        
    }
}

module.exports = LiveStreamHandler