const Collection = require('./model')
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
        if (userId == undefined || _id == undefined || collection == undefined) {
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
    deletee
}
