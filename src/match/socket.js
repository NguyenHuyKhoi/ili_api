
const Match = require('./model')
module.exports =  (io, socket) => {
    const matchJoin = async (pinCode, callback) => {
        console.log("Join with pin code", pinCode)

        let game = await Match.findOne({pinCode})
        if (game) {
            console.log("Join socket client to game: ",pinCode)
            socket.to('match'+pinCode)
            callback({
                isSuccess: true
            })
        }
        else {
            callback({
                isSuccess: false
            })
        }
    }
    socket.on('match:join', matchJoin)
}