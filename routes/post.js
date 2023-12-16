const mongoose = require('mongoose')
const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    postImage: String,
    title: String,
    description: String,
    })

module.exports = mongoose.model("post", postSchema)