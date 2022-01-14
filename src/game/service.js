const {Game} = require('./model')
const { getBriefUser } = require('../user/service')
const create = async (data) => {
    try {
        const {item, userId} = data
        if (userId == undefined || item == undefined) {
            throw new Error('Missing fields')
        }

        await new Game({
            ...item,
            userId
        }).save()
        return 'Create successfully'

    }
    catch (err) {
        console.log("Create game error : ", err.message)
        return {
            error: err.message
        }
    }
}

const clone = async (data) => {
    try {
        const {gameId} = data
        if (gameId == undefined) {
            throw new Error('Missing fields')
        }

        let game = await Game.findOne({_id: gameId})
        if (game == undefined) {
            throw new Error('No game found')
        }
        else{
            console.log("Find game:", game)
        }
        var cloneGame = new Game({
            userId: game.userId,
            subject: game.subject,
            title: game.title,
            description: game.description,
            cover: game.cover,
            visibility: game.visibility,
            questions: game.questions
        })
        await cloneGame.save()

        return 'Clone successfully'

    }
    catch (err) {
        console.log("Clone game error : ", err.message)
        return {
            error: err.message
        }
    }
}

const edit = async (data) => {
    try {
        const {item, userId, _id} = data
        if (userId == undefined || item == undefined) {
            throw new Error('Missing fields')
        }

        const saved = await Game.findOne({_id})
        if (!saved) {
            throw new Error('Not exist')
        }

        if (saved.userId != userId) {
            throw new Error('Not edit other\'s')
        }
        await Game.updateOne(
            { _id },
            { $set: { ...item }},
            { new: true}
        )
        return 'Edit successfully'

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const detail = async (data) => {
    try {
        const {_id} = data
        if (_id == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Game.findOne({_id})
        if (!saved) {
            throw new Error('Not found')
        }
        return saved
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const deletee = async (data) => {
    try {
        const {_id, userId} = data
        if (_id == undefined || userId == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Game.findOne({_id})
        if (!saved) {
            throw new Error('Not found')
        }
        if (saved.userId != userId) {
            throw new Error('Can not delete other\'s')
        }

        await Game.deleteOne({_id})
        return "Delete success"
    }
    catch (err) {
        console.log("Error:", err)
        return {
            error: err.message
        }
    }
}

const getLibrary = async (data) => {
    try {
        const {userId} = data
        if (userId == undefined) {
            throw new Error('Missing fields')
        }
        console.log("Find games of userId:", userId)
        let games = await Game.find({userId})

        await Promise.all(games.map(async(game) => {
            game._doc.owner = await getBriefUser(game.userId)
        }))

        return games.reverse()
    }
    catch (err) {
        console.log("error: ",err)
        return {
            error: err.message
        }
    }
}

const search = async (data) => {
    try {
        const {} = data
        let games = await Game.find({})

        await Promise.all(games.map(async (game) => {
            game._doc.owner = await getBriefUser(game.userId)
        }))

        return games.reverse()
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

module.exports = {
    create,
    edit,
    detail,
    deletee,
    getLibrary,
    search,
    clone
}
