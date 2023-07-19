const express = require('express');
const router = express.Router();
const catchAsync = require('../utiilities/catchasync');
const {isLoggedIn,isAuthor,validateCampground}=require('../middle')
const campground=require('../controllers/campground')
const multer=require('multer')
const {storage}=require('../cloudinary')
const upload=multer({storage})
router.route('/')
       .get(catchAsync(campground.index))
       .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campground.creatCampground));
       
 router.get('/new', isLoggedIn,campground.renderNewForm);

 router.route('/:id')
        .get(catchAsync(campground.showCampground))
        .put(isLoggedIn,isAuthor,upload.array('image'),validateCampground, catchAsync(campground.editCampground))
        .delete(isLoggedIn,isAuthor,catchAsync(campground.deleteCampground));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campground.renderEditForm));


 module.exports = router;