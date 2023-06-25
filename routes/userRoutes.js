const express = require('express');
const router = express.Router();
const userViews = require('../views/userViews');

router.post('/register', userViews.registerUser);
router.post('/login', userViews.loginUser);

module.exports = router;