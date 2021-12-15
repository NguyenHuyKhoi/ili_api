const Collection = require('./model')
const collectionCreate = async (data) => {
    try {
        const {collection, userId} = data
        if (userId == undefined || collection == undefined) {
            throw new Error('Missing fields')
        }

        await new Collection({
            ...collection,
            userId
        }).save()
        return 'Collection create successfully'
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}

const collectionDetail = async (data) => {
    try {
        const {collectionId, userId} = data
        if (collectionId == undefined || userId == undefined) {
            throw new Error('Missing fields')
        }
        const collection = await Collection.findOne({_id: collectionId})
        if (!collection) {
            throw new Error('No collection found')
        }
        return collection
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}


const collectionEdit= async (data) => {
    try {
        const {collection, userId, collectionId} = data
        if (userId == undefined || collectionId == undefined || collection == undefined) {
            throw new Error('Missing fields')
        }
        const savedCollection = await Collection.findOne({_id: collectionId})
        if (!savedCollection) {
            throw new Error('No collection found')
        }
        if (savedCollection.userId != userId) {
            throw new Error('Can not edit other\'s collection')
        }
        await Collection.updateOne(
            { _id: collectionId },
            { $set: { ...collection}},
            { new: true}
        )
        console.log("Collection edit :", collection)
        return 'Collection edit successfully'
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}


const collectionDelete = async (data) => {
    try {
        const {userId, collectionId} = data
        if (userId == undefined || collectionId == undefined) {
            throw new Error('Missing fields')
        }
        const savedCollection = await Collection.findOne({_id: collectionId, userId})
        if (!savedCollection) {
            throw new Error('No collection found')
        }

        if (savedCollection.userId != userId) {
            throw new Error('Can not delete other\'s collection')
        }

        await Collection.deleteOne({ _id: collectionId })
        return 'Collection Delete successfully'
    }
    catch (err) {
        return {
            error: err.message
        }
    }
}
module.exports = {
    collectionEdit,
    collectionCreate,
    collectionDetail,
    collectionDelete
}
