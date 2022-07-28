const express = require('express');
const router = express.Router();
const Post = require('../models/post');

router.get('/', function(req, res, next) {
  res.render('home', { title: 'Express' });
});

router.get('/n/:subreddit', async (req, res) => {
  try {
    const posts = await Post.find({ subreddit: req.params.subreddit }).lean(); 
    return res.render('posts-index', { posts })
  }catch (err){
    console.log(err.message);
  }
});

module.exports = router;
