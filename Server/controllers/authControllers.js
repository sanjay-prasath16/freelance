const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/passwordEncrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
app.use(cookieParser());
app.use(express.json());
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');

const test = (req, res) => {
    res.json('test is working');
}

const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegEx = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&\.])[A-Za-z\d@$!%*?&\.]{6,}$/;
        if(!username) {
            return res.json({
                err: 'enter a name to proceed'
            })
        };
        if(!email) {
            return res.json({
                err: 'enter a email to proceed'
            })
        } else if(!emailRegEx.test(email)) {
            return res.json({
                err: 'enter email in the format of abc@gmail.com'
            })
        };
        if(!password) {
            return res.json({
                err: 'enter a password to proceed'
            })
        } else if(password.length < 6) {
            return res.json({
                err: 'enter a password with a character of above 6 characters'
            })
        } else if(!passwordRegEx.test(password)) {
            return res.json({
                err: 'the password should contain atleast one caps(A-Z), one small(a-z), one special character and  one number'
            })
        };
        if(!role) {
            return res.json({
                err: 'Select the role to continue registration'
            })
        }
        const exist = await User.findOne({ email });
        if(exist) {
            return res.json({
                err: 'Entered email is already registered to us!!'
            })
        };

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            profilePhoto,
        });
        return res.json(user);
    } catch(err) {
        console.log(err);
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if(!user) {
            return res.json({
                err: 'Sorry, No user found with the entered user name'
            })
        }
        const match = await comparePassword(password, user.password);
        if(!password) {
            return res.json ({
                err: 'Enter a password to proceed'
            })
        }
        if (match) {
            try {
                const token = jwt.sign(
                    { 
                        email: user.email, 
                        id: user._id, 
                        name: user.username,
                        role: user.role,
                        profilePhoto: user.profilePhoto,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '4y' }
                );
                res.cookie('token', token, { httpOnly: true });
                res.json({ user, token });
            } catch (err) {
                console.error("JWT Sign Error: ", err);
                res.json({ err: 'Error generating token' });
            }
        }        
    } catch(err) {
        console.log(err)
    }
}

const logoutUser = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

const timeValidate = (req, res) => {
    const token = req.cookies.token;
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if(err) {
                res.clearCookie('token')
                return res.json({ err: 'You have been logged out for some security purpose.Kindly loginin again in order to continue your work' });
            }
            res.json(user)
        })
    } else {
        res.json(null)
    }
};

const updateProfile = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ err: 'Not authenticated' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
        if (err) {
            return res.status(403).json({ err: 'Invalid token, please log in again' });
        }

        if (req.file) {
            try {
                const profilePhoto = req.file.path;

                const user = await User.findByIdAndUpdate(
                    userData.id,
                    { profilePhoto: profilePhoto },
                    { new: true }
                );

                if (!user) {
                    return res.json({ err: 'User not found' });
                }

                res.json({ message: 'Profile photo updated successfully', user });
            } catch (error) {
                res.json({ err: 'Error updating profile photo' });
            }
        } else {
            res.json({ err: 'No file uploaded' });
        }
    });
};

const userDetails = (req, res) => {
    const token = req.cookies.token;
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if(err) {
                res.clearCookie('token');
                return res.json({ err: 'Your session have been finished.Please login again to continue searching' });
            }
            res.json(user);
        })
    } else {
        res.json({ err: `${'You have not logged in yet! Login to continue your work'}` });
    }
};

module.exports = {
    test,
    registerUser,
    loginUser,
    logoutUser,
    timeValidate,
    updateProfile,
    userDetails,
}