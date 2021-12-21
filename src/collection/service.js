const Collection = require('./model')
const Game = require('../game/model')
const User = require('../user/model')

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
        await Promise.all(list.map(async (collection, _) => {
            // Get games
            let gameDetails = []
            let gameIds = collection.games
            await Promise.all(gameIds.map(async (_id) => {
                let game = await Game.findOne({_id})
                if (game) {
                    gameDetails.push(game._doc)
                }
            }))
            collection._doc.games = gameDetails
            // Get owner
            const user = await User.findOne({_id: collection.userId})
            let infor = {} 
            if (user) {
                infor.username = user.username
                infor.avatar = user.avatar
            }
            else {
                infor.username = 'Unknown'
                infor.avatar = ''
            }
            collection._doc.owner = {...infor}
        }))
        return list
    }
    catch (err) {
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
module.exports = {
    edit,
    create,
    detail,
    deletee,
    getLibrary
}
