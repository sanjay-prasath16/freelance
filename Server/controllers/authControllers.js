const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/passwordEncrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
app.use(cookieParser());
app.use(express.json());

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
        const profilePhoto = null;
        const coverPhoto = null;
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            profilePhoto,
            coverPhoto,
        });
        await user.save();
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
                        coverPhoto: user.coverPhoto,
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
        } else {
            res.json({ err: 'Password does not match which you have given while register!' })
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
        return res.json({ err: 'Not authenticated' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
        if (err) {
            return res.json({ err: 'Invalid token, please log in again' });
        }

        try {
            let updateData = {};

            if (req.files.profilePhoto) {
                const profilePhoto = req.files.profilePhoto[0].path;
                updateData.profilePhoto = profilePhoto;
            }

            if (req.files.coverPhoto) {
                const coverPhoto = req.files.coverPhoto[0].path;
                updateData.coverPhoto = coverPhoto;
            }

            const user = await User.findByIdAndUpdate(
                userData.id,
                updateData,
                { new: true }
            );

            if (!user) {
                return res.json({ err: 'User not found' });
            }

            res.json({ message: 'Profile updated successfully', user });
        } catch (error) {
            console.error(error);
            res.json({ err: 'Error updating profile' });
        }
    });
};

const verifyPhoto = (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.json({ err: 'Not authenticated' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
        if (err) {
            return res.json({ err: 'Invalid token, please login again' });
        }

        try {
            const user = await User.findById(userData.id);

            if (!user) {
                return res.json({ err: 'User not found' });
            }

            const response = {
                profilePhotoExists: false,
                coverPhotoExists: false,
            };

            if (user.profilePhoto) {
                response.profilePhotoExists = true;
                response.profilePhotoUrl = `${req.protocol}://${req.get('host')}/${user.profilePhoto}`;
            }

            if (user.coverPhoto) {
                response.coverPhotoExists = true;
                response.coverPhotoUrl = `${req.protocol}://${req.get('host')}/${user.coverPhoto}`;
            }

            res.json(response);

        } catch (err) {
            console.log("error verifying profile photo", err);
            res.json({ err: 'Error occurred while verifying the profile photo' });
        }
    });
};

const updateUserDetails = async (req, res) => {
    const { id, username, email, role } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { username, email, role },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.json({ err: 'User not found' });
        }

        return res.json({
            message: 'Your details have been updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error('Error updating user:', err);
        return res.json({ err: 'Failed to update your details. Please try again!' });
    }
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
    verifyPhoto,
    updateUserDetails,
    userDetails,
}