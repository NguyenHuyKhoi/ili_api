const Game = require('./model')
const gameCreate = async (data) => {
    try {
        const {game, userId} = data
        if (userId == undefined || game == undefined) {
            throw new Error('Missing fields')
        }

        await new Game({
            ...game,
            userId
        }).save()
        return 'Game create successfully'

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const gameDetail = async (data) => {
    try {
        const {gameId, userId} = data
        if (gameId == undefined || userId == undefined) {
            throw new Error('Missing fields')
        }
        const game = await Game.findOne({_id: gameId})
        if (!game) {
            throw new Error('No game found')
        }
        return game
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}
module.exports = {
    gameCreate,
    gameDetail
}
