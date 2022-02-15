
const {Match, QUESTION_TYPES_ID} = require('./model')
const MATCH_EVENTS = {
    ON_SYNC: 0,
    PLAYER_LEAVE: 1,
    PLAYER_NOT_ANSWER: 2,
    PLAYER_ANSWER_CORRECT: 3,
    PLAYER_ANSWER_WRONG: 4,
    ON_QUESTION_END: 5,
    ON_COUNTDOWN: 6,
    ON_LEADERBOARD: 7,
    ON_SUMMARY: 8,
    ON_QUESTION: 9,
    ON_KICK_PLAYER: 10,
    ON_COUNTDOWN_TO_START: 11,
    ON_COUNTDOWN_TO_END: 12,
    ON_END_MATCH: 13,
    ON_START: 14
}
class MatchHandler {
    constructor(match) {
        this.match = match

        this.isCalledStart = false
    }

    // For socket: subcribe is io object 
    // For livestream: subcribe is livestreamHandler 
    subcribe = (subcriber) => {
        this.subcriber = subcriber
        this.onSync()
    }

    // Player._id: classic-socket : socketId ,
    // Livestream: userId on platform
    join = (player) => {
        let match = this.match
        player.score = 0
        if (match.state == 'waiting') {
            this.addPlayer(player)
            return true 
        }
        else {
            return false
        }
    }

    findPlayer = (_id) => {
        return this.match.players.find((item) => _id == item._id)
    }

    addPlayer = (player) => {
        player.score = 0
        let match = this.match
        if (!this.findPlayer(player._id)){
            match.players.push({...player})
            this.onSync()
        }
        else {
        }
    }

    updatePlayer = (player) => {
        let match = this.match
        match.players.forEach((item, index) => {
            if (item._id == player._id) {
                match.players[index].username= player.username

            }
        });
        this.onSync()
    }

    removePlayer = (_id) => {
        let match = this.match
        const index = match.players.findIndex((item) => _id == item._id)
        if (index != -1) {
            let removedPlayer = {...match.players[index]._doc}
            match.players.splice(index, 1)
            this.onSync()
            return removedPlayer
        }
        else {
            return null
        }
    
    }

