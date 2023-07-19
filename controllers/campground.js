const Campground=require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapboxToken=process.env.mapbox_token;
const geocoder=mbxGeocoding({accessToken:mapboxToken})
const {cloudinary} = require('../cloudinary')
module.exports.index = async (req,res)=>{
    const  campgrounds = await Campground.find({});
     res.render('campgrounds/index',{campgrounds})
 };

 module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new')
};


module.exports.creatCampground=async (req,res,next)=>{
 const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    
    const camp = new Campground(req.body.campground);
    camp.geometry= geoData.body.features[0].geometry;
    camp.images=req.files.map(f=>({url:f.path,filename:f.filename}));
    camp.author = req.user._id;
     await camp.save();
     req.flash('success','successfully made a new campground!!');
     res.redirect(`/campground/${camp._id}`)
}

module.exports.showCampground= async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:  {
            path:'author'
           }
        }).populate('author');
             if(campground){
                 res.render('campgrounds/show',{campground})
             }else{
                req.flash('error','cannot find the campground');
                res.redirect('/campground')
             }
 }

module.exports.editCampground=async (req,res,next)=>{
    const camp = await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground});
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    camp.images.push(...imgs);
       await camp.save();
       if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
          await cloudinary.uploader.destroy(filename);
        }
      await  camp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})

       }
       req.flash('success','successfully updated the campground!!');
       res.redirect(`/campground/${camp._id}`)
   }

module.exports.renderEditForm=async (req,res)=>{
    const camp = await Campground.findById(req.params.id);
 
             if(camp){
                res.render('campgrounds/edit',{camp})
            }
            else{
               req.flash('error','cannot find the campground');
               res.redirect('/campground')
            }
 }

 module.exports.deleteCampground=async (req,res)=>{
    const camp = await Campground.findByIdAndDelete(req.params.id,{...req.body.campground});
             if(camp){
                req.flash('success','successfully deleted the campground!!!');
                res.redirect(`/campground`)
             }
 }