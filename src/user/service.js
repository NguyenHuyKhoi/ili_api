
const User = require('./model')
const edit = async (data) => {
    try {
        const {avatar, banner, username, userId} = data

        const user = await User.findOne({_id: userId})
        if (!user) {
            throw new Error('user not exists')
        }

        // handle uploaded files...
        await User.updateOne(
            { _id: userId },
            { $set: { avatar, banner, username }},
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
        user.isAdmin = null
        user.password = null
        return user
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const getBriefUser = async (_id) => {
    let user = await User.findOne({_id})
    if (user) {
        return {
            username: user.username,
            avatar: user.avatar,
            _id: user._id,
        }
    }
    else {
        return {
            username: 'Unknowned',
            avatar: '',
            id: null,
        }
    }
}
module.exports = {
    edit,
    deletee,
    detail,
    getBriefUser
}
