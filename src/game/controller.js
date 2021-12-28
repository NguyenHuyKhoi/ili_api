const {create, detail, edit, deletee, getLibrary, search } = require("./service")


const createController = async (req, res, next) => {
    const result = await create({
        userId: req.user._id,
        item: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const editController = async (req, res, next) => {
    const result = await edit({
        userId: req.user._id,
        _id: req.params.id,
        item: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const detailController = async (req, res, next) => {
    const result = await detail({
        userId: req.user._id,
        _id: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const deleteController = async (req, res, next) => {
    const result = await deletee({
        userId: req.user._id,
        _id: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const getLibraryController = async (req, res, next) => {
    console.log("status: ", req.query.status)
    const result = await getLibrary({
        userId: req.user._id,
        status: req.query.status
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
const searchController = async (req, res, next) => {
    const result = await search({
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
module.exports = {
    createController,
    editController,
    detailController,
    deleteController,
    getLibraryController,
    searchController
}