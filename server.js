const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const fs = require('fs');





// const upload = multer({ dest: 'IMG_UPLOAD_PATH' });

const app = express();
const path = require('path');
const Post = require('./models/post.js');

//Create file uplods if they don't exist, define storage
const uploadPath = process.env.IMG_UPLOAD_PATH;
!fs.existsSync(`${uploadPath}/uploads`) ? fs.mkdirSync(`${uploadPath}/uploads`, { recurisve: true }) : null

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Route files to the upload folder defined in the .env file
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        console.log(`in storage, req: ${JSON.stringify(file)}`)
        console.log(``);
        console.log(`req: ${JSON.stringify(req.body)}`);
        // Create unique filename using timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

//serve statis files (css) from the public directory
app.use(express.static(path.join(__dirname, uploadPath)));

// Serve uploaded files publicly
// app.use('/uploads', express.static(uploadPath));

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

app.get('/post/:postId', async (req, res) => {
    const post = await Post.findById(req.params.postId);
    console.log(`post done`);
    res.render('posts/show.ejs', { post: post });
    console.log(`post done 2`);


});

app.get('/post', async (req, res) => {
    console.log(`req.body 2: ${JSON.stringify(req.body)}`);

    res.render('posts/show.ejs', {
        post: req.body
    });
});

//add recipe to database
app.post('/post', upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'previewImageUrl', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
]), async (req, res) => {

    // res.redirect('/')
    // console.log(`req.body 1: ${JSON.stringify(req.body)}`);
    // const imageFile = req.files['imageUrl'] ? req.files['imageUrl'][0] : null;
    // const videoFile = req.files['videoUrl'] ? req.files['videoUrl'][0] : null;

    // Create public URLs
    // const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;
    // const videoUrl = videoFile ? `/uploads/${videoFile.filename}` : null;
    console.log(`req.body: ${JSON.stringify(req.body)}`);

    //convert ingrdients to array
    // const ingredientsArr = req.body.ingredients.split("\\n")
    // const instructionsArr = req.body.instructions.split('\\n\\n')

    const ingredientsArr = req.body.ingredients
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

    console.log(`ingredientsArr: ${ingredientsArr}`);
    const instructionsArr = req.body.instructions
        .split('\r\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);

    console.log(`instructionsArr: ${instructionsArr}`);

    const reqObj = {
        title: req.body.title,
        intro: req.body.intro,
        ingredients: ingredientsArr,
        instructions: instructionsArr,
        imageUrl: req.files['imageUrl'][0].filename,
        videoUrl: req.files['videoUrl'][0].filename,
        previewImageUrl: req.files['previewImageUrl'][0].filename,
        igUrl: req.body.igUrl,
    }
    console.log(`reqObj: ${JSON.stringify(reqObj)}`);
    console.log(``);
    const newPost = await Post.create(reqObj);
    // console.log(`image: ${imageUrl}, video: ${videoUrl}`);
    req.files.postId = newPost._id;
    res.redirect(`/post/${newPost._id}`);
});

app.listen(3000, (req, res) => {
    console.log(`Listening on 3000`);
})