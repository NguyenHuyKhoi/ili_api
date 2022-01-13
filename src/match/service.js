const { MatchCenter } = require('.')
console.log("Check amtc outside:", (MatchCenter.callMe()))
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

const createLivestream = async (data) => {
    try {   
        const {match} = data 
        let matchHandler = await MatchCenter.hostMatch(match)
        if (!matchHandler) {
            throw new Error('Create match fail')
        }
        return matchHandler.match
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const completeLivestream = async (data) => {
    try {   
        const {pinCode} = data 
        let matchHandler = await MatchCenter.findMatchHandler(pinCode)
        if (!matchHandler) {
            throw new Error('No Match found')
        }

        console.log("Call api end livestream")
        matchHandler.handleEndMatch()
        return true
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const startLivestream = async (data) => {
    try {   
        const {pinCode} = data 
        console.log("Start livestream with pincode:", pinCode)
        let matchHandler = await MatchCenter.findMatchHandler(pinCode)
        if (!matchHandler) {
            console.log("No match found")
            throw new Error('No Match found')
        }

        console.log("Call matchhandle to start")
        matchHandler.onStart()
        return true
    }
    catch (err) {
        console.log("Error startlivestream:", err)
        return {
            error: err.message
        }
    }
}
module.exports = {
    getLibrary,
    createLivestream,
    completeLivestream,
    startLivestream
}
