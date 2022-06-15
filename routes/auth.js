const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router(); 

router.get('/signup', authController.getSignup);

router.post('/signup', 
    [ //ADDING VALIDATION
        body('email', 'Please enter a valid email').isEmail()
        .custom((value, {req}) => { //[custom] returns a boolean value
            return User.findOne({email: value})
            .then(userData => {
                if(userData) //if user with same email is found
                {
                    return Promise.reject('Email already registered'); //with [reject] we throw an error inside of the [Promise]
                }
            });
        }),
        body('password', 'Please enter a password with only numbers and text and at least 5 characters').isLength({min:5}).isAlphanumeric().trim(),
        body('confirmPassword').custom((value, {req}) => {
            if(value !== req.body.password) //if value of confirmPassword does not match with value of password
            {
                throw new Error('Passwords do not match');
            }
            return true; //otherwise return true
        }).trim()
    ]
,authController.postSignup);

router.get('/login', authController.getLogin);

router.post('/login', 
    [
        body('email', 'Please enter a valid email').isEmail(), //sanitizing email provided by validator
        body('password', 'Please enter a password with only numbers and text and at least 5 characters').isLength({min:5}).isAlphanumeric().trim()
    ]
,authController.postLogin);

router.post('/logout', authController.postLogout);

module.exports = router;