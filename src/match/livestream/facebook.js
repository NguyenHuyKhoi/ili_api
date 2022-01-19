const { default: axios } = require("axios")
const { Match } = require("../model")
// Get a list answer
class FacebookHandler {
    constructor(liveChatId, accessToken) {
        this.liveChatId = liveChatId // LivechatId is livevideoId
        this.accessToken = accessToken
        // this.nextPageToken = null
        this.legalAnswerPlayers = []
        this.startAt = null
        this.STREAM_LATENCY = 8
    }

    // answerTime: publishAt - LATENCY
    // content: 
    // player: id, name, profile, avatar
    retrieveAnswers = async (startAt) => {
        this.startAt = startAt
        try {
            let sinceTime = Math.round(this.startAt.getTime() / 1000)
            var url = `https://graph.facebook.com/v12.0/${this.liveChatId}/comments?filter=toplevel&live_filter=no_filter&order=chronological&since=${sinceTime}&fields=id,message,from{id,picture,name},created_time&access_token=${this.accessToken}`
            console.log("Retrieve answer url:", url);
            
            let res = await axios.get(url)
            const {data} = res
            
            let msgs = data.data

            this.legalAnswerPlayers = []
            msgs.forEach((msg) => this.extractAnswer(msg))
            return this.legalAnswerPlayers
        }
        catch (err) {
            console.log("Retrieve answer error:", (err.response ? err.response.data : err))
            return []
        }
    }

    extractAnswer = (msg) => {
        try {
            console.log('Get msg user:', msg.from);
            
            // Check answer is on time 
            let answerPublishTime = new Date(msg.created_time)
            let content = msg.message

            var answerTime = Math.abs(answerPublishTime - this.startAt) / 1000 - this.STREAM_LATENCY
            answerTime = Math.round(answerTime * 10) / 10
            if (answerTime < 0) {
                //console.log("Answer when time answers is not occurs, emited", content, answerTime)
                return
            }

            // Check answer is correct format
            // Correct format is : 'x' or 'x @alias_name'
            // //console.log("\n \n Extract answer with content: ", content)
            var answerIndex = ['1','2','3','4'].indexOf(content)
            var aliasName = ''
            if (answerIndex == -1) {
                // Not in format 'x'
                // Check format 'x @alias_name'
                let format = /[1-4]{1} @.*/gm
                if (format.test(content)) {
                    answerIndex = content[0] - 1
                    aliasName = content.substring(3)
                //  //console.log("Answer in format x alias :", answerIndex, aliasName)
                }
                else {
                //  //console.log("Answer not any in format, emited ")
                    return
                }
            }
            else {
                ////console.log("Answer in format x:", answerIndex)
            }

            // 
            var playerName = aliasName == '' ? msg.from.name : aliasName
            var playerId = (msg.from.id + '_' + playerName)

            let player = {
                _id: playerId,
                platformId: msg.from.id,
                username: playerName,
                avatar: msg.from.picture ? msg.from.picture.data.url : null
            }
            // //console.log("Player infor: ", player)

            var isExist = false
            this.legalAnswerPlayers.forEach((answerPlayer, index) => {
                if (answerPlayer.player._id == playerId) {
                    // Update to latest answer
                    this.legalAnswerPlayers[index].answerTime = answerTime
                    this.legalAnswerPlayers[index].answerIndex = answerIndex
                    isExist = true
                    console.log("Update to latest answer :", playerName, answerIndex)
                }
            })
            if (!isExist) {
                console.log("Add to new answer :", playerName, answerIndex)
                this.legalAnswerPlayers.push({player, answerIndex,answerTime})
            }
        }
        catch (err){
        }
        
    }
}

module.exports = {
    FacebookHandler
}