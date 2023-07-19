if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError= require('./utiilities/expressError')
const flash = require('connect-flash');
// const joi = require('joi')
const ejsMate = require('ejs-mate');//for partrials.... where u can reuse the headder and footer and can change body dynamically

const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/review')
const userRoutes = require('./routes/users')
const passport = require('passport');
const localStrategy=require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet=require('helmet');

const PORT = process.env.PORT || 3000;

const MongoStore = require('connect-mongo');


//'mongodb://127.0.0.1:27017/Yelp-camp'
const dbUrl= process.env.db_url;
// 'mongodb://127.0.0.1:27017/Yelp-camp'



// mongoose.connect('mongodb://127.0.0.1:27017/Yelp-camp');
// const db = mongoose.connection;
// db.on("error",console.error.bind(console,"connection error:"));
// db.once("open",()=>{
//     console.log("database connected");
// });


const connectDB = async () => {
    try {
      const conn = await mongoose.connect(dbUrl);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }


const app= express();
app.engine('ejs',ejsMate);
app.use(express.urlencoded({extended:true}))//as post req body is not readable
app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize());

const secret=process.env.SECRET || 'thisshouldbesecret'


const store = MongoStore.create({
    mongoUrl:dbUrl, 
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error",function(e) {
    console.log('session store error',e);
})

const sessionconfig ={
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httoOnly:true,
        // secure:true,
        expires:Date.now()+1000*60*60*24*7,//milli seconds for week 
        maxAge:1000*60*60*24*7
    }
}  
app.use(session(sessionconfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(helmet());



const scriptSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dspaj5vhe/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.currentUser= req.user;
  res.locals.success =req.flash('success');
  res.locals.error = req.flash('error')
  next();
})

app.get('/',(req,res)=>{
    res.render('home')
});

app.use('/',userRoutes);
app.use('/campground',campgroundRoutes);
app.use('/campground/:id/reviews',reviewRoutes);


 app.all('*',(req,res,next)=>{
     next(new ExpressError('page not found',404))
 })
app.use((err,req,res,next)=>{
    const {satusCode = 500 , message = 'somthing went wrong!!!'}= err;
    res.status(satusCode).render('errors',{err});
})

// app.listen(3000,()=>{
//     console.log('lisining on port 3000');
// })

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`listening for requests on port ${PORT}`);
    })
})