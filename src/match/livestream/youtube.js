const { default: axios } = require("axios")

// Get a list answer
const API_KEY = 'AIzaSyCpmqo8ByzMuPbZ8g97mSCRcs4Wi-bJTe0'
class YoutubeHandler {
    constructor(liveChatId) {
        this.liveChatId = liveChatId
        this.nextPageToken = null
        this.legalAnswerPlayers = []
        this.startAt = null

        this.STREAM_LATENCY = 5
    }

    // answerTime: publishAt - LATENCY
    // content: 
    // player: id, name, profile, avatar
    retrieveAnswers = async (startAt) => {
        var url = `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${this.liveChatId}&part=id&part=snippet&part=authorDetails&key=${API_KEY}`
        this.startAt = startAt
        console.log("URL chat:", url)
        if (this.nextPageToken != null) {
            url += `&pageToken=${this.nextPageToken}`
        }
        try {
            let res = await axios.get(url)
            console.log("Data answers:", res.data)
            const {data} = res
            this.nextPageToken = data.nextPageToken
            let msgs = data.items

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
            // Check answer is on time 
            let answerPublishTime = new Date(msg.snippet.publishedAt)
            var answerTime = Math.abs(answerPublishTime - this.startAt) / 1000 - this.STREAM_LATENCY
            answerTime = Math.round(answerTime * 10) / 10
            if (answerTime < 0) {
                //console.log("Answer when time answers is not occurs, emited", content, answerTime)
                return
            }

            // Check answer is correct format
            // Correct format is : 'x' or 'x @alias_name'
            let content = msg.snippet.textMessageDetails.messageText
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
            var playerName = aliasName == '' ? msg.authorDetails.displayName : aliasName
            var playerId = (msg.authorDetails.channelId + '_' + playerName)

            let player = {
                _id: playerId,
                platformId: msg.authorDetails.channelId,
                username: playerName,
                profile: msg.authorDetails.channelUrl,
                avatar: msg.authorDetails.profileImageUrl,
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
    YoutubeHandler
}