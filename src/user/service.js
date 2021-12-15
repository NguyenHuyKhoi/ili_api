const User = require('./model')
const profileEdit = async (data) => {
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
        return 'Update user successfully'

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const profileDetail = async (data) => {
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
    profileEdit,
    profileDetail
}
