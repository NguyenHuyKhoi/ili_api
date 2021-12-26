const Match = require('./model')

const getLibrary = async (data) => {
    try {   
        const {userId} = data 
        let matchs = await Match.find({"host._id": userId, isFinished: true})
        return matchs
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}
module.exports = {
    getLibrary
}
