const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const fs = require('fs');
const ejs = require('ejs');


// const upload = multer({ dest: 'IMG_UPLOAD_PATH' });

const app = express();
const path = require('path');
const Post = require('./models/post.js');

//Create file uplods if they don't exist, define storage
const imgUploadPath = process.env.IMG_UPLOAD_PATH;
!fs.existsSync(`${imgUploadPath}`) ? fs.mkdirSync(`${imgUploadPath}`, { recurisve: true }) : null

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Route files to the upload folder defined in the .env file
        cb(null, imgUploadPath);
    },
    filename: function (req, file, cb) {
        // console.log(`in storage, req: ${JSON.stringify(file)}`)
        // console.log(``);
        // console.log(`req: ${JSON.stringify(req.body)}`);
        // Create unique filename using timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

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

//create new post
app.get('/', async (req, res) => {
    res.render('index.ejs');
});

//Show post preview
app.get('/post/:postId', async (req, res) => {
    const post = await Post.findById(req.params.postId);
    res.render('posts/show.ejs', { post: post });
});

//Display the edit page
app.get('/post/:postId/edit', async (req, res) => {
    const post = await Post.findById(req.params.postId);
    console.log(``);
    console.log(`post: ${JSON.stringify(post)}`);
    console.log(``);
    res.render('posts/edit.ejs', {
        post: post
    });
});

//Not used currently
app.get('/post', async (req, res) => {
    res.render('posts/show.ejs', {
        post: req.body
    });
});

//show list of historical posts, user can delete or view from there
app.get('/log', async (req, res) => {
    const allPosts = await Post.find();
    res.render(`posts/log.ejs`, {
        posts: allPosts,
    });
})

//show the html output for the user to paste into their blog
app.get('/html/:postId', async (req, res) => {
    //fetch data from MongoDB
    const postData = await Post.findById(req.params.postId);

    // Read the EJS partial file
    const partialPath = path.join(__dirname, 'views/partials', 'post.ejs');
    const template = fs.readFileSync(partialPath, 'utf8');

    // Render the EJS template with your data
    const renderedHtml = ejs.render(template, { post: postData });

    //pass renderedHtml to the output page
    res.render(`posts/output.ejs`, {
        htmlCode: renderedHtml,
    });
})

//add recipe to database
app.post('/post', upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'previewImageUrl', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
]), async (req, res) => {
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


//update the databae for the post being edited
app.put('/post/:postId', upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'previewImageUrl', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
]), async (req, res) => {
    console.log(`req.param ${req.params.postId}`);
    console.log(`req.body: ${JSON.stringify(req.body)}`);
    console.log(``);

    const ingredientsArr = req.body.ingredients
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

    console.log(`ingredientsArr: ${ingredientsArr}`);
    const instructionsArr = req.body.instructions
        .split('\r\n')
        .map(step => step.trim())
        .filter(step => step.length > 0);


    // const currentData = await Post.findById(req.params.contactId)
    const updateObj = {}

    //loop through all fields in the form, if there is any value include it in the update
    for (const field in req.body) {
        console.log(`field: ${field}`)
        if (req.body[field] !== '') {
            //put ingredients and instructions in arrays to facilitate styling
            if (field === 'ingredients' || field === 'instructions') {
                req.body[field] = req.body[field]
                    .split('\n')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
            }
            updateObj[field] = req.body[field];
        }
    }

    //loop through all files in the form, if there is any value include it in the update
    for (const file in req.files) {
        let newFile = req.files[file][0];
        console.log(`file: ${file}`);
        if (file.filename !== '') {
            newFile = req.files[file][0];
            updateObj[newFile.fieldname] = `${newFile.fieldname}-${newFile.originalname}`;
        }
    }
    console.log(`updateObj: ${JSON.stringify(updateObj, null, 2)}`);
    await Post.findByIdAndUpdate(req.params.postId, updateObj);
    res.redirect(`/post/${req.params.postId}`);
});

//delet a post, from log page
app.delete('/post/:postId', async (req, res) => {
    await Post.findByIdAndDelete(req.params.postId);
    res.redirect('/log');
});

app.listen(3000, (req, res) => {
    console.log(`Listening on 3000`);
});