    leavePlayer = (_id) => {
        let match = this.match
        let player = this.removePlayer(_id, match)
        if (!player) return
        this.onSync()
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.PLAYER_LEAVE, {
            rid: match.pinCode,
            player
        })
    }
    notifQuestionResultPlayer = (player, index, duration) => {
        let match = this.match 
        let {players, progress} = match
        let stage = progress[progress.length - 1]

        switch (stage.question.typeId) {
            case QUESTION_TYPES_ID.MULTIPLE_CHOICE:
            case QUESTION_TYPES_ID.TF_CHOICE:
            case QUESTION_TYPES_ID.PIC_WORD: 
              // If not answer: 
                let answerPlayer = stage.answers.find((item) => item._id == player._id)
                if (!answerPlayer) {
                    if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.PLAYER_NOT_ANSWER, {
                        rid: player._id,
                        timeTotal: duration
                    })
                }
                else if (answerPlayer.isCorrect) {
                    if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.PLAYER_ANSWER_CORRECT, {
                        rid: player._id,
                        earnScore: answerPlayer.earnScore,
                        timeTotal: duration
                    })
                }
                else {
                    if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.PLAYER_ANSWER_WRONG, {
                        rid: player._id,
                        earnScore: answerPlayer.earnScore,
                        timeTotal: duration
                    })
                }  
                break
            case QUESTION_TYPES_ID.WORD_TABLE:
                if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_QUESTION_END, {
                    rid: player._id,
                    match,
                    timeTotal: duration
                })
                break
            default: 
                break
        }

    }

    calculateEarnScores = (time) => {
        let match = this.match
        const {progress, players, host} = match
        let current = progress[progress.length - 1 ]
        current.answers.forEach((answerPlayer, index) => {
            if (current.answers[index].isCalculated == true) {
                return
            }
            let earnScore = this.calculateScore(current.question, answerPlayer)
            current.answers[index].earnScore = earnScore
            let idx = players.findIndex((player) => player._id == answerPlayer._id)
            if (idx != -1) {
                players[idx].score += answerPlayer.earnScore
            }
            current.answers[index].isCalculated = true
        })

        players.sort((a,b) => {
            if (a.score > b.score) return -1
            if (a.score == b.score) {
                if (a.username < b.username) {
                    return -1
                }
            }
            return 1
        })

        this.onSync()
    }

    handleEndQuestion = () => {
        let match = this.match
        const {progress, players, host} = match
        this.handleUpdateToDB()
        // Must config on setting match
        let time = match.showQuestionEndTime != undefined ? match.showQuestionEndTime : 10
        this.calculateEarnScores(time)

        players.forEach((player, index) => {
            this.notifQuestionResultPlayer(player, index, time)
        })

        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_QUESTION_END, {
            rid: host._id,
            match,
            timeTotal: time
        })
        const waitingTimer = setInterval( () => {
            
            if (this.match.state == 'finished'){
                clearInterval(waitingTimer)
                return
            }
            time --
            if (time <= 0) {
                clearInterval(waitingTimer)
                this.handleShowLeaderBoard()
            }
            else {
                if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_COUNTDOWN, {
                    rid: match.pinCode,
                    time
                })
            }
        }, 1000)
    }

    handleShowLeaderBoard = () => {
        let match = this.match

        // Must config in setting match
        let time = match.showLeaderboardTime != undefined ? match.showLeaderboardTime : 10
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_LEADERBOARD, {
            rid: match.pinCode,
            match,
            timeTotal: time
        })
        const waitingTimer = setInterval( () => {
            if (this.match.state == 'finished'){
                clearInterval(waitingTimer)
                return
            }
            time --
            if (time <= 0) {
                clearInterval(waitingTimer)
                this.handleNextQuestion()
            }
            else {
                if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_COUNTDOWN, {
                    rid: match.pinCode,
                    time
                })
            }
        }, 1000)
    }    

    analysis = () => {
        let match = this.match
        match.finishAt = new Date()
        match.players.sort((a,b) => {
            if (a.score > b.score) return -1
            if (a.score == b.score) {
                if (a.username < b.username) {
                    return -1
                }
            }
            return 1
        })
        match.players.forEach((player, index) => {
            match.players[index].rank = index + 1

            let quesNum = match.progress.length 
            let correctNum = match.progress.filter((stage) => {
              return stage.answers.find((answer) => answer._id == player._id && answer.isCorrect == true)
            }).length

            let incorrectNum = match.progress.filter((stage) => {
                return stage.answers.find((answer) => answer._id == player._id && answer.isCorrect == false)
            }).length

            let unanswerNum = quesNum - correctNum -incorrectNum

            match.players[index].correctNum = correctNum
            match.players[index].incorrectNum = incorrectNum
            match.players[index].unanswerNum = unanswerNum
        })

        match.progress.forEach((stage, index) => {
            let correctNum = stage.answers.filter((answer) => answer.isCorrect).length
            let incorrectNum = stage.answers.filter((answer) => answer.isCorrect == false).length
            let unanswerNum = match.players.length - stage.answers.length 
            let answerTimeAvg =  stage.answers.length == 0 ? 0 :
                stage.answers.reduce((res, answer) => res += (stage.question.time_limit) - answer.answerTime, 0) 
                / stage.answers.length

            match.progress[index].correctNum = correctNum
            match.progress[index].incorrectNum = incorrectNum
            match.progress[index].unanswerNum = unanswerNum
            match.progress[index].answerTimeAvg = answerTimeAvg
        })
    }

    handleSummary =  () => {
        let match = this.match
        // Calculate 
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_SUMMARY, {
            rid: match.pinCode,
            match
        })

        this.handleUpdateToDB()

        if (match.delayEndTime > 0) {
            if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_COUNTDOWN_TO_END, {
                rid: match.pinCode
            })
            this.countdownOnEnd()
        }
        else {
            this.handleEndMatch()
        }
    }
    
    updateLivestreamUrl = (url) => {
        let match = this.match 
        console.log("Update livestream url on match handler: ", url, match.livestream)
        if (match.livestream == null) {
            return
        }
        match.livestream.livestreamUrl = url
        this.handleUpdateToDB()
        console.log("Update livestream url :", url)
    }
    handleEndMatch = () => {
        let match = this.match
        this.analysis()
        this.match.finishAt = new Date()
        this.match.state = 'finished'
        this.handleUpdateToDB()
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_END_MATCH, {
            rid: match.pinCode
        })
    }

    countdownOnEnd = () => {
        let match = this.match
        let time = match.delayEndTime != undefined ? match.delayEndTime : 60
        let _interval = setInterval(() => {
            if (this.match.state == 'finished'){
                clearInterval(_interval)
                return
            }
            time-- 
            if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_COUNTDOWN, {
                rid: match.pinCode,
                time
            })
            if (time <= 0) {
                clearInterval(_interval)
                this.handleEndMatch()
            }
        }, 1000)
    }

    handleUpdateToDB = async () => {
        let match =  this.match
        await Match.updateOne(  
            { _id: match._id },
            { $set: { ...match }},
            { new: true}
        )
    }

    handleNextQuestion = () => {
        let match = this.match
        // play linear :
        if (match.questionIndex == undefined) {
            match.questionIndex = 0
        }
        else if (match.questionIndex < match.game.questions.length -1) {
            match.questionIndex ++
        }
        else {
            this.handleSummary()
            return 
        }

        var question = match.game.questions[match.questionIndex]
        let item = {
            question,
            answers: [],
            startAt: new Date()
        }

        if (question.typeId == QUESTION_TYPES_ID.WORD_TABLE) {
            item.open_word_states = Array(question.correct_answers.length).fill(0)
        }
        match.progress.push({...item})

        this.handleAskQuestion()
    }

    handleAskQuestion = () => {
        let match = this.match
        let question = match.progress[match.progress.length -1].question
        let time = question.time_limit != undefined ? question.time_limit : 30

        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_QUESTION, {
            rid: match.pinCode,
            match,
            timeTotal: time
        })
        const answerTimer = setInterval( () => {
            // console.log("This.state.match ", this.match.state)
            if (this.match.state == 'finished'){
                clearInterval(answerTimer)
                return
            }
            time = time - 1
            if (time <= 0 ) {
                clearInterval(answerTimer)
                this.handleEndQuestion()
            }
            else {
                if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_COUNTDOWN, {
                    rid: match.pinCode,
                    time
                })
            }
        }, 1000);
    }

    countdownOnStart = () => {
        let match = this.match
        let time = match.delayStartTime != undefined ? match.delayStartTime : 30
        let _interval = setInterval(() => {
            if (this.match.state == 'finished'){
                clearInterval(_interval)
                return
            }
            time-- 
            if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_COUNTDOWN, {
                rid: match.pinCode,
                time
            })
            if (time <= 0) {
                clearInterval(_interval)
                this.onStart(true)
            }
        }, 1000)
    }
    

    onStart = (startNow = false) => {
        if (startNow == false && this.isCalledStart) {
            console.log("Match is started before...")
            return
        }
        this.isCalledStart = true
        console.log("Call start the match", startNow)
        let match = this.match
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_START, {
            rid: match.pinCode,
            match
        })
        if (match.delayStartTime > 0 && (startNow == false)) {
            if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_COUNTDOWN_TO_START, {
                rid: match.pinCode
            })
            this.countdownOnStart()
        }
        else {
            match.state = 'playing'
            this.handleNextQuestion()
        }

    }

    calculateScore = (question, answerPlayer) => {
        const {isCorrect, answerTime} = answerPlayer
        const {score, time_limit} = question
        if (!isCorrect) return 0 
        let correctScore = score != undefined ? score : 1000
        let bonusTimeScore = ( 1 - (answerTime / time_limit / 2)) * correctScore

        // Add bonusStreakScore...
        let iNum = Math.round(correctScore + bonusTimeScore)
        let num = Math.round(iNum / 10) * 10
        return num
    }

    checkAnswer = (stage, content) => {
        const {question} = stage 
        console.log("Check answer : ", content);
        switch (question.typeId) {
            case QUESTION_TYPES_ID.MULTIPLE_CHOICE:
            case QUESTION_TYPES_ID.TF_CHOICE:
            case QUESTION_TYPES_ID.PIC_WORD:
                return {
                    isCorrect: question.correct_answer == content
                }
            case QUESTION_TYPES_ID.WORD_TABLE: 
                var idx = question.correct_answers.findIndex((item) => item == content)
                if (idx == -1) {
                    return {
                        isCorrect: false
                    }
                }
                else {
                    console.log("State qestion:", stage.open_word_states[idx], idx);
                    if (stage.open_word_states[idx] == 1) { // Open before
                        console.log("Some one answer keyword before");
                        return {
                            isCorrect: false
                        }
                    }
                    console.log("You are the first answer keyword");
                    stage.open_word_states[idx] = 1
                    return {
                        isCorrect: true,
                        keywordIndex: idx
                    }
                }
            default: 
                return {}
        }
    }

    // pass: only _id
    onAnswer = (player, answerContent, answerTime) => {
        console.log("Get answer: ", player, answerContent, answerTime)
        let match = this.match
        let current = match.progress[match.progress.length - 1]
        const {question} = current 
        if (answerTime >= question.time_limit) {
            console.log("Answer over time, answerTime")
            return
        }

        let existPlayer = this.findPlayer(player._id)
        if (!existPlayer) this.addPlayer(player) 

        // For Multiple/TF/PicWord -> check directly as this 
        let resData = this.checkAnswer(current, answerContent)

        console.log("res data after check:", resData);
        // For Quiz Word: check if answer is correct : in [correct_answers] and open_word_states[index] = 0
        // Update open_word_states[index] = 1 and keywordIndex of answer : index

        // For display in client: show all open keyword = 1 in table
        // Show all answer has keyword is != undefined

        let answerPlayer = {
            ...JSON.parse(JSON.stringify(player)),
            answerContent: answerContent,
            answerTime: answerTime,
            ...resData
        }
    
        current.answers.push(JSON.parse(JSON.stringify(answerPlayer)))
        this.onSync()
    }

    onKickPlayer = (_id) =>  {
        let match = this.match
        let player =  this.removePlayer(_id)
        if (!player) return
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_KICK_PLAYER, {
            rid: match.pinCode,
            player
        })
    }

    onLock = () => {
        let match = this.match
        match.state = 'locking'
        console.log("Lock match")
        this.onSync()
    }

    onUnlock = () => {
        let match = this.match
        match.state = 'waiting'
        console.log("UnLock match")
        this.onSync()
    }

    onSync = () => {
        let match = this.match
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_SYNC, {
            rid: match.pinCode,
            match
        })
    }
}

module.exports = {
    MatchHandler,
    MATCH_EVENTS
}