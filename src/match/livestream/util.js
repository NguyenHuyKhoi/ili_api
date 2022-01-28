const { QUESTION_TYPES_ID } = require("../model");

class PlatformUtils {
    static analysisCommentContent = (content, typeId) => {
        var arr = content.split(" ").filter((item) => !(item == " " || item == ""))
        if (arr.length == 0) {
            return null
        }
        console.log("Arr from comment:", arr);
        var answerContent 
        switch (typeId) {
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
}

module.exports = {
    PlatformUtils
}