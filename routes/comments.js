const express = require('express');
const router = express.Router({mergeParams: true}); //  for nested routes
const Comment = require('../models/comment');
const Post = require('../models/post');

router.post('/', (req, res) => {

  const comment = new Comment({
    content: req.body.content, 
    author: req.user._id
  });

  // SAVE INSTANCE OF Comment MODEL TO DB

  // Have to populate here to get author.username ????
  comment
    .save()
    .then(() => Post.findById(req.params.postId))
    .then((post) => {
      post.comments.unshift(comment);
      return post.save();
    })
    .then(() => res.redirect('/'))
    .catch((err) => {
      console.log(err);
    });

});

router.get('/:commentId/replies/new', (req, res) => {

  const currentUser = req.user;
  let post;
  Post.findById(req.params.postId)
    .then((p) => {
      post = p;
      return Comment.findById(req.params.commentId).lean(); // can't populate here ???
    })
    .then((comment) => {
  
      const postId = post._id.toString()
      
      res.render('replies-new', { postId, comment, currentUser });
    })
    .catch((err) => {
      console.log(err.message);
    });

});


router.post('/:commentId/replies/new', (req, res) => {

  const reply = new Comment({
    content: req.body.content,
    author: req.user._id
  });

  Post.findById(req.params.postId)
    .then((post) => {
      // FIND THE CHILD COMMENT
      Promise.all([
        reply.save(),
        Comment.findById(req.params.commentId)
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