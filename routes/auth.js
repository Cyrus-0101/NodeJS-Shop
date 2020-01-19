const express = require('express');

const { check, body } = require('express-validator/check');

const router = express.Router();

const authController = require('../controllers/auth');

const User = require('../models/user');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignUp);

router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please Enter a valid email')
            .normalizeEmail(),
        body('password', 'Please ensure that the password you enter a password that has both numbers and text and is atleast 8 characters.')
            .isLength({min: 8})
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin);

router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please Enter a valid email')
        .normalizeEmail()
        .custom((value, {req}) => {
            // if (value === 'test@test.com') {
            //     throw new Error('Usipime Mwanaume!')
            // }
            // return true;
            return User.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-Mail already exists. Try a different one!');
                }
            });
        })
        .normalizeEmail(),
    body(
        'password',
    )
        .isLength({min: 8})
        .withMessage(
            'Please ensure that the password you enter a password that has both numbers and text and is atleast 8 characters.'
        )
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Ensure your passwords match.');
        }
        return true;
    })
    ],
    authController.postSignUp);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;