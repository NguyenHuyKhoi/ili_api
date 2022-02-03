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

const deletee = async (data) => {
    try {
        const {_id} = data
        if (_id == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Question.findOne({_id})
        if (!saved) {
            throw new Error('Not found')
        }
        await Question.deleteOne({_id})
        return "Delete success"
    }
    catch (err) {
        console.log("Error:", err)
        return {
            error: err.message
        }
    }
}

const edit = async (data) => {
    try {
        const {item, _id} = data
        if (item == undefined) {
            throw new Error('Missing fields')
        }

        const saved = await Question.findOne({_id})
        if (!saved) {
            throw new Error('Not exist')
        }

        await Question.updateOne(
            { _id },
            { $set: { ...item }},
            { new: true}
        )
        return 'Edit questions uccessfully'

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}
const create = async (data) => {
    try {
        const {questions} = data
        console.log("Question:", questions);
        if (questions == null) {
            throw new Error('Missing fields')
        }

        await Promise.all(questions.map(async (item) => {
            await new Question({
                ...item
            }).save()
        }))

        return 'Create Questions successfully'

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
    create,
    deletee,
    edit
}
