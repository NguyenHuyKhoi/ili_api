
const {search, create, deletee, edit} = require("./service")

const createController = async (req, res, next) => {
    const result = await create({
        questions: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const editController = async (req, res, next) => {
    const result = await edit({
        item: req.body,
        _id: req.params.id
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

const deleteController = async (req, res, next) => {
    const result = await deletee({
        _id: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

module.exports = {
    searchController,
    createController,
    deleteController,
    editController
}