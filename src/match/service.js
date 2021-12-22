const Match = require('./model')
const Game = require('../game/model')

const create = async (data) => {
    try {
        const {item, userId} = data
        console.log("Item:", userId, item)
        if (item == undefined || userId == undefined) {
            throw new Error('Missing fields')
        }

        const {title, gameId} = item
        if (title == undefined || gameId == undefined) {    
            throw new Error('Missing fields')
        }

        const game = await Game.findOne({_id: gameId})
        if (!game) {
            throw new Error('Not found game')
        }
        const newMatch = await new Match({
            hostId: userId,
            title,
            gameId,
            pinCode: (new Date()).getMilliseconds()
        }).save()
        return newMatch

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}


module.exports = {
    create
}
