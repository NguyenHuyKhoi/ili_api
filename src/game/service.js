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

const gameEdit = async (data) => {
    try {
        const {game, userId, gameId} = data
        if (userId == undefined || game == undefined) {
            throw new Error('Missing fields')
        }

        const savedGame = await Game.findOne({_id: gameId})
        if (!savedGame) {
            throw new Error('Game not exist')
        }

        if (savedGame.userId != userId) {
            throw new Error('Can not edit other\'s game')
        }
        await Game.updateOne(
            { _id: gameId },
            { $set: { ...game }},
            { new: true}
        )
        return 'Game edit successfully'

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

const gameDelete = async (data) => {
    try {
        const {gameId, userId} = data
        if (gameId == undefined || userId == undefined) {
            throw new Error('Missing fields')
        }
        const savedGame = await Game.findOne({_id: gameId})
        if (!savedGame) {
            throw new Error('No game found')
        }
        if (savedGame.userId != userId) {
            throw new Error('Can not delete other\'s game')
        }

        await Game.deleteOne({_id: gameId})
        return "Delete game success"
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

module.exports = {
    gameCreate,
    gameEdit,
    gameDetail,
    gameDelete
}
