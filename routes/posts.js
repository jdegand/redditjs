const express = require('express');
const router = express.Router({mergeParams:true});
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

router.get('/', async (req, res) => {
  try {
    const currentUser = req.user;
    const posts = await Post.find({}).populate('author').populate('comments').lean();
    return res.render('posts-index', { posts, currentUser });
  } catch (err) {
    console.log(err.message);
  }
});

router.get('/new', function(req, res, next) {
  const currentUser = req.user;

  if(currentUser){
    res.render('posts-new', { currentUser })
  } else {
    res.redirect('/')
  }
});

router.get('/:id', async (req, res) => {
  try{
    const currentUser = req.user;
    //const post = await Post.findById(req.params.id).populate('author').populate('comments').lean()
    const post = await Post.findById(req.params.id).lean().populate({ path:'comments', populate: { path: 'author' } }).populate('author')

    return res.render('posts-show', { post, currentUser })
  } catch(err) {
    console.log(err.message);
  }
});

router.get('/n/:subreddit', async (req, res) => {
  try {
      const currentUser = req.user;
      const posts = await Post.find({ subreddit: req.params.subreddit }).populate('author').lean() 
      return res.render('posts-index', { posts, currentUser })
  }catch (err){
    console.log(err.message);
  }
});

router.post('/new', (req, res) => {
  if (req.user) {
    const userId = req.user._id;
    const post = new Post(req.body);
    post.author = userId;
    post.upVotes = [];
    post.downVotes = [];
    post.voteScore = 0;

    post
      .save()
      .then(() => User.findById(userId))
      .then((user) => {
        user.posts.unshift(post);
        user.save();
        // REDIRECT TO THE NEW POST
        return res.redirect(`/posts`);
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else {
    return res.status(401); // UNAUTHORIZED
  }
});

router.put('/:id/vote-up', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    post.upVotes.push(req.user._id);
    post.voteScore += 1;
    post.save();
    return res.status(200);
    } catch(err) {
      console.log(err)
    }
});

router.put('/:id/vote-down', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    post.downVotes.push(req.user._id);
    post.voteScore -= 1;
    post.save();
    return res.status(200);
    } catch(err) {
      console.log(err)
    }
});

module.exports = router;
