
const {CanvasHandler, SCREENS, test_screen} = require("../../util/canvas");
const StreamHandler = require("../../util/stream");
const { MATCH_EVENTS } = require("../handler");
const { FacebookHandler } = require("./facebook");
const { YoutubeHandler } = require("./youtube");
const FPS = 22

class LiveStreamHandler {
    constructor(matchHandler) {
        this.match = matchHandler.match
        this.matchHandler = matchHandler

        this.frames = 0

        // devired data
        this.question = {}
        this.answer_counts =  [0,0,0,0]
        this.endMatch = false
        this.redrawCanvas = true

        this.isRetrievedAnswers = false
        this.legalAnswerPlayers = []
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
                ////console.log("Emitted event PLAYER_LEAVE:")
                break
            case MATCH_EVENTS.PLAYER_NOT_ANSWER:
                ////console.log("Emitted event PLAYER_NOT_ANSWER:")
                break
            case MATCH_EVENTS.PLAYER_ANSWER_CORRECT:
                ////console.log("Emitted event PLAYER_ANSWER_CORRECT:")
                break
            case MATCH_EVENTS.PLAYER_ANSWER_WRONG:
                ////console.log("Emitted event PLAYER_ANSWER_WRONG:")
                break
            case MATCH_EVENTS.ON_QUESTION_END:
                //console.log("Emitted event ON_QUESTION_END:")
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.QUESTION_END
                this.updateData()
                break 
            case MATCH_EVENTS.ON_COUNTDOWN:
                if (time % 5 == 0) {
                    console.log("Emitted event ON_COUNTDOWN:", time, this.convertScreenName())
                }
               
                this.redrawCanvas = true
                this.time = time
                break
            case MATCH_EVENTS.ON_LEADERBOARD: 
                //console.log("Emitted event ON_LEADERBOARD:")
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.LEADER_BOARD
                this.updateData()
                break
            case MATCH_EVENTS.ON_SUMMARY:
                //console.log("Emitted event ON_SUMMARY:")
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.SUMMARY
                this.updateData()
                break
            case MATCH_EVENTS.ON_QUESTION:
                //console.log("Emitted event ON_QUESTION:")
                console.log("Set isRetrieveAnswer is False");
                this.isRetrievedAnswers = false
                this.redrawCanvas = true
                this.match = match
                this.screen = SCREENS.QUESTION
                this.updateData()
                break
            case MATCH_EVENTS.ON_KICK_PLAYER:
                ////console.log("Emitted event ON_KICK_PLAYER:")
                break
            case MATCH_EVENTS.ON_COUNTDOWN_TO_START: 
                ////console.log("Emitted event ON_COUNTDOWN_TO_START:")
                break
            case MATCH_EVENTS.ON_COUNTDOWN_TO_END: 
                ////console.log("Emitted event ON_COUNTDOWN_TO_END:")
                break
            case MATCH_EVENTS.ON_END_MATCH: 
                //console.log("Emitted event ON_END_MATCH:")
                this.onEndStream()
                break
            case MATCH_EVENTS.ON_START: 
                //console.log("Emitted event ON_START:")
                ////console.log("start stream")
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

        let {streamUrl, livestreamId, platform, liveChatId, accessToken } = match.livestream
        this.streamHandler = new StreamHandler(streamUrl, FPS)
        this.platformHander = 
            platform == 'facebook' ?    
               new  FacebookHandler(livestreamId, accessToken)
                :
               new  YoutubeHandler(liveChatId,)


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
            if (this.endMatch == true) {
                console.log('Clear interval')
                clearInterval(_interval)
            }
            else {
                this.showCurrentScreen()
            }
        }, duration) 

        this.listenAnswers()
    }

    listenAnswers = () => {
        var _interval = setInterval(async () => {
            if (this.endMatch == true) {
                clearInterval(_interval)
                console.log("Stop listen to livechat ")
            }
            else {
                this.retrieveAnswers()
            }
        }, 500)
    }

    retrieveAnswers =  async () => {
        if (this.isRetrievedAnswers) return 
        let {match, platformHander} = this
        let stage = match.progress[match.progress.length -1]


        if (this.screen == SCREENS.QUESTION_END){
            let duration = match.showQuestionEndTime - this.time
            if  (duration >= platformHander.STREAM_LATENCY && duration <=  platformHander.STREAM_LATENCY + 2) {
                this.isRetrievedAnswers = true 
            }
          
        }
        if (!this.isRetrievedAnswers )  return

        console.log("Retreianswer answer for question");
        var answers = await platformHander.retrieveAnswers(stage.startAt)
        
        answers.forEach((item, index) => {
            console.log("Answer retrieves: ", item.player, item.answerIndex, item.answerTime);
            this.matchHandler.onAnswer(item.player, item.answerIndex, item.answerTime)
            })
        this.matchHandler.calculateEarnScores()

        let urls = answers.map((item) => item.player.avatar)
        
        await this.loadRemoteImages(urls)
        //setTimeout(() => this.redrawCanvas = true, 1000)
        this.redrawCanvas = true
    }

    loadRemoteImages = async (urls) => {
        let differUrls = []
        urls.forEach((url) => {
            if (differUrls.indexOf(url) == -1) differUrls.push(url)
        })
        await this.canvasHandler.loadRemoteImages(differUrls)
    }


    extractAnswer = (msg) => {
        let match = this.match
        let stage = match.progress[match.progress.length -1]
        // Check answer is on time 
        let answerPublishTime = new Date(msg.snippet.publishedAt)
        var answerTime = Math.abs(answerPublishTime - stage.startAt) / 1000 - YOUTUBE_STREAM_LATENCY
        answerTime = Math.round(answerTime * 10) / 10
        if (answerTime < 0) {
            //console.log("Answer when time answers is not occurs, emited", content, answerTime)
            return
        }
        
        // Check answer is correct format
        // Correct format is : 'x' or 'x @alias_name'
        // 
        let content = msg.snippet.textMessageDetails.messageText
       // //console.log("\n \n Extract answer with content: ", content)
        var answerIndex = ['1','2','3','4'].indexOf(content)
        var aliasName = ''
        if (answerIndex == -1) {
            // Not in format 'x'
            // Check format 'x @alias_name'
            let format = /[1-4]{1} @.*/gm
            if (format.test(content)) {
                answerIndex = content[0] - 1
                aliasName = content.substring(3)
              //  //console.log("Answer in format x alias :", answerIndex, aliasName)
            }
            else {
              //  //console.log("Answer not any in format, emited ")
                return
            }
        }
        else {
            ////console.log("Answer in format x:", answerIndex)
        }

        // 
        var playerName = aliasName == '' ? msg.authorDetails.displayName : aliasName
        var playerId = (msg.authorDetails.channelId + '_' + playerName)
       
        let player = {
            _id: playerId,
            platformId: msg.authorDetails.channelId,
            username: playerName,
            profile: msg.authorDetails.channelUrl,
            avatar: msg.authorDetails.profileImageUrl,
        }
       // //console.log("Player infor: ", player)

        var isExist = false
        this.legalAnswerPlayers.forEach((answerPlayer, index) => {
            if (answerPlayer.player._id == playerId) {
                // Update to latest answer
                this.legalAnswerPlayers[index].answerTime = answerTime
                this.legalAnswerPlayers[index].answerIndex = answerIndex
                isExist = true
              //  //console.log("Update to latest answer :", playerName, answerIndex)
            }
        })
        if (!isExist) {
         //   //console.log("Add to new answer :", playerName, answerIndex)
            this.legalAnswerPlayers.push({player, answerIndex,answerTime})
        }
    }

    showCurrentScreen = () => {
        if (this.endMatch == true) {
            return
        }
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
                break
            case SCREENS.PRE_STREAM: 
                this.onPreStream()
                break

        }
    }

    onStreamFrame = async (data) => {
        let isNewImg = false
        this.frames ++ 
        if (this.redrawCanvas == true) {
            //console.log("Stream frame : ")
            this.canvasHandler.canvas = await this.canvasHandler.drawCanvas(this.screen, data)
            this.redrawCanvas = false
            isNewImg = true
        }
        //let canvas =  this.canvasHandler.drawCanvas(this.screen, data)
        if (this.frames % FPS == 0) {
            // console.log("Frames on :", this.frames)
        }
        this.streamHandler.stream(this.canvasHandler.canvas, isNewImg)
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
            round_index: `Round ${questionIndex + 1} / ${game.questions.length}`,
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
            round_index: `Result of round ${questionIndex + 1}`,
            time: this.time
        }
        if (this.redrawCanvas) {
            data.userAnswers.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.userAnswers[index].avatarImg = avatarImg
            })
            console.log("User answers on redraws: ", answers);
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
        console.log('Handle end stream')
        this.endMatch = true
        setTimeout(() => {
            this.streamHandler.end()
        }, 1000)
        
    }
}

module.exports = LiveStreamHandler