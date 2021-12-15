const {collectionCreate, collectionDetail, collectionEdit, collectionDelete } = require("./service")


const collectionCreateController = async (req, res, next) => {
    const result = await collectionCreate({
        userId: req.user._id,
        collection: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const collectionEditController = async (req, res, next) => {
    const result = await collectionEdit({
        userId: req.user._id,
        collectionId: req.params.id,
        collection: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const collectionDetailController = async (req, res, next) => {
    const result = await collectionDetail({
        userId: req.user._id,
        collectionId: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const collectionDeleteController = async (req, res, next) => {
    const result = await collectionDelete({
        userId: req.user._id,
        collectionId: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}


module.exports = {
    collectionCreateController,
    collectionEditController,
    collectionDetailController,
    collectionDeleteController
}