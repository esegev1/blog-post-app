const mongoose = require('mongoose');

//create schema
const postSchema = new mongoose.Schema({
    title: String, 
    intro: String,
    ingredients: Array,
    instructions: Array,
    imageUrl: String,
    videoUrl: String,
    previewImageUrl: String,
    igUrl: String,
});

//compile schema
const Post = mongoose.model('Post', postSchema);

//export module
module.exports = Post;

