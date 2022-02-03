const {Question} = require('./model')
const search = async (data) => {
    try {
        var {source, type} = data
        var list = await Question.find({})   
        console.log("List:", list);  
        
        if (type != null) {
            list = list.filter((item) => item.typeId == type)
        }
        return list.reverse()
    }
    catch (err) {
        console.log("Err: ", err)
        return {
            error: err.message
        }
    }
}

const create = async (data) => {
    try {
        const {question} = data
        console.log("Question:", question);
        if (question == null) {
            throw new Error('Missing fields')
        }

        if (question.title == null) {
            throw new Error('Missing fields')
        }

        await new Question({
            ...question
        }).save()
        return 'Create Question successfully'

    }
    catch (err) {
        console.log("Create Question error : ", err.message)
        return {
            error: err.message
        }
    }
}

module.exports = {
    search,
    create
}
