const mongoose = require('mongoose');

//create schema
const postSchema = new mongoose.Schema({
    title: String, 
    intro: String,
    ingredients: String,
    instructions: String,
    imageUrl: String,
    videoUrl: String,
    igUrl: String,
});

//compile schema
const Post = mongoose.model('Post', postSchema);

//export module
module.exports = Post;

