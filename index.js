const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require("dotenv").config()
const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express()
const Port = process.env.PORT || 8002; 
mongoose.connect(process.env.mongoURL).then(e => console.log("mongodb connected"));

app.set('view engine','ejs')
app.set('views', path.resolve("./views"));

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.use(express.static(path.resolve("./public")));

app.get("/", async(req, res) =>{
    const allBlogs = await Blog.find({});
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(Port, () => console.log(`Server Started at Port: ${Port}`));