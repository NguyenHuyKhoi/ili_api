const { default: axios } = require("axios")
const { QUESTION_TYPES_ID } = require("../model")
const { PlatformUtils } = require("./util")

// Get a list answer
const API_KEY = 'AIzaSyCpmqo8ByzMuPbZ8g97mSCRcs4Wi-bJTe0'
class YoutubeHandler {
    constructor(liveChatId) {
        this.liveChatId = liveChatId
        this.nextPageToken = null
        this.legalAnswerPlayers = []
        this.startAt = null

        this.STREAM_LATENCY = 5
        this.questionTypeId = null 
    }

    // answerTime: publishAt - LATENCY
    // content: 
    // player: id, name, profile, avatar
    retrieveAnswers = async (startAt, questionTypeId) => {
        var url = `https://youtube.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${this.liveChatId}&part=id&part=snippet&part=authorDetails&key=${API_KEY}`
        this.startAt = startAt
        this.questionTypeId = questionTypeId
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

    extractAnswerContent = (content) => {
        var arr = content.split(" ").filter((item) => !(item == " " || item == ""))
        if (arr.length == 0) {
          return null
        }
        console.log("Arr from comment:", arr);
        var answerContent 
        switch (this.questionTypeId) {
          case QUESTION_TYPES_ID.MULTIPLE_CHOICE:
            answerContent = ["1","2","3","4"].indexOf(arr[0])
            if (answerContent == -1) {
               answerContent = ["A","B","C","D"].indexOf(arr[0].toUpperCase())
            }
            if (answerContent == -1) {
              return null 
            }
            return {
              answerContent,
              aliasName: arr.length >= 2 ? arr[1] : ""
            }
          case QUESTION_TYPES_ID.TF_CHOICE:
            answerContent = ["1","2"].indexOf(arr[0])
            if (answerContent == -1) {
               answerContent = ["A","B"].indexOf(arr[0].toUpperCase())
            }
            if (answerContent == -1) {
               answerContent = ["T","F"].indexOf(arr[0].toUpperCase())
            }
            if (answerContent == -1) {
              return null 
            }
            return {
              answerContent,
              aliasName: arr.length >= 2 ? arr[1] : ""
            }
          case QUESTION_TYPES_ID.PIC_WORD:
            return {
              answerContent: arr[0].toUpperCase(),
              aliasName: arr.length >= 2 ? arr[1] : ""
            }
          case QUESTION_TYPES_ID.WORD_TABLE:
            return {
              answerContent: arr[0].toUpperCase(),
              aliasName: arr.length >= 2 ? arr[1] : ""
            }
          default: 
            return null
        }
    }

    extractAnswer = (msg) => {
        try {
            // Check answer is on time 
            let answerPublishTime = new Date(msg.snippet.publishedAt)
            var answerTime = Math.abs(answerPublishTime - this.startAt) / 1000 - this.STREAM_LATENCY
            answerTime = Math.round(answerTime * 10) / 10
            if (answerTime < 0) {
                console.log("Answer when time answers is not occurs, emited", content, answerTime)
                return
            }

            let content = msg.snippet.textMessageDetails.messageText
            console.log("\n \n Extract answer with content: ", content)

            var temp = PlatformUtils.analysisCommentContent(content, this.questionTypeId)
            console.log("Extract answer Content:", temp);
            if (temp == null) {
                return
            }
            var {answerContent, aliasName} = temp

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
                    this.legalAnswerPlayers[index].answerContent = answerContent
                    isExist = true
                    console.log("Update to latest answer :", playerName, answerContent)
                }
            })
            if (!isExist) {
                console.log("Add to new answer :", playerName, answerContent)
                this.legalAnswerPlayers.push({player, answerContent,answerTime})
            }
        }
        catch (err){
        }
        
    }
}

module.exports = {
    YoutubeHandler
}