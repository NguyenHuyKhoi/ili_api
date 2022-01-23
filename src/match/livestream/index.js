
const {CanvasHandler, SCREENS, test_screen, SCREEN_IDS} = require("../../util/canvas");
const StreamHandler = require("../../util/stream");
const { MATCH_EVENTS } = require("../handler");
const { FacebookHandler } = require("./facebook");
const { YoutubeHandler } = require("./youtube");
const {CANVAS_WIDTH, CANVAS_HEIGHT} = require('../../util/canvas/dimension')
const {QUESTION_TYPES_ID} = require('../model')
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

        // For test
        this.updateData()
    }
    
    extractAnswerCount = (stage) => {
        try {
            var {question, answers} = stage
            var {correct_answer, typeId} = question 
            var arr = []
            switch (typeId) {
                case QUESTION_TYPES_ID.MULTIPLE_CHOICE: 
                    arr = [{ value: 'A', count: 0}, { value: 'B', count: 0},{ value: 'C', count: 0},{ value: 'D', count: 0}]
                    answers.forEach((answer) => {
                        var idx = parseInt(answer.answerContent)
                        arr[idx].count = arr[idx].count + 1
                    })
                    return arr
    
                case QUESTION_TYPES_ID.TF_CHOICE: 
                    arr = [{ value: 'True', count: 0}, { value: 'False', count: 0}]
                    answers.forEach((answer) => {
                        var idx = parseInt(answer.answerContent)
                        arr[idx].count = arr[idx].count + 1
                    })
                    return arr
                default: 
                    return []
            }
    
    
        }
    
        catch (err) {
            console.log("Err extract count:", err);
            return []
        }
    }

    updateData = () => {
        const {progress, questionIndex} = this.match
        this.answer_counts =  [0,0,0,0]
        if (progress != undefined && progress.length >=1 ) {
            // update current question: 
            let current = progress[questionIndex]
            this.question = current.question
            
            this.answer_counts = this.extractAnswerCount(current)
        }
    }
    convertScreenName = () => {
        switch (this.screen.id) {
            case SCREEN_IDS.WAITING_LIVE_ID: 
                return 'Waiting live screen'
            case SCREEN_IDS.WAITING_ID: 
                return 'Waiting screen'

            case SCREEN_IDS.QUESTION_MULTIPLE_ID: 
                return 'Question multiple screen'
            case SCREEN_IDS.QUESTION_MULTIPLE_END_ID: 
                return 'Question multiple end screen'
            case SCREEN_IDS.QUESTION_TF_ID: 
                return 'Question TF screen'
            case SCREEN_IDS.QUESTION_TF_END_ID: 
                return 'Question tf end screen'
            case SCREEN_IDS.QUESTION_PICWORD_ID: 
                return 'Question picword screen'

            case SCREEN_IDS.QUESTION_PICWORD_END_ID: 
                return 'Question picword end screen'
            case SCREEN_IDS.QUESTION_WORD_TABLE_ID: 
                return 'Question word table screen'
            case SCREEN_IDS.QUESTION_WORD_TABLE_END_ID: 
                return 'Question word table end screen'
            case SCREEN_IDS.LEADER_BOARD_ID: 
                return 'Leader board screen'
            case SCREEN_IDS.END_ID: 
                return 'End screen'
            default: 
                return ''
        }
    }
    selectQuestionEndScreen = () => {
        var question = this.question
        switch (question.typeId) {
            case QUESTION_TYPES_ID.MULTIPLE_CHOICE :
                this.screen = SCREENS.QUESTION_MULTIPLE_END
                break
            case QUESTION_TYPES_ID.TF_CHOICE :
                this.screen = SCREENS.QUESTION_TF_END
                break
            case QUESTION_TYPES_ID.PIC_WORD :
                this.screen = SCREENS.QUESTION_PICWORD_END
                break
            case QUESTION_TYPES_ID.WORD_TABLE :
                this.screen = SCREENS.QUESTION_WORD_TABLE_END
                break
            default:
                return  
        }

    }

    selectQuestionScreen = () => {
        var question = this.question
        switch (question.typeId) {
            case QUESTION_TYPES_ID.MULTIPLE_CHOICE :
                this.screen = SCREENS.QUESTION_MULTIPLE
                break
            case QUESTION_TYPES_ID.TF_CHOICE :
                this.screen = SCREENS.QUESTION_TF
                break
            case QUESTION_TYPES_ID.PIC_WORD :
                this.screen = SCREENS.QUESTION_PICWORD
                break
            case QUESTION_TYPES_ID.WORD_TABLE :
                this.screen = SCREENS.QUESTION_WORD_TABLE
                break
            default:
                return  
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
                //console.log("Emitted event ON_QUESTION_END:")
                this.redrawCanvas = true
                this.match = match
                this.updateData()
                this.selectQuestionEndScreen()
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
                this.screen = SCREENS.END
                this.updateData()
                break
            case MATCH_EVENTS.ON_QUESTION:
                //console.log("Emitted event ON_QUESTION:")
                console.log("Set isRetrieveAnswer is False");
                this.isRetrievedAnswers = false
                this.redrawCanvas = true
                this.match = match
                this.updateData()
                this.selectQuestionScreen()
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
                this.screen = SCREENS.WAITING
                this.match = match
                break
        }
    }

    prepareCanvas = async () => {
        console.log("Init canvas ");
        this.canvasHandler = new CanvasHandler(CANVAS_WIDTH, CANVAS_HEIGHT)
        await this.canvasHandler.prepare()
    }

    prepareStream = async () => {
        let match = this.match
        let {streamUrl, livestreamId, platform, liveChatId, accessToken } = match.livestream
        this.streamHandler = new StreamHandler(streamUrl, FPS)
        this.platformHander = 
            platform == 'facebook' ?    
               new  FacebookHandler(livestreamId, accessToken)
                :
               new  YoutubeHandler(liveChatId)
    }
    prepare = async () => {


        await this.prepareCanvas()
        await this.prepareStream()

        this.screen = SCREENS.WATING_LIVE
        this.time = 0
    }


    testScreen = (screenId) => {
        this.time = 0
        this.isRetrievedAnswers = true
        console.log("Draw test screen Id:", screenId, (screenId == SCREEN_IDS.WAITING_LIVE_ID));
        var screen = Object.values(SCREENS).find((item) => item.id == parseInt(screenId))
        console.log("Found screen:", screen);
        if (screen == undefined) {
            console.log("Screen not found");
            return
        }
        this.screen = screen
        this.showCurrentScreen()
    }

    start = async () => {
        // await this.prepare()

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


        this.isRetrievedAnswers = true 
        // if (this.screen.id == SCREENS.QUESTION_END){
        //     let duration = match.showQuestionEndTime - this.time
        //     if  (duration >= platformHander.STREAM_LATENCY && duration <=  platformHander.STREAM_LATENCY + 2) {
        //         this.isRetrievedAnswers = true 
        //     }
          
        // }
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

    showCurrentScreen = () => {
        if (this.endMatch == true) {
            console.log("match is end, exit");
            return
        }

        console.log("Show current screen");
        switch (this.screen.id) {
            case SCREEN_IDS.WAITING_LIVE_ID: 
                this.onWaitingLive()
                break
            case SCREEN_IDS.WAITING_ID: 
                this.onWaiting()
                break
            case SCREEN_IDS.QUESTION_MULTIPLE_ID: 
                this.onQuestionMultiple()
                break;
            case SCREEN_IDS.QUESTION_MULTIPLE_END_ID: 
                this.onQuestionMultipleEnd()
                break
            case SCREEN_IDS.QUESTION_TF_ID: 
                this.onQuestionTF()
                break
            case SCREEN_IDS.QUESTION_TF_END_ID: 
                this.onQuestionTFEnd()
                break
            case SCREEN_IDS.QUESTION_PICWORD_ID: 
                this.onQuestionPicword()
                break
            case SCREEN_IDS.QUESTION_PICWORD_END_ID: 
                this.onQuestionPicwordEnd()
                break
            case SCREEN_IDS.QUESTION_WORD_TABLE_ID: 
                this.onQuestionWordTable()
                break
            case SCREEN_IDS.QUESTION_WORD_TABLE_END_ID:
                this.onQuestionWordTableEnd()
                break
            case SCREEN_IDS.LEADER_BOARD_ID: 
                this.onLeaderBoard()
                break
            case SCREEN_IDS.END_ID: 
                this.onEnd()
                break
            default: 
                return 
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
        //this.streamHandler.stream(this.canvasHandler.canvas, isNewImg)
    }

    onEndStream =  () => {
        console.log('Handle end stream')
        this.endMatch = true
        setTimeout(() => {
            this.streamHandler.end()
        }, 1000)
        
    }
    onWaitingLive = () => {
        let match = this.match
        const {game} = match
        const data = {
        }

        this.onStreamFrame(data)
    }
    onWaiting = () => {
        let match = this.match
        const {game} = match
        const data = {
            title: game.title,
            time: this.time
        }

        this.onStreamFrame(data)
    }

    onQuestionMultiple = () => {
        const match = this.match
        const {game, questionIndex} = match
        const question = this.question
        const data = {
            question,
            round_index: `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }

        console.log("Data on question multiple ", data.question, data.round_index, data.time);
        this.onStreamFrame(data)
    }

    onQuestionMultipleEnd = () => {
        console.log("Show question multiple end");
        let match = this.match
        const {game, questionIndex, progress} = match
        const stage = progress[questionIndex]

        const {question, answers} = stage

        const correctAnswers = answers.filter((item) => item.isCorrect == true)
        const data = {
            question,
            answer_counts: this.answer_counts,
            isLoading: !this.isRetrievedAnswers,
            userAnswers: correctAnswers.slice(0, Math.min(10, correctAnswers.length)),
            round_index:  `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }
        if (this.redrawCanvas) {
            data.userAnswers.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.userAnswers[index].avatarImg = this.canvasHandler.sample_avatar
                //avatarImg
            })
        }
        console.log("Data on question multiple  end", data.question, data.round_index, data.time, data.userAnswers);
        this.onStreamFrame(data)
    }

    onQuestionTF = () => {
        let match = this.match
        const {game, questionIndex} = match
        const question = this.question
        const data = {
            question,
            round_index: `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }

        console.log("Data on question TF ", data.question, data.round_index, data.time);
        this.onStreamFrame(data)
    }

    onQuestionTFEnd = () => {
        console.log("Show question multiple end");
        let match = this.match
        const {game, questionIndex, progress} = match
        const stage = progress[questionIndex]

        const {question, answers} = stage

        const correctAnswers = answers.filter((item) => item.isCorrect == true)
        const data = {
            question,
            answer_counts: this.answer_counts,
            isLoading: !this.isRetrievedAnswers,
            userAnswers: correctAnswers.slice(0, Math.min(10, correctAnswers.length)),
            round_index:  `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }
        if (this.redrawCanvas) {
            data.userAnswers.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.userAnswers[index].avatarImg = this.canvasHandler.sample_avatar
                //avatarImg
            })
        }
        console.log("Data on question multiple  end", data.question, data.round_index, data.time, data.userAnswers);
        this.onStreamFrame(data)
    }

    onQuestionPicword = () => {
        let match = this.match
        const {game, questionIndex} = match
        const question = this.question
        const data = {
            question,
            round_index: `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }

        console.log("Data on question TF ", data.question, data.round_index, data.time);
        this.onStreamFrame(data)
    }

    onQuestionPicwordEnd = () => {
        console.log("Show question multiple end");
        let match = this.match
        const {game, questionIndex, progress} = match
        const stage = progress[questionIndex]

        const {question, answers} = stage

        const correctAnswers = answers.filter((item) => item.isCorrect == true)
        const data = {
            question,
            isLoading: !this.isRetrievedAnswers,
            userAnswers: correctAnswers.slice(0, Math.min(10, correctAnswers.length)),
            round_index:  `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }
        if (this.redrawCanvas) {
            data.userAnswers.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.userAnswers[index].avatarImg = this.canvasHandler.sample_avatar
                //avatarImg
            })
        }
        console.log("Data on question picword  end", data.question, data.round_index, data.time, data.userAnswers);
        this.onStreamFrame(data)
    }

    onQuestionWordTable = () => {
        const match = this.match
        const {game, questionIndex, progress} = match
        const current = progress[questionIndex]
        const {open_word_states, answers} = current
        console.log("Current stage: ", current);
        const question = this.question
        const data = {
            question,
            userAnswers: answers.filter((item) => item.keywordIndex != undefined) ,
            open_word_states: open_word_states,
            round_index: `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }

        if (this.redrawCanvas) {
            data.userAnswers.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.userAnswers[index].avatarImg = this.canvasHandler.sample_avatar
                //avatarImg
            })
        }

        console.log("Data on question word table     ", data.question, data.round_index, data.time);
        this.onStreamFrame(data)
    }

    onQuestionWordTableEnd = () => {
        const match = this.match
        const {game, questionIndex, progress} = match
        const current = progress[questionIndex]
        const {open_word_states, answers} = current
        const question = this.question

        console.log("Answres:", answers);
        const players = []
        answers.forEach((item, index) => {
            if (item.keywordIndex != undefined) {
                var idx = players.findIndex((player) => player._id == item._id)
                if (idx != -1) {
                    players[idx].score = players[idx].score + item.earnScore
                }
                else {
                    players.push({
                        _id: item._id,
                        username: item.username,
                        avatar: item.avatar, 
                        score: item.earnScore
                    })
                }
            }
        })
        players.sort((a,b) => {
            if (a.score >= b.score) return -1
            return 1
        })
        const data = {
            question,
            players,
            open_word_states: open_word_states,
            round_index: `${questionIndex + 1} / ${game.questions.length}`,
            time: this.time
        }

        console.log("Data: ", data.players);
        if (this.redrawCanvas) {
            data.players.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.players[index].avatarImg = this.canvasHandler.sample_avatar
                //avatarImg
            })
        }
        console.log("On call draw question word table end", players);
        this.onStreamFrame(data)
    }

    onLeaderBoard = () => {
        const match = this.match
        const {players} = match
        players.sort((a,b) => {
            if (a.score >= b.score) return -1
            return 1
        })
        const data = {
            players: players.slice(0, Math.min(9, players.length)),
            time: this.time
        }
        if (this.redrawCanvas) {
            data.players.forEach((item, index) => {
                let avatarImg = this.canvasHandler.getRemoteImages(item.avatar)
                data.players[index].avatarImg = this.canvasHandler.sample_avatar
                //avatarImg
            })
        }
        console.log("Players:", data.players);
        this.onStreamFrame(data)
    }

    onEnd = () => {
        let match = this.match
        const {game} = match
        const data = {
            title: game.title,
            time: this.time
        }

        this.onStreamFrame(data)
    }


}

module.exports = LiveStreamHandler