const {Game} = require('./model')
const { getBriefUser } = require('../user/service')
const create = async (data) => {
    try {
        const {item, userId} = data
        if (userId == undefined || item == undefined) {
            throw new Error('Missing fields')
        }

        await new Game({
            ...item,
            userId
        }).save()
        return 'Create successfully'

    }
    catch (err) {
        console.log("Create game error : ", err.message)
        return {
            error: err.message
        }
    }
}
const getAll = async (data) => {
    try {
        const {isAdmin} = data

        if (isAdmin) {
            return []
        }

        const games = await Game.find({})
        await Promise.all(games.map(async(item) => {
            item._doc.owner = await getBriefUser(item.userId)
        }))
        return games

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}
const clone = async (data) => {
    try {
        const {gameId} = data
        if (gameId == undefined) {
            throw new Error('Missing fields')
        }

        let game = await Game.findOne({_id: gameId})
        if (game == undefined) {
            throw new Error('No game found')
        }
        else{
            console.log("Find game:", game)
        }
        var cloneGame = new Game({
            userId: game.userId,
            subject: game.subject,
            title: game.title,
            description: game.description,
            cover: game.cover,
            visibility: game.visibility,
            questions: game.questions
        })
        await cloneGame.save()

        return 'Clone successfully'

    }
    catch (err) {
        console.log("Clone game error : ", err.message)
        return {
            error: err.message
        }
    }
}

const edit = async (data) => {
    try {
        const {item, userId, _id} = data
        if (userId == undefined || item == undefined) {
            throw new Error('Missing fields')
        }

        const saved = await Game.findOne({_id})
        if (!saved) {
            throw new Error('Not exist')
        }

        if (saved.userId != userId) {
            throw new Error('Not edit other\'s')
        }
        await Game.updateOne(
            { _id },
            { $set: { ...item }},
            { new: true}
        )
        return 'Edit successfully'

    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const adminHide = async (data) => {
    try {
        const {isAdmin, isHidden, _id} = data
        console.log("Hide game fields:", isAdmin, isHidden, _id)
        if (isAdmin == undefined || isHidden == undefined || _id == undefined) {
            throw new Error('Missing fields')
        }
        if (!isAdmin) {
            throw new Error('Only admn can hide other\'s games.')
        }

        const saved = await Game.findOne({_id})
        if (!saved) {
            throw new Error('Not exist')
        }

        await Game.updateOne(
            { _id },
            { $set: { 
                visibility: isHidden ? 'private' : 'public', 
                hiddenByAdmin: isHidden ? true : false 
            }
            },
            { new: true}
        )
        return 'Set hide successfully'

    }
    catch (err) {
        console.log("error on set hide game:", err)
        return {
            error: err.message
        }
    }
}

const detail = async (data) => {
    try {
        const {_id} = data
        if (_id == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Game.findOne({_id})
        if (!saved) {
            throw new Error('Not found')
        }
        return saved
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const deletee = async (data) => {
    try {
        const {_id, userId} = data
        if (_id == undefined || userId == undefined) {
            throw new Error('Missing fields')
        }
        const saved = await Game.findOne({_id})
        if (!saved) {
            throw new Error('Not found')
        }
        if (saved.userId != userId) {
            throw new Error('Can not delete other\'s')
        }

        await Game.deleteOne({_id})
        return "Delete success"
    }
    catch (err) {
        console.log("Error:", err)
        return {
            error: err.message
        }
    }
}

const getLibrary = async (data) => {
    try {
        const {userId} = data
        if (userId == undefined) {
            throw new Error('Missing fields')
        }
        let list = await Game.find({userId})

        await Promise.all(list.map(async(item) => {
            item._doc.owner = await getBriefUser(item.userId)
        }))

        return list.reverse()
    }
    catch (err) {
        console.log("error: ",err)
        return {
            error: err.message
        }
    }
}

const getDetail = async (data) => {
    try {
        const {_id} = data
        if (_id == undefined) {
            throw new Error('Missing fields')
        }
        let item = await Game.findOne({_id})
        if (item == undefined) {
            throw new Error('No game found')
        }

        item._doc.owner = await getBriefUser(item.userId)
        return item
    }
    catch (err) {
        console.log("error: ",err)
        return {
            error: err.message
        }
    }
}
const search = async (data) => {
    try {
        var {userId, keyword, subjects, question_ranges} = data

        var list = []
        if (userId == undefined){
            list = await Game.find({visibility: 'public'})
        }
        else {
            list = await Game.find({userId, visibility: 'public'})
        }

        if (keyword != undefined) {
            keyword = keyword.toString().toLowerCase()

            list = list.filter((item) => {
                let ok = false 
                let {title, description} = item
                if (title && title.toString().toLowerCase().indexOf(keyword)!= -1) {
                    ok = true
                }
                if (description && description.toString().toLowerCase().indexOf(keyword) != -1) {
                    ok = true
                }
                return ok
            })
        }


        if (subjects != undefined) {
            var subjectList = subjects.split(',')
            list = list.filter((item) => subjectList.indexOf(item.subject) != -1)
        }
        
        if (question_ranges != undefined) {
            var rangeList = question_ranges.split(',')
            list = list.filter((item) => {
                let ok = false 
                let question_num = item.questions.length
                rangeList.forEach((range) => {
                    let arr = range.split('-')
                    if (question_num >= arr[0] && question_num <= arr[1]){
                        ok = true
                    }
                })
                return ok
            })
        }
        

        await Promise.all(list.map(async (item) => {
            item._doc.owner = await getBriefUser(item.userId)
        }))

        return list.reverse()
    }
    catch (err) {
        console.log("Err: ", err)
        return {
            error: err.message
        }
    }
}

module.exports = {
    create,
    edit,
    detail,
    deletee,
    getLibrary,
    search,
    clone,
    getDetail,
    getAll,
    adminHide
}
