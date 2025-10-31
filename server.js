const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const fs = require('fs');

const postCtrl = require('./controllers/posts.js');
const mWare = require('./middleware/fileupload.js')

const app = express();
const path = require('path');

//Create file uplods if they don't exist, define storage
const imgUploadPath = process.env.IMG_UPLOAD_PATH;
!fs.existsSync(`${imgUploadPath}`) ? fs.mkdirSync(`${imgUploadPath}`, { recurisve: true }) : null

//serve statis files (css) from the public directory
app.use(express.static(process.env.PUBLIC_PATH));

// Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, process.env.IMG_UPLOAD_PATH)));

//middleware to passing a form
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log(`Connectd to MongoDB ${mongoose.connection.name}`);
});


app.get('/', postCtrl.index); //new post
app.get('/post/:postId', postCtrl.show); //post preview
app.get('/post/:postId/edit', postCtrl.edit); //edit page
app.get('/log', postCtrl.log); //all posts
app.get('/html/:postId', postCtrl.html); //html output
app.post('/post', mWare.fileConfig, postCtrl.post); //add post to DB
app.put('/post/:postId', mWare.fileConfig, postCtrl.update); //update post
app.delete('/post/:postId', postCtrl.remove); //delete post


app.listen(3000, (req, res) => {
    console.log(`Listening on 3000`);
});

