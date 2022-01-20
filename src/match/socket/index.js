
const { MatchCenter } = require('..')
const emitEventNames = [
    'match:sync',
    'match:playerLeave',
    'match:onNotAnswer',
    'match:onCorrectAnswer',
    'match:onWrongAnswer',
    'match:onEndQuestion',
    'match:onCountdown',
    'match:scoreboard',
    'match:onSummary',
    'match:onQuestion',
    'match:kickPlayerDone',
    'match:onCountdownToStart',
    'match:onCountdownToEnd',
    'match:onEndMatch',
    'match:onStart'
]

module.exports =  (io, socket) => {
    class IOSocketHandler {
        // constructor(socket) {
        //     this.socket = socket
        // }

        static emit = (eventCode, data) => {
            let eventName = emitEventNames[eventCode]
            let roomId = data.rid 
            if (roomId == undefined) return
            io.to(roomId).emit(eventName, data)

            // console.log("Receiver emit:", eventName, roomId)
            // io.sockets.adapter.rooms.get(roomId).forEach((client) => {
            //     console.log(`Client ${client} in room ${roomId}`)
            // })

        }

        static onHost = async (match, callback) => {
            console.log("Requrie host match: ", (MatchCenter == null))
            match.host._id = socket.id
            let matchHandler = await MatchCenter.hostMatch(match)
            if (!matchHandler) {
                callback(null)
                return
            }
            let createdMatch = matchHandler.match

            socket.join(createdMatch.pinCode)
            matchHandler.subcribe(IOSocketHandler)
            callback(createdMatch)
        }

        static onJoin =  (pinCode, joinPlayer, callback) => {
            console.log("Join player: ",pinCode,  joinPlayer)
            // Join player has userId and avatar
            let player = { _id: socket.id, score: 0, name: '???',...joinPlayer }
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                callback(null)
                return
            }
            if (matchHandler.join(player)) {
                callback(matchHandler.match)
                socket.join(pinCode)
            }
            else {
                callback(null)
            }
        }

        static onLeave = (pinCode, callback) => {
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                callback(false)
                return
            }

            matchHandler.leavePlayer(socket.id)
            callback(true)
            socket.leave(pinCode)
        }

        
        static onUpdatePlayer = (pinCode, player, callback) => {
            player._id = socket.id
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                callback(false)
                return
            }
            console.log("Player require update:", player)
            matchHandler.updatePlayer(player)
            callback(true)
        }

        static onUpdate = (pinCode, callback) => {
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                console.log("Not found matchHandler")
                callback(false)
                return
            }
            callback(matchHandler.match)
        }

        static onStart =  (pinCode) => {
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                callback(false)
                return
            }
            matchHandler.onStart()
        }

        static onAnswer =  (pinCode, player, answerContent, answerTime) => {
            console.log("Socket receive answer: ", answerContent, answerTime);
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                return
            }
            matchHandler.onAnswer(player, answerContent, answerTime)
        }

        static onKickPlayer =  (pinCode, player, callback) =>  {
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                callback(false)
                return
            }
            matchHandler.onKickPlayer(player._id)
            callback(true)
            socket.leave(pinCode)
        }

        static onLock = (pinCode, callback) => {
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                callback(false)
                return
            }
            matchHandler.onLock()
            callback(true)
        }

        static onUnlock = async (pinCode, callback) => {
            let matchHandler =  MatchCenter.findMatchHandler(pinCode)
            if (!matchHandler) {
                callback(false)
                return
            }
            matchHandler.onUnlock()
            callback(true)
        }
    }

    socket.on('match:host', IOSocketHandler.onHost)
    socket.on('match:join', IOSocketHandler.onJoin)
    socket.on('match:leave', IOSocketHandler.onLeave)
    socket.on('match:updatePlayer', IOSocketHandler.onUpdatePlayer)
    socket.on('match:requireSync', IOSocketHandler.onUpdate)
    socket.on('match:start', IOSocketHandler.onStart)
    socket.on('match:answer', IOSocketHandler.onAnswer)
    socket.on('match:kickPlayer', IOSocketHandler.onKickPlayer)
    socket.on('match:lock', IOSocketHandler.onLock)
    socket.on('match:unlock', IOSocketHandler.onUnlock)
}