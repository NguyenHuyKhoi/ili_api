const User = require('./model')
const edit = async (data) => {
    try {
        const {avatar, banner, username, name, userId} = data

        const user = await User.findOne({_id: userId})
        if (!user) {
            throw new Error('user not exists')
        }

        // handle uploaded files...
        await User.updateOne(
            { _id: userId },
            { $set: { avatar, banner, username, name }},
            { new: true}
        )

        const updatedUser = await User.findOne({ _id: userId})
        updatedUser.password = null
        return updatedUser

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const deletee = async (data) => {
    try {
        const {userId} = data

        const user = await User.findOne({_id: userId})
        if (!user) {
            throw new Error('user not exists')
        }

        // handle uploaded files...
        await User.deleteOne( { _id: userId })
        return 'Delete user successfully'

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const detail = async (data) => {
    try {
        const {userId} = data
        const user = await User.findOne({_id: userId})
        if (!user) {
            throw new Error('User not exist')
        }
        const {email, avatar, banner, username, name, _id } = user
        return {email, avatar, banner, username, name, _id }
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}
module.exports = {
    edit,
    deletee,
    detail
}
