
const {create, detail, edit, deletee, getLibrary, search, clone, getDetail, getAll, adminHide } = require("./service")


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

const getDetailController = async (req, res, next) => {
    const result = await getDetail({
        _id: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const adminHideController = async (req, res, next) => {
    const result = await adminHide({
        _id: req.query._id,
        isHidden: req.query.isHidden,
        isAdmin: req.user.isAdmin
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
const getAllController = async (req, res, next) => {
    const result = await getAll({
        idAdmin: req.user.idAdmin
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
const searchController = async (req, res, next) => {
    console.log("Params req: ", req.query.userId)
    const result = await search({
        userId: req.query.userId,
        keyword: req.query.keyword,
        question_ranges: req.query.question_ranges,
        subjects: req.query.subjects
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
module.exports = {
    createController,
    editController,
    detailController,
    deleteController,
    getLibraryController,
    getDetailController,
    cloneController,
    getAllController,
    searchController,
    adminHideController
}