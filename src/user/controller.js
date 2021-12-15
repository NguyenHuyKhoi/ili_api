const { profileEdit, profileDetail, profileDelete } = require("./service")


const profileEditController = async (req, res, next) => {
    const result = await profileEdit({
        ...req.body,
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const profileDeleteController = async (req, res, next) => {
    const result = await profileDelete({
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const profileDetailController = async (req, res, next) => {
    const result = await profileDetail({
        userId: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

module.exports = {
    profileEditController,
    profileDetailController,
    profileDeleteController
}