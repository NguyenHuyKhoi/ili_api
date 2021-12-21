const Collection = require('./model')
const Game = require('../game/model')
const { getBriefUser } = require('../user/service')


const create = async (data) => {
    try {
        const {item, userId} = data
        if (userId == undefined || item == undefined) {
            throw new Error('Missing fields')
        }

        await new Collection({
            ...item,
            userId
        }).save()
        return 'Create successfully'
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const detail = async (data) => {
    try {
        const {_id, userId} = data
        if (_id == undefined || userId == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Collection.findOne({_id})
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


const edit= async (data) => {
    try {
        const {item, userId, _id} = data
        if (userId == undefined || _id == undefined || item == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Collection.findOne({_id})
        if (!saved) {
            throw new Error('Not found')
        }
        if (saved.userId != userId) {
            throw new Error('Can not edit other\'s')
        }
        await Collection.updateOne(
            { _id },
            { $set: { ...item}},
            { new: true}
        )
        return 'Edit successfully'
    }
    catch (err) {
        console.log("Error: ", err)
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
        const list = await Collection.find({userId})
        await Promise.all(list.map(async (collection) => {
            collection._doc.owner = await getBriefUser(collection.userId)
            console.log("Owner :", collection._doc.owner)
            collection._doc.games = await getDetailGames(collection._id)
        }))


        return list
    }
    catch (err) {
        console.log("err:", err)
        return {
            error: err.message
        }
    }
}

const deletee = async (data) => {
    try {
        const {userId, _id} = data
        if (userId == undefined || _id == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Collection.findOne({_id})
        if (!saved) {
            throw new Error('Not found')
        }

        if (saved.userId != userId) {
            throw new Error('Can not delete other\'s')
        }

        await Collection.deleteOne({ _id })
        return 'Delete successfully'
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const getDetailGames = async (collectionId) => {
    let collection = await Collection.findOne({_id: collectionId})
    if (!collection) return []

    let games = []
    await Promise.all(collection.games.map(async (_id) => {
        let game = await Game.findOne({_id})
        if (game) {
            game._doc.owner = await getBriefUser(game.userId)
            games.push(game)
        }
    }))
    return games
}

module.exports = {
    edit,
    create,
    detail,
    deletee,
    getLibrary
}
