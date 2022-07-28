const express = require('express');
const router = express.Router({mergeParams: true});
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

router.get('/new', (req, res) => { // posts/:postId/comments/:commentId/replies
    const currentUser = req.user;
    let post;
    Post.findById(req.params.postId)
      .then((p) => {
        post = p;
        return Comment.findById(req.params.commentId).lean();
      })
      .then((comment) => {
        res.render('replies-new', { post, comment, currentUser });
      })
      .catch((err) => {
        console.log(err.message);
      });
  });

  router.post('/new', (req, res) => { // posts/:postId/comments/:commentId/replies
    
    const reply = new Comment(req.body);
    reply.author = req.user._id;
    // LOOKUP THE PARENT POST
    Post.findById(req.params.postId)
      .then((post) => {
        // FIND THE CHILD COMMENT
        Promise.all([
          reply.save(),
          Comment.findById(req.params.commentId),
        ])
          .then(([reply, comment]) => {
            // ADD THE REPLY
            comment.comments.unshift(reply._id);
            return Promise.all([
              comment.save(),
            ]);
          })
          .then(() => res.redirect(`/posts/${req.params.postId}`))
          .catch(console.error);
        // SAVE THE CHANGE TO THE PARENT DOCUMENT
        return post.save();
      });
      
  });

module.exports = router;