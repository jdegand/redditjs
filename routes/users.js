const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/:username', async function(req, res) {
  try{
    const currentUser = req.user;
    const user = await User.find({username: req.params.username}).lean().populate('posts')
    const returnedUser = user[0];

    return res.render('user', { returnedUser, currentUser })
  } catch(err) {
    console.log(err.message);
  }
});

module.exports = router;
