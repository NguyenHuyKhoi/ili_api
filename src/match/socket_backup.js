
const Match = require('./model')
const {Game} = require('../game/model')
// Pincode == id 
const createMatch = async (match) => {
    return await new Match(match).save()
}

const updateMatch = async (match) => {
    await Match.updateOne(  
        { _id: match._id },
        { $set: { ...match }},
        { new: true}
    )
}

const findMatch = async (pinCode) => {
    let match = await Match.findOne({pinCode})
    return match
}

const findPlayer = (player, match) => {
    return match.players.find((item) => player.socketId == item.socketId)
}

const addPlayer = async (player, match) => {
    console.log("Add Player in match: ", player)
    if (!findPlayer(player, match)){
        match.players.push(player)
        await updateMatch(match)
    }
}

const updatePlayer = async (player, match) => {
    match.players.forEach((item, index) => {
        if (item.socketId == player.socketId) {
            console.log("Find updated player: ", player)
            match.players[index] = player
        }
    });
    await updateMatch(match)
}

const removePlayer = async (player, match) => {
    const index = match.players.findIndex((item) => player.socketId == item.socketId)
    if (index != -1) {
        let removedPlayer = {...match.players[index]._doc}
        match.players.splice(index, 1)
        await updateMatch(match)
        return removedPlayer
    }

}

