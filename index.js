const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
//require("dotenv").config()
const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express()
//const Port = process.env.PORT || 8002; 
const Port = 8002;
//mongoose.connect(process.env.mongoURL).then(e => console.log("mongodb connected"));
mongoose.connect('mongodb://localhost:27017/blogify').then(e => console.log("mongodb connected"));
app.use(express.static('public'));

app.set('view engine','ejs')
app.set('views', path.resolve("./views"));

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public")));

app.get("/",async (req,res)=>{
    if(!req.user){
        return res.redirect("/user/signin");
    }

    try {
        const allBlog = await Blog.find({ });
        return res.render("home",{
            user: req.user,
            blogs: allBlog,
        });
    } catch (error) {
        return res.status(500).send("Internal Server Error..");
    }
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(Port, () => console.log(`Server Started at Port: ${Port}`));