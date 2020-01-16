const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else{
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Stevans Auto Spares: Login',
        errorMessage: message
    });
  };

exports.getSignUp = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else{
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Stevans Auto Spares: Sign-Up',
        errorMessage: message
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid E-Mail or Password!');
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                    });
                }
                req.flash('error', 'Invalid E-Mail or Password!');
                res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
  };

exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPasssword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'E-Mail already exists. Try a different one!');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: { items: [] }  
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                });
        })
        
        .catch(err => console.log(err));
};  

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
  };