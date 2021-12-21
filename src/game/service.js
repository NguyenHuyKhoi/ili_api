const Game = require('./model')
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
        return {
            error: err.message
        }
    }
}

const getCompletes = async (data) => {
    try {
        const {userId} = data
        if (userId == undefined) {
            throw new Error('Missing fields')
        }
        const games = await Game.find({userId})
        return games
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const search = async (data) => {
    try {
        const {} = data
        const games = await Game.find({})
        return games
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
    getCompletes,
    search
}
