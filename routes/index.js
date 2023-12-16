var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./post')
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');
passport.use(new localStrategy(userModel.authenticate()));
router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});
router.get('/register', function(req, res, next) {
  res.render("register",{nav:false})
});
router.get('/profile', isLoggedin,async function(req, res, next) {
const user = await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render("profile",{user, nav:true});
});
router.get('/add', isLoggedin,async function(req, res, next) {
const user = await userModel.findOne({username:req.session.passport.user})
  res.render("add",{user, nav:true});
});
router.get('/show/posts', isLoggedin,async function(req, res, next) {
const user = await userModel.findOne({username:req.session.passport.user}).populate("posts")
  res.render("show",{user, nav:true});
});
router.get('/feed', isLoggedin, async function(req, res, next) {
const user = await userModel.findOne({username:req.session.passport.user})
const Posts = await postModel.find()
.populate("user")
  res.render("feed",{user, Posts, nav:true});
});
router.get('/edit', isLoggedin, async function(req, res, next) {
  const user = await userModel.findOne({username:req.session.passport.user})
  res.render("edit",{user, nav:true});
});

router.post('/register', function(req, res, next) {
  const data= new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
  })
   userModel.register(data, req.body.password)
   .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile")
    })
   })
});
router.post('/update', isLoggedin, async function(req, res, next) {
  const user =  await userModel.findOneAndUpdate({username:req.session.passport.user},
    {
      username:req.body.username,
      fullname:req.body.fullname,
    },{new:true});
    await user.save();
    res.redirect('/profile')
});

router.post('/createpost',isLoggedin,upload.single("postImage"),async function(req, res, next) {
  const user= await userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    postImage:req.file.filename,
  })
  user.posts.push(post._id)
  await user.save();
  res.redirect('/profile')

});
router.post("/login", passport.authenticate("local",{
  failureRedirect: "/",
  successRedirect: "/profile",
}),(req,res,next)=>{
  
});

router.post("/fileupload",isLoggedin, upload.single("image"), async (req,res,next)=>{
  const user = await userModel.findOne({username:req.session.passport.user})
  user.profileImage=req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedin(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/');
}
module.exports = router;
