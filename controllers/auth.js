const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

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
                    return transporter.sendMail({
                        to: email,
                        from: 'shop@stevansautospares.com',
                        subject: 'Welcome Aboard!',
                        html: '<h1>Hey...</h1><p>Welcome aboard Stevans Auto Spares. You are seeing this message because you have successfully signed up.'
                    });
                })
                .catch(err => {
                    console.log(err);
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

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else{
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Stevans Auto Spares: Reset Password',
        errorMessage: message
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/login');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No Account is Associated with that E-Mail. Please try again!');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'no-reply@stevansautospares.com',
                    subject: 'PASSWORD RESET!',
                    html: `
                        <h1>Hey...</h1>
                        <p>
                           You are seeing this message because there was request to change your email.
                           Click this <a href="http://localhost:4000/reset/${token}">link<a/> to reset your password!
                        </p>
                            `
                });  
            })
            .catch(err => {
                console.log(err);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ 
        resetToken: token, 
        resetTokenExpiration: { 
            $gt: Date.now() 
        }
    })  
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else{
                message = null;
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Stevans Auto Spares: Update Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: { 
            $gt: Date.now() 
        },
        _id: userId
    })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login')
        })
        .catch(err => console.log(err));
};