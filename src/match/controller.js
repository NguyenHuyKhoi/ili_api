const { getLibrary, createLivestream ,completeLivestream, startLivestream, getDetail} = require("./service")

const getLibraryController = async (req, res, next) => {
    const result = await getLibrary({
        userId: req.user._id,
        role: req.query.role,
        mode: req.query.mode
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const createLivestreamController = async (req, res, next) => {
    const result = await createLivestream({
        match: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const getDetailController = async (req, res, next) => {
    const result = await getDetail({
        _id: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const startLivestreamController = async (req, res, next) => {
    console.log("start livestream controller: ", req.body.pinCode)
    const result = await startLivestream({
        pinCode: req.body.pinCode
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}


const completeLivestreamController = async (req, res, next) => {
    const result = await completeLivestream({
        pinCode: req.body.pinCode
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

module.exports = {
    getLibraryController,
    createLivestreamController,
    completeLivestreamController,
    getDetailController,
    startLivestreamController
}