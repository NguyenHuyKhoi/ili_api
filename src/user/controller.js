const { profileEdit, profileView } = require("./service")


const profileEditController = async (req, res, next) => {
    const result = await profileEdit({
        ...req.body,
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const profileViewController = async (req, res, next) => {
    const result = await profileView({
        userId: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

module.exports = {
    profileEditController,
    profileViewController
}