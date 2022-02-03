
const {search, create} = require("./service")

const createController = async (req, res, next) => {
    const result = await create({
        question: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
const searchController = async (req, res, next) => {
    const result = await search({
        source: req.query.source,
        type: req.query.type
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
module.exports = {
    searchController,
    createController
}