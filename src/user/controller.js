const { edit, detail, deletee, getAll } = require("./service")


const editController = async (req, res, next) => {
    const result = await edit({
        ...req.body,
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const deleteController = async (req, res, next) => {
    const result = await deletee({
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const detailController = async (req, res, next) => {
    const result = await detail({
        userId: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const getAllController = async (req, res, next) => {
    const result = await getAll({
        idAdmin: req.user.idAdmin
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

module.exports = {
    editController,
    detailController,
    deleteController,
    getAllController
}