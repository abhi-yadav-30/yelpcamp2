const User=require('../models/user')

module.exports.register=(rea,res)=>{
    res.render('users/register')
}

module.exports.registerForm=async(req,res)=>{
    try{
        const {email,username,password}=req.body;
        const user=  new User({email,username});
       const registeredUser= await User.register(user,password);
       req.login(registeredUser,err=>{
        if(err) return next(err);
        req.flash('success','welcom to yelpcamp!!');
       res.redirect('/campground')
       })

  }catch(e){
    req.flash('error',e.message);
    res.redirect('/register')
  }
}


module.exports.login=(req,res)=>{
    res.render('users/login')
}

module.exports.loginForm=(req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campground'; // update this line to use res.locals.returnTo now
    res.redirect(redirectUrl);
}



module.exports.logout=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'successfully loged out!!!');
        res.redirect('/campground');
    });
}