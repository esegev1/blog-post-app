const fs = require('fs');
const ejs = require('ejs');
const nodemailer = require('nodemailer');

const path = require('path');
const Post = require('../models/post.js');


//create new post
const index = async (req, res) => {
    res.render('index.ejs');
};

//Show post preview
const show = async (req, res) => {
    const post = await Post.findById(req.params.postId);
    res.render('posts/show.ejs', { 
        post: post,
        publicPath : '/uploads',
    });
};

//Display the edit page
const edit = async (req, res) => {
    const post = await Post.findById(req.params.postId);
    res.render('posts/edit.ejs', {
        post: post
    });
}

//show list of historical posts, user can delete or view from there
const log = async (req, res) => {
    const allPosts = await Post.find();

    res.render(`posts/log.ejs`, {
        posts: allPosts,
    });
};

//show the html output for the user to paste into their blog
const html = async (req, res) => {
    //fetch data from MongoDB
    const postData = await Post.findById(req.params.postId);

    // Read the EJS partial file
    const partialPath = path.join(__dirname,'..', 'views/partials', 'post.ejs');
    const template = fs.readFileSync(partialPath, 'utf8');

    // Render the EJS template with your data
    const renderedHtml = ejs.render(template, { post: postData, publicPath : process.env.PUBLIC_IMG_PATH, });

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TARGET,
        subject: `html for: ${postData.title}`,
        text: renderedHtml,
        //html: html // optional HTML version
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        // return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }

    //pass renderedHtml to the output page
    res.render(`posts/output.ejs`, {
        htmlCode: renderedHtml,
    });
};

//add recipe to database
const post = async (req, res) => {
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
        uploadDate: new Date(),

    }
    console.log(`reqObj: ${JSON.stringify(reqObj)}`);
    console.log(``);
    const newPost = await Post.create(reqObj);
    // console.log(`image: ${imageUrl}, video: ${videoUrl}`);
    req.files.postId = newPost._id;
    res.redirect(`/post/${newPost._id}`);
};


//update the databae for the post being edited
const update = async (req, res) => {
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
};

//delet a post, from log page
const remove =  async (req, res) => {
    await Post.findByIdAndDelete(req.params.postId);
    res.redirect('/log');
};

module.exports = {
    index,
    show,
    edit,
    log,
    html,
    post,
    update,
    remove,
};