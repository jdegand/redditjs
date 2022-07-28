const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');
require('dotenv').config()

// combined index and auth into one file - caused conflicts in app.js

router.get('/', function(req, res, next) {
    const currentUser = req.user;
    res.render('home', { title: 'Express', currentUser });
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Find this user name
    User.findOne({ username }, 'username password')
      .then((user) => {
        if (!user) {
          // User not found
          return res.status(401).send({ message: 'Wrong Username or Password' });
        }
        // Check the password
        user.comparePassword(password, (err, isMatch) => {
          if (!isMatch) {
            // Password does not match
            return res.status(401).send({ message: 'Wrong Username or password' });
          }
          // Create a token
          const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, {
            expiresIn: '1h',
          });
          // Set a cookie and redirect to root
          res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
          return res.redirect('/');
        });
      })
      .catch((err) => {
        console.log(err);
      });
});

router.get('/sign-up', (req, res) => res.render('sign-up'));

router.post('/sign-up', (req, res) => {
    // Create User and JWT
    const user = new User(req.body);
  
    user
      .save()
      .then((user) => {
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: '1h' });
        res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
        return res.redirect('/');
      })
      .catch((err) => {
        console.log(err.message);
        return res.status(400).send({ err });
      });

});


router.get('/n/:subreddit', async (req, res) => {

  // case sensitive

    try {
      const currentUser = req.user;
      const posts = await Post.find({ subreddit: req.params.subreddit }).lean().populate('author'); 
      return res.render('posts-index', { posts, currentUser })
    }catch (err){
      console.log(err.message);
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('nToken');
    return res.redirect('/');
  });

module.exports = router;