const mongoose =require('mongoose');
const Review = require('./review');
const { campgroundSchema } = require('../schemas');


const { Schema } = mongoose;


const ImageSchema = new Schema({
    url:String,
  filename:String
});

ImageSchema.virtual('thumbnail').get(function(){
 return   this.url.replace('/upload','/upload/w_200');
})


const opts = {toJSON:{virtuals:true}};

const  cmpgrdSchema = new Schema({
    title:{
        type: String,
      
    },
    price:{
        type:Number
        
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description:{
        type:String,
    },
    location:String,
    images:[ImageSchema],
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
  }, 
    reviews:[{
        type: Schema.Types.ObjectId,
        ref:'Review'
    }]
},opts);



 cmpgrdSchema.virtual('properties.popupMarkup').get(function(){
    return  `<strong><a href="/campground/${this._id}">${this.title}</a></strong>
             <p>${this.description.substring(0,20)}...</p> `;
   })
   

cmpgrdSchema.post('findOneAndDelete', async function (doc) {
  
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
     }
})

module.exports = mongoose.model('Campground',cmpgrdSchema);