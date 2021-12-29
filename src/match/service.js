const Match = require('./model')

const getLibrary = async (data) => {
    try {   
        const {userId} = data 
        let matches = await Match.find({"host._id": userId, state: 'finished'})
        return matches
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
