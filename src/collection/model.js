const mongoose = require('mongoose')

const CollectionSchema = new mongoose.Schema({
    userId: {type: String, required: true, ref: 'User'},
    title: {type: String, required: true},
    description: {type: String},
    cover: {type: String},
    visibility: {type: String, required: true},
    games: {type: [String], required: true, ref: 'Game'}
}, {
    timestamps: true
})

module.exports = mongoose.model('Collection', CollectionSchema)