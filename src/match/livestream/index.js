const { default: axios } = require("axios");
const {CanvasHandler, SCREENS, test_screen, ImageHelper} = require("../../util/canvas");
const StreamHandler = require("../../util/stream");
const { MATCH_EVENTS } = require("../handler");
const  Match  = require('../model');
const { emitEventNames } = require("../socket");
const FPS = 30
const YOUTUBE_STREAM_LATENCY = 5
const YOUTUBE_API_KEY = 'AIzaSyCpmqo8ByzMuPbZ8g97mSCRcs4Wi-bJTe0'
const { loadImage } = require('canvas')
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

        this.isRetrievedAnswers = false
        this.legalAnswerPlayers = []
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
        switch (eventCode) {
            case MATCH_EVENTS.ON_SYNC:
                // this.redrawCanvas = true
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
                console.log("Emitted event ON_QUESTION_END:")
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.QUESTION_END
                this.updateData()
                break 
            case MATCH_EVENTS.ON_COUNTDOWN:
                console.log("Emitted event ON_COUNTDOWN:", time)
                this.redrawCanvas = true
                this.time = time
                break
            case MATCH_EVENTS.ON_LEADERBOARD: 
                console.log("Emitted event ON_LEADERBOARD:")
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.LEADER_BOARD
                this.updateData()
                break
            case MATCH_EVENTS.ON_SUMMARY:
                console.log("Emitted event ON_SUMMARY:")
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.SUMMARY
                this.updateData()
                break
            case MATCH_EVENTS.ON_QUESTION:
                console.log("Emitted event ON_QUESTION:")
                this.isRetrievedAnswers = false
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
                console.log("Emitted event ON_END_MATCH:")
                this.onEndStream()
                break
            case MATCH_EVENTS.ON_START: 
                console.log("Emitted event ON_START:")
                //console.log("start stream")
                this.redrawCanvas = true
                this.screen = SCREENS.WAITING
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
        }, 500)
    }

    retrieveAnswers =  async () => {
        if (this.isRetrievedAnswers) return 
        let match = this.match
        if (this.screen == SCREENS.QUESTION_END){
            let duration = match.showQuestionEndTime - this.time
            if  (duration >= YOUTUBE_STREAM_LATENCY && duration <= YOUTUBE_STREAM_LATENCY + 2) {
                console.log("Only Retrieve answer after at least " + YOUTUBE_STREAM_LATENCY +" seconds on Question End Screen")
                this.isRetrievedAnswers = true 
            }
          
        }
        if (!this.isRetrievedAnswers )  return

        let liveChatId = match.livestream.liveChatId
        var url = `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=id&part=snippet&part=authorDetails&key=${YOUTUBE_API_KEY}`
        
        console.log("URL chat:", url)
        if (this.nextPageToken != null) {
            url += `&pageToken=${this.nextPageToken}`
        }
        try {
            let res = await axios.get(url)
           // console.log("Data answers:", res.data)
            const {data} = res
            this.nextPageToken = data.nextPageToken
            let msgs = data.items

            this.legalAnswerPlayers = []
            msgs.forEach((msg) => this.extractAnswer(msg))

            this.legalAnswerPlayers.forEach((item, index) => {
                this.matchHandler.onAnswer(item.player, item.answerIndex, item.answerTime)
            })
            this.matchHandler.calculateEarnScores()
            // Emit for MatchHandler for display answers?

            let urls = this.legalAnswerPlayers.map((item) => item.player.avatar)
            let differUrls = []
            urls.forEach((url) => {
                if (differUrls.indexOf(url) == -1) differUrls.push(url)
            })

            console.log("Differ urls: ", differUrls)
            await this.canvasHandler.loadRemoteImages(differUrls)
            setTimeout(() => this.redrawCanvas = true, 1000)
        }        
        catch (err) {
            console.log("Retrieve answer error:", (err.response ? err.response.data : err))
        }

    }


    extractAnswer = (msg) => {
        let match = this.match
        let stage = match.progress[match.progress.length -1]
        // Check answer is on time 
        let answerPublishTime = new Date(msg.snippet.publishedAt)
        var answerTime = Math.abs(answerPublishTime - stage.startAt) / 1000 - YOUTUBE_STREAM_LATENCY
        answerTime = Math.round(answerTime * 10) / 10
        if (answerTime < 0) {
            console.log("Answer when time answers is over, emited", content, answerTime)
            return
        }
        
        // Check answer is correct format
        // Correct format is : 'x' or 'x @alias_name'
        // 
        let content = msg.snippet.textMessageDetails.messageText
       // console.log("\n \n Extract answer with content: ", content)
        var answerIndex = ['1','2','3','4'].indexOf(content)
        var aliasName = ''
        if (answerIndex == -1) {
            // Not in format 'x'
            // Check format 'x @alias_name'
            let format = /[1-4]{1} @.*/gm
            if (format.test(content)) {
                answerIndex = content[0] - 1
                aliasName = content.substring(3)
              //  console.log("Answer in format x alias :", answerIndex, aliasName)
            }
            else {
              //  console.log("Answer not any in format, emited ")
                return
            }
        }
        else {
            //console.log("Answer in format x:", answerIndex)
        }

        // 
        var playerName = aliasName == '' ? msg.authorDetails.displayName : aliasName
        var playerId = (msg.authorDetails.channelId + '_' + playerName)
       
        let player = {
            _id: playerId,
            platformId: msg.authorDetails.channelId,
            name: playerName,
            profile: msg.authorDetails.channelUrl,
            avatar: msg.authorDetails.profileImageUrl,
        }
       // console.log("Player infor: ", player)

        var isExist = false
        this.legalAnswerPlayers.forEach((answerPlayer, index) => {
            if (answerPlayer.player._id == playerId) {
                // Update to latest answer
                this.legalAnswerPlayers[index].answerTime = answerTime
                this.legalAnswerPlayers[index].answerIndex = answerIndex
                isExist = true
              //  console.log("Update to latest answer :", playerName, answerIndex)
            }
        })
        if (!isExist) {
         //   console.log("Add to new answer :", playerName, answerIndex)
            this.legalAnswerPlayers.push({player, answerIndex,answerTime})
        }
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

    onStreamFrame = async (data) => {
        if (this.redrawCanvas) {
            this.canvasHandler.canvas = await this.canvasHandler.drawCanvas(this.screen, data)
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
            isLoading: !this.isRetrievedAnswers,
            userAnswers: answers,
            round_index: `Result of round ${questionIndex}`,
            time: this.time
        }
        if (this.redrawCanvas) {
            data.userAnswers.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.userAnswers[index].avatarImg = avatarImg
            })
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

        if (this.redrawCanvas) {
            data.players.forEach((player, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(player.avatar)
                data.players[index].avatarImg = avatarImg
            })
        }
        this.onStreamFrame(data, !(this.isRetrievedAnswers))
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