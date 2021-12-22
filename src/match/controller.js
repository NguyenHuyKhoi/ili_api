const {create } = require("./service")


const createController = async (req, res, next) => {
    const result = await create({
        item: req.body,
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
module.exports = {
    createController
}