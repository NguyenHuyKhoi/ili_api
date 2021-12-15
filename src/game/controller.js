const {gameCreate, gameDetail, gameEdit, gameDelete } = require("./service")


const gameCreateController = async (req, res, next) => {
    const result = await gameCreate({
        userId: req.user._id,
        game: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const gameEditController = async (req, res, next) => {
    const result = await gameEdit({
        userId: req.user._id,
        gameId: req.params.id,
        game: req.body
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const gameDetailController = async (req, res, next) => {
    const result = await gameDetail({
        userId: req.user._id,
        gameId: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}

const gameDeleteController = async (req, res, next) => {
    const result = await gameDelete({
        userId: req.user._id,
        gameId: req.params.id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}


module.exports = {
    gameCreateController,
    gameEditController,
    gameDetailController,
    gameDeleteController
}