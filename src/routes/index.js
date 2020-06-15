const express = require('express');
const router = express.Router();
const { isNotLoggedIn } = require('../lib/auth');

router.get('/', isNotLoggedIn, (req, res) => {
  //res.render('index');
  res.render('auth/signin');
});

module.exports = router;