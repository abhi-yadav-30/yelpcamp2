const express = require('express');
const router = express.Router({mergeParams:true});//to acces the param form app.js
const catchAsync = require('../utiilities/catchasync');
const {validateReview,isLoggedIn,isReviewAuthor}= require('../middle')
const review=require('../controllers/review')

router.post('/',isLoggedIn,validateReview,catchAsync(review.createReview));

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(review.deleteReview));

module.exports = router;