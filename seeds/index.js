
const mongoose = require('mongoose')
const cities = require('./cities');
const {places , descriptors} = require('./seedHelpers');
const Campground = require('../models/campground')
mongoose.connect('mongodb://127.0.0.1:27017/Yelp-camp')
const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database 1 connected");
});

const sample = (array)=> array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({})
    for(let i =0 ;i<200;i++)
    {
        const random=Math.floor(Math.random()*100);
        const random1000=Math.floor(Math.random()*1000);
        const c= new Campground({
            author:'64ae440cf6d2763332827588',
            location :`${cities[random1000].city},${cities[random1000].state}`
            ,title:`${sample(descriptors)} ${sample(places)}`,
            geometry: {
               type: 'Point',
                coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude
                ] 
                },
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusamus aperiam velit pariatur a ad rerum aut ratione ullam quis dolores repellendus minima maxime doloremque expedita, magni iure fugit? Nesciunt, velit!'
             ,price:random ,
             images: [
                {
                  url: 'https://res.cloudinary.com/dspaj5vhe/image/upload/v1689240751/yelpCamp/ir0divfywecpx0riiazu.jpg',
                  filename: 'yelpCamp/ir0divfywecpx0riiazu',
                },
                {
                  url: 'https://res.cloudinary.com/dspaj5vhe/image/upload/v1689240751/yelpCamp/gfz0ujknvbicbsllauh0.jpg',
                  filename: 'yelpCamp/gfz0ujknvbicbsllauh0',
                }
              ]
        })
          await c.save();
    }
    // https://source.unsplash.com/random
   
}

seedDB().then(()=>{
mongoose.connection.close();
});