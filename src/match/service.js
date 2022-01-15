const { MatchCenter } = require('.')
const {Match} = require('./model')

const getLibrary = async (data) => {
    try {   
        const {userId, role, mode} = data 
        var  matches = await Match.find({state: 'finished'})

        if (role != undefined) {
            if (role == 'host') {
                matches = matches.filter((match) => match.host.userId == userId)
            }
            else {
                matches = matches.filter((match) => {
                    let players = match.players
                    let isJoined = false 
                    players.forEach((player) => {
                        if (player.userId == userId) {
                            isJoined = true
                        }
                    })
                    return isJoined
                })
            }
        }

        if (mode != undefined) {
            if (mode == 'classic') {
                //Replace with condition : match.mode == 'classic'
                matches = matches.filter((match) => match.livestream == null)
            }
            else {
                  //Replace with condition : match.mode == 'livestream'
                  matches = matches.filter((match) => match.livestream != null)
            }
        }
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
