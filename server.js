const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');

const multer = require('multer');
const upload = multer({ dest: 'blog-uploads/' });

const app = express();
const path = require('path');
const Post = require('./models/post.js');

//serve statis files (css) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, 'blog-uploads')));

//middleware to passing a form
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
    console.log(`Connectd to MongoDB ${mongoose.connection.name}`);
});

app.get('/', async (req, res) => {
    res.render('index.ejs');
});

app.get('/post', async (req, res) => {
    console.log(`req.body 2: ${JSON.stringify(req.body)}`);

    res.render('posts/show.ejs', {
        post: req.body
    });
});

// enctype="multipart/form-data"

//add recipe to database
app.post('/post', upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
]), async (req, res) => {

    // res.redirect('/')
    // console.log(`req.body 1: ${JSON.stringify(req.body)}`);
    const imageFile = req.files['imageUrl'] ? req.files['imageUrl'][0] : null;
    const videoFile = req.files['videoUrl'] ? req.files['videoUrl'][0] : null;

    // Create public URLs
    const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;
    const videoUrl = videoFile ? `/uploads/${videoFile.filename}` : null;
    const reqObj = {
        title: req.body.title,
        intro: req.body.intro,
        ingredients: req.body.ingredients,
        instructions: req.body.instruction,
        imageUrl: req.files['imageUrl'][0].filename,
        videoUrl: req.files['videoUrl'][0].filename,
        igUrl: req.body.igUrl,
    }
    console.log(`reqObj: ${JSON.stringify(reqObj)}`);
    await Post.create(reqObj);
    // console.log(`image: ${imageUrl}, video: ${videoUrl}`);
    res.redirect('/post');
});

app.listen(3000, (req, res) => {
    console.log(`Listening on 3000`);
})