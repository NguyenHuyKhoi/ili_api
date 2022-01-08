
const {Match} = require('./model')
const {Game} = require('../game/model')

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
                match.players[index].name = player.name

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

    handleEndQuestion = () => {
        let match = this.match
        const {progress, players, host} = match
        let current = progress[progress.length - 1 ]
        
        current.answers.find((answerPlayer, index) => {
            let earnScore = this.calculateScore(current.question, answerPlayer)
            current.answers[index].earnScore = earnScore
        })

        players.forEach((player, index) => {
            // If not answer: 
            let answerPlayer = current.answers.find((item) => item._id == player._id)
            if (!answerPlayer) {
                if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.PLAYER_NOT_ANSWER, {
                    rid: player._id
                })
            }
            else if (answerPlayer.isCorrect) {
                players[index].score = players[index].score + answerPlayer.earnScore
                if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.PLAYER_ANSWER_CORRECT, {
                    rid: player._id,
                    earnScore: answerPlayer.earnScore
                })
            }
            else {
                players[index].score = players[index].score + answerPlayer.earnScore
                if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.PLAYER_ANSWER_WRONG, {
                    rid: player._id,
                    earnScore: answerPlayer.earnScore
                })
            }  
        })

        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_QUESTION_END, {
            rid: host._id,
            match
        })

        // Must config on setting match
        let time = match.showQuestionEndTime || 10
        const waitingTimer = setInterval( () => {
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
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_LEADERBOARD, {
            rid: match.pinCode,
            match
        })

        // Must config in setting match
        let time = match.showLeaderboardTime || 10
        const waitingTimer = setInterval( () => {
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

    analysic = () => {
        let match = this.match
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
        match.finishAt = new Date()
        match.players.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0))
        // Calculate 
        this.analysic()
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
    
    handleEndMatch = () => {
        let match = this.match
        match.state = 'finished'
        this.handleUpdateToDB()
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_END_MATCH, {
            rid: match.pinCode
        })
    }

    countdownOnEnd = () => {
        let match = this.match
        let time = match.delayEndTime || 60
        let _interval = setInterval(() => {
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

        let item = {
            question: match.game.questions[match.questionIndex],
            answers: [],
            startAt: new Date()
        }
        match.progress.push({...item})

        this.handleAskQuestion()
    }

    handleAskQuestion = () => {
        let match = this.match

        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_QUESTION, {
            rid: match.pinCode,
            match
        })

        let question = match.progress[match.progress.length -1].question
        let time = question.time_limit || 30
        const answerTimer = setInterval( () => {
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
        let time = match.delayStartTime || 30
        let _interval = setInterval(() => {
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
        let match = this.match
        if (this.subcriber) this.subcriber.emit(MATCH_EVENTS.ON_START, {
            rid: match.pinCode,
            Match
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
        let answerDuration = time_limit - answerTime
        let bonusTimeScore = ( 1 - (answerDuration / time_limit / 2)) * correctScore

        // Add bonusStreakScore...
        return correctScore + bonusTimeScore
    }

    // pass: only _id
    onAnswer = (player, answerIndex, answerTime) => {
        let match = this.match
        let current = match.progress[match.progress.length - 1]
        const {question} = current 
        if (answerTime >= question.time_limit) {
            console.log("Answer over time, emited")
            return
        }

        let existPlayer = this.findPlayer(player._id)
        if (!existPlayer) this.addPlayer(player) 

        let isCorrect = question.correct_answers.indexOf(answerIndex) != -1

        let answerPlayer = {
            ...player,
            answerIndex: answerIndex,
            answerTime: answerTime,
            isCorrect
        }
        current.answers.push({...answerPlayer})
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
        this.onSync()
    }

    onUnlock = () => {
        let match = this.match
        match.state = 'waiting'
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