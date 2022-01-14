
const {create, detail, edit, deletee, getLibrary, search, clone } = require("./service")


const createController = async (req, res, next) => {
    const result = await create({
        userId: req.user._id,
        item: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const cloneController = async (req, res, next) => {
    console.log("Game _id: ", req.params.id)
    const result = await clone({
        gameId: req.params.id
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
    console.log("call library controller")
    const result = await getLibrary({
        userId: req.user._id
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
    cloneController,
    searchController
}