const { Game } = require("../game/model")
const { MatchHandler } = require("./handler")
const LiveStreamHandler = require("./livestream")
const { Match }  = require('./model')
class MatchCenter {
    static matchHandlers = []
    static livestreamHandlers = []

    static findMatchHandler = (pinCode) => {
        return this.matchHandlers.find((handler) => handler.match.pinCode == pinCode)
    }


    static hostMatch = async (match) => {
        let {gameId} = match
        console.log("host match", match)

        match.game = await Game.findOne({_id: gameId})
        if (match.game == undefined) {
            console.log("Not found game")
            return null 
        }
        match.startAt = new Date()
        match.players = []
        match.progress = []
        match.pinCode = (new Date()).getMilliseconds()
        match.state = 'waiting'
    
        let createdMatch = await new Match(match).save()
        let matchHandler = new MatchHandler(createdMatch)
        this.matchHandlers.push(matchHandler)
        console.log("Create Match:", createdMatch)

        if (createdMatch.livestream != null) {
            var livestreamHandler = new LiveStreamHandler(matchHandler)
            await livestreamHandler.prepare()

            matchHandler.subcribe(livestreamHandler)
            this.livestreamHandlers.push(livestreamHandler)
            
            // Auto start match (and auto start livestream)
            // matchHandler.onStart()
            livestreamHandler.start()
        }
        return matchHandler
    }
}




module.exports = {
    MatchCenter
}