module.exports =  (io, socket) => {

    const syncData = async (pinCode) => {
        let match = await findMatch(pinCode)
        if (match) {
            io.to(pinCode).emit('match:sync', match)
        }
    }
    
    const onJoin = async (pinCode, callback) => {
        let player = { socketId: socket.id, score: 0, name: '???' }
        let match = await findMatch(pinCode)
        if (match && match.state == 'waiting') {
            await addPlayer(player, match)
            socket.join(match.pinCode)
            syncData(pinCode)       
            callback(match)    
        }
        else {
            callback(null)
        }
    }

    const onLeave = async (pinCode, callback) => {
        let player = { socketId: socket.id }
        let match = await findMatch(pinCode)
        console.log("Handler leave with player :",pinCode,  player)
        if (match) {
            let removedPlayer = await removePlayer(player, match)
            io.to(pinCode).emit('match:playerLeave', removedPlayer)
            console.log("Removed player: ", removedPlayer)
            syncData(pinCode)
            callback(true)           
        }
        else {
            callback(false)
        }
    }

    const onHost = async (host, gameId, callback) => {
        let match = {}
        match.game = await Game.findOne({_id: gameId})

        if (!match.game) {
            callback(null)
            return 
        }
        match.startAt = new Date()
        match.host = host
        match.players = []
        match.pinCode = (new Date()).getMilliseconds()
        match.state = 'waiting'
        match = await createMatch(match)
        socket.join(match.pinCode)
        syncData(match.pinCode)
        callback(match)
    }

    const onUpdatePlayer = async (pinCode, updatedPlayer, callback) => {
        let match = await findMatch(pinCode)
        console.log("Updated Player received: ", updatedPlayer)
        if (match) {
            let player = findPlayer({socketId: socket.id}, match)
            if (player) {
                // Because player is schema
                player.name = updatedPlayer.name
                console.log("Updated Player:", player)
                await updatePlayer(player, match)
                syncData(pinCode)
                callback(true)
            }
            else {
                callback(false)
            }
        }
        else {
            callback(false)
        }
    }

    const onUpdate = async (pinCode, callback) => {
        let match = await findMatch(pinCode)
        if (match) {
            callback(match)
        }
    }
    const handleEndQuestion = async (pinCode) => {
        let match = await findMatch(pinCode)
        if (!match) return 


        const {progress, players, host} = match
        let current = progress[progress.length - 1 ]
        
        current.answers.find((answerPlayer, index) => {
            let earnScore = calculateScore(current.question, answerPlayer)

            current.answers[index].earnScore = earnScore
        })

        players.forEach((player, index) => {
            // If not answer: 
            let answerPlayer = current.answers.find((item) => item.socketId == player.socketId)
            if (!answerPlayer) {
                io.to(player.socketId).emit('match:onNotAnswer')
            }
            else if (answerPlayer.isCorrect) {
                players[index].score = players[index].score + answerPlayer.earnScore
                io.to(player.socketId).emit('match:onCorrectAnswer', answerPlayer.earnScore)
            }
            else {
                players[index].score = players[index].score + answerPlayer.earnScore
                io.to(player.socketId).emit('match:onWrongAnswer', answerPlayer.earnScore)
            }  
        })

        await updateMatch(match)

        io.to(host.socketId).emit('match:onEndQuestion', match)

        let time = 5
        const waitingTimer = setInterval( () => {
            time --
            if (time <= 0) {
                clearInterval(waitingTimer)
                handleShowScoreBoard(pinCode)
            }
            else {

                io.to(pinCode).emit('match:onCountdown', time)
            }
           
        }, 1000)
    }

    const handleShowScoreBoard = async (pinCode) => {
        let match = await findMatch(pinCode) 
        if (!match) return 
        io.to(pinCode).emit('match:scoreboard', match)
        let time = 5
        const waitingTimer = setInterval( () => {
            time --
            if (time <= 0) {
                clearInterval(waitingTimer)
                handleNextQuestion(pinCode)
            }
            else {
                console.log("Countdown waiting:", time)
                io.to(pinCode).emit('match:onCountdown', time)
            }
           
        }, 1000)
    }    

    const handleEndMatch = async (pinCode) => {
        let match = await findMatch(pinCode) 
        if (!match) return 

        match.finishAt = new Date()
        match.state = 'finished' 

        // Calculate 
        match.players.sort((a,b) => (a.score > b.score) ? -1 : ((b.score > a.score) ? 1 : 0))
        match.players.forEach((player, index) => {
            match.players[index].rank = index + 1

            let quesNum = match.progress.length 
            let correctNum = match.progress.filter((stage) => {
              return stage.answers.find((answer) => answer.socketId == player.socketId && answer.isCorrect == true)
            }).length

            let incorrectNum = match.progress.filter((stage) => {
                return stage.answers.find((answer) => answer.socketId == player.socketId && answer.isCorrect == false)
            }).length

            let unanswerNum = quesNum - correctNum -incorrectNum

            console.log("Calculate for player :", correctNum, incorrectNum, unanswerNum)
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
    
        await updateMatch(match)
        io.to(pinCode).emit('match:onEnd', match)
    }
    const handleNextQuestion = async (pinCode) => {
        let match = await findMatch(pinCode)
        if (!match) return 
        // play linear :
        if (match.questionIndex == undefined) {
            match.questionIndex = 0
        }
        else if (match.questionIndex < match.game.questions.length -1) {
            match.questionIndex ++
        }
        else {
            handleEndMatch(pinCode)
            return 
        }
        console.log("Question Index: ", match.questionIndex)

        let item = {
            question: match.game.questions[match.questionIndex],
            answers: [],
        }
        match.progress.push({...item})
        await updateMatch(match)

        await handleAskQuestion(pinCode)
    }

    const handleAskQuestion = async (pinCode) => {
        let match = await findMatch(pinCode)
        if (!match) return 

        io.to(pinCode).emit('match:onQuestion', match)
        // Countdown
        let question = match.progress[match.progress.length -1].question
        let time = question.time_limit
        const answerTimer = setInterval( () => {
            time = time - 1
            if (time <= 0 ) {
                clearInterval(answerTimer)
                handleEndQuestion(pinCode)
            }
            else {
                io.to(pinCode).emit('match:onCountdown', time)
            }
        }, 1000);
    }
    
    const onStart = async (pinCode) => {
        let match = await findMatch(pinCode)
        match.state = 'playing'
        await updateMatch(match)
        if (match) {
            await handleNextQuestion(pinCode)
        }
    }

    const calculateScore = (question, answerPlayer) => {
        console.log("Calculate score: ", question, answerPlayer)
        const {isCorrect, answerTime} = answerPlayer
        const {score, time_limit} = question

        if (!isCorrect) return 0 
        let correctScore = score != undefined ? score : 1000
        let answerDuration = time_limit - answerTime
        let bonusTimeScore = ( 1 - (answerDuration / time_limit / 2)) * correctScore

        // Cal bonusStreakScore
        return correctScore + bonusTimeScore
    }

    const onAnswer = async (pinCode, answerIndex, answerTime) => {
        let match = await findMatch(pinCode)
        if (!match) return 
        let player = await findPlayer({socketId: socket.id}, match)
        if (!player) return 

        let current = match.progress[match.progress.length - 1]
        
        const {question} = current 
        let isCorrect = question.correct_answers.indexOf(answerIndex) != -1


        let answerPlayer = {
            socketId: socket.id,
            name: player.name,
            answerIndex: answerIndex,
            answerTime: answerTime,
            isCorrect
        }

        console.log("Receive answer: ", answerPlayer)
        current.answers.push({...answerPlayer})
        await updateMatch(match)
        syncData(pinCode)
    }

    const onKickPlayer = async (pinCode, player, callback) =>  {
        let match = await findMatch(pinCode)
        console.log("Handler leave with player :",pinCode,  player)
        if (match) {
            let kickedPlayer = await removePlayer(player, match)
            io.to(pinCode).emit('match:kickPlayerDone', kickedPlayer)
            console.log("Kicked player: ", kickedPlayer)
            syncData(pinCode)
            callback(true)           
        }
        else {
            callback(false)
        }
    }
    const onLock = async (pinCode, callback) => {
        let match = await findMatch(pinCode)
        if (match) {
            match.state = 'locking'
            await updateMatch(match)
            syncData(pinCode)
            callback(true)
        }
        else {
            callback(false)
        }
    }

    const onUnlock = async (pinCode, callback) => {
        let match = await findMatch(pinCode)
        if (match) {
            match.state = 'waiting'
            await updateMatch(match)
            syncData(pinCode)
            callback(true)
        }
        else {
            callback(false)
        }
    }

    socket.on('match:join', onJoin)
    socket.on('match:leave', onLeave)
    socket.on('match:host', onHost)
    socket.on('match:updatePlayer', onUpdatePlayer)
    socket.on('match:requireSync', onUpdate)
    socket.on('match:start', onStart)
    socket.on('match:answer', onAnswer)
    socket.on('match:kickPlayer', onKickPlayer)
    socket.on('match:lock', onLock)
    socket.on('match:unlock', onUnlock)
}