const { getLibrary } = require("./service")

const getLibraryController = async (req, res, next) => {
    const result = await getLibrary({
        userId: req.user._id
    })
    return res.status(result.error != undefined ? 500 : 200).json(result)
}
module.exports = {
    getLibraryController
}