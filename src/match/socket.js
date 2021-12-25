
const Match = require('./model')
const Game = require('../game/model')
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
    let match = await Match.findOne({pinCode, is_finished: false})
    return match
}

const findUser = (user, match) => {
    return match.users.find((item) => user.socketId == item.socketId)
}

const addUser = async (user, match) => {
    console.log("Add user in match: ", user)
    if (!findUser(user, match)){
        match.users.push(user)
        await updateMatch(match)
    }
}

const updateUser = async (user, match) => {
    match.users.forEach((item, index) => {
        if (item.socketId == user.socketId) {
            match.users[index] = {...user}
        }
    });
    console.log("Updated Match after update user: ", match)
    await updateMatch(match)
}

const removeUser = async (user, match) => {
    const index = match.users.findIndex((item) => user.socketId != item.socketId)
    if (index != -1) {
        match.users.splice(index, 1)
        await updateMatch(match)
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
        let user = { socketId: socket.id }
        let match = await findMatch(pinCode)
        if (match) {
            await addUser(user, match)
            socket.join(match.pinCode)

            syncData(pinCode)       
            callback(match)    
        }
        else {
            callback(null)
        }
    }

    const onLeave = async (pinCode, callback) => {
        let user = { socketId: socket.id }
        let match = await findMatch(pinCode)
        console.log("Handler leave with user :",pinCode,  user)
        if (match) {
            await removeUser(user, match)
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
        match.host = host
        match.users = []
        match.pinCode = '111'
        //(new Date()).getMilliseconds()
        console.log("create match: ", match)
        match = await createMatch(match)
        console.log("after create match: ", match)
        socket.join(match.pinCode)
        syncData(match.pinCode)
        callback(match)
    }

    const onUpdateUser = async (pinCode, updatedUser, callback) => {
        let match = await findMatch(pinCode)
        if (match) {
            let user = findUser({socketId: socket.id}, match)
            if (user) {
                user = {
                    ...user,
                    ...updatedUser
                }
                console.log("Updated User:", user)
                await updateUser(user, match)
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


        const {progress, users, host} = match
        let current = progress[progress.length - 1 ]
        
        users.forEach((user, index) => {
            // If not answer: 
            let answeredUser = current.answers.find((item) => item.socketId == user.socketId)
            if (!answeredUser) {
                io.to(user.socketId).emit('match:onNotAnswer')
            }
            else if (answeredUser.isCorrect) {
                io.to(user.socketId).emit('match:onCorrectAnswer')
            }
            else {
                io.to(user.socketId).emit('match:onWrongAnswer')
            }  
        })

        io.to(host.socketId).emit('match:onEndQuestion')

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
        
        match.isFinished = true 
        await updateMatch(match)
        io.to(pinCode).emit('match:onEnd', match)
    }
    const handleNextQuestion = async (pinCode) => {
        let match = await findMatch(pinCode)
        console.log("Find match: ", pinCode, match)
        if (!match) return 
        // play linear :
        if (match.question_index == undefined) {
            match.question_index = 0
        }
        else if (match.question_index < match.game.questions.length -1) {
            match.question_index ++
        }
        else {
            handleEndMatch(pinCode)
            return 
        }

        let item = {
            question: match.game.questions[match.question_index],
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
                console.log("Countdown answer:", time)
                io.to(pinCode).emit('match:onCountdown', time)
            }
        }, 1000);
    }
    
    const onStart = async (pinCode) => {
        console.log("Client require start match: ", pinCode)
        let match = await findMatch(pinCode)
        if (match) {
            await handleNextQuestion(pinCode)
        }
    }

    const onAnswer = async (pinCode, answerIndex) => {
        let match = await findMatch(pinCode)
        if (!match) return 
        let user = await findUser({socketId: socket.id}, match)
        if (!user) return 

        let current = match.progress[match.progress.length - 1]
        let isCorrect = current.question.correct_answers.indexOf(answerIndex) != -1

        let userAnswer = {
            socketId: socket.id,
            name: user.name,
            answerIndex: answerIndex,
            isCorrect
        }

        current.answers.push({...userAnswer})
        console.log("MAtch after receive user answer: ",current.answers)
        await updateMatch(match)
        syncData(pinCode)
    }
    socket.on('match:join', onJoin)
    socket.on('match:leave', onLeave)
    socket.on('match:host', onHost)
    socket.on('match:updateUser', onUpdateUser)
    socket.on('match:requireSync', onUpdate)
    socket.on('match:start', onStart)
    socket.on('match:answer', onAnswer)
}