const Register = require('../models/Register');
const Photos = require('../models/Photo');
const Connections = require('../models/Connections');
const postSchema = require('../models/postDetails');
const saveSchema = require('../models/Save');
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
        const exist = await Register.findOne({ email });
        if(exist) {
            return res.json({
                err: 'Entered email is already registered to us!!'
            })
        };

        const hashedPassword = await hashPassword(password);
        const user = await Register.create({
            username,
            email,
            password: hashedPassword,
            role,
        });

        const photo = await Photos.create({
            userId: user._id,
            profilePhoto: null,
            coverPhoto: null,
        });

        return res.json({user,photo});
    } catch(err) {
        console.log(err);
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Register.findOne({ username });
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
                const photo = await Photos.findOne({ userId: user.id });

                const token = jwt.sign(
                    { 
                        email: user.email, 
                        id: user._id, 
                        name: user.username,
                        role: user.role,
                        profilePhoto: photo.profilePhoto != null ? photo.profilePhoto : null,
                        coverPhoto: photo.coverPhoto != null ? photo.coverPhoto : null,
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

            const photos = await Photos.findOneAndUpdate(
                { userId: userData.id},
                updateData,
                { new: true }
            );

            if (!photos) {
                return res.json({ err: 'User not found' });
            }

            res.json({ message: 'Profile updated successfully', userData });
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
            const photos = await Photos.findOne({ userId: userData.id });

            if (!photos) {
                return res.json({ err: 'User not found' });
            }

            const data = {
                profilePhotoExists: !!photos.profilePhoto,
                coverPhotoExists: !!photos.coverPhoto,
                profilePhotoUrl: photos.profilePhoto ? `${req.protocol}://${req.get('host')}/${photos.profilePhoto}` : null,
                coverPhotoUrl: photos.coverPhoto ? `${req.protocol}://${req.get('host')}/${photos.coverPhoto}` : null,
            };

            res.json(data);

        } catch (err) {
            console.log("error verifying profile photo", err);
            res.json({ err: 'Error occurred while verifying the profile photo' });
        }
    });
};

const updateUserDetails = async (req, res) => {
    const { id, username, email, role } = req.body;

    try {
        const updatedUser = await Register.findByIdAndUpdate(
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

const postDetails = async (req, res) => {
    try {
        const { userId, desc } = req.body;
        let postPhoto = req.files?.postPhoto?.[0]?.path;    

        const newPost = new postSchema({
            userId: userId,
            desc: desc,
            postPhoto: postPhoto ? postPhoto.replace(/\\/g, '/') : null
        });

        const savedPost = await newPost.save();

        res.json({
            message: 'Post uploaded successfully',
            post: savedPost
        });

    } catch (err) {
        res.json({
            error: 'Error uploading post',
            details: err.message
        });
    }
};

const checkPosts = async (req, res) => {
    try {
        const posts = await postSchema.find({ userId: req.params.userId });
        res.json({ posts });
    } catch(err) {
        res.json({ err: 'failed to fetch posts' });
    }
}

const fetchPosts = async (req, res) => {
    try {
        const posts = await postSchema.find()
            .populate({
                path: 'userId',
                select: 'username role',
                model: 'local_register',
            });

        const users = await Promise.all(
            posts.map(async (post) => {
                const userPhotos = await Photos.findOne({ userId: post.userId._id }).select('profilePhoto');
                return {
                    ...post.toObject(),
                    profilePhoto: userPhotos ? userPhotos.profilePhoto : null
                };
            })
        );

        res.json({ posts: users });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ err: 'Failed to fetch posts' });
    }
};

const savePost = async (req, res) => {
    const { regId, postId } = req.body;

    try {
        const save = new saveSchema({
            userId: regId,
            postId: postId,
            saved: true,
        });
        await save.save();

        res.json({ message: 'Post saved successfully', save });
    } catch(err) {
        res.json({ err: 'Error saving post', err })
        console.log(err);
    }
};

const unsavedPost = async (req, res) => {
    const { regId, postId } = req.body;
  
    try {
      const user = await saveSchema.findOneAndUpdate(
        { userId: regId },
        { $pull: { savedPosts: postId } },
        { new: true }
      );
  
      if (!user) {
        return res.json({ message: "User not found" });
      }

      if (!user.savedPosts || user.savedPosts.length === 0) {
        await saveSchema.findOneAndDelete({ userId: regId });
        return res.json({ message: "Post unsaved successfully" });
      }
    } catch (err) {
      console.error("Error unsaving the post:", err);
      return res.json({ err: "An error occurred while unsaving the post" });
    }
};

const checkSaved = async (req, res) => {
    const token = req.cookies.token;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.json({ message: 'Invalid token' });
        }

        try {
            const userId = decoded.id;

            const savedPosts = await saveSchema.find({ userId });

            return res.json({ savedPosts });
        } catch (err) {
            return res.status(500).json({ err: err.message });
        }
    });
};

const checkPostPhoto = async (req, res) => {
    const { postId } = req.params;

    try {
      const post = await postSchema.findById(postId);
  
      if (!post) {
        return res.json({ message: 'Post not found' });
      }

      res.json({ postPhoto: post.postPhoto ? post.postPhoto : null });
    } catch (error) {
      console.error('Error fetching post photo:', error);
      res.json({ message: 'Internal server error' });
    }
}

const saveEditedPost = async (req, res) => {
    const { userId, description, postPhoto } = req.body;

    console.log(req.body);

    try {
        const saveEditedValue = await postSchema.findOneAndUpdate(
            { userId: userId },
            { desc: description, postPhoto: postPhoto }
        );

        if(!saveEditedValue) {
            return res.json({ err: 'User not found' });
        }

        return res.json({
            message: 'Your post details updated successfully',
            user: saveEditedValue
        });
    } catch(err) {
        res.json({message: 'Failed to update your details.Please try again later'});
        console.log(err);
    }
}

const members = async (req, res) => {
    try {
        const loggedInUserId = req.params.userId;

        const connection = await Connections.findOne({ userId: loggedInUserId });

        const users = await Register.find({ _id: { $ne: loggedInUserId } });

        const membersWithPhotosAndStatus = await Promise.all(
            users.map(async (user) => {
                const userPhotos = await Photos.findOne({ userId: user._id }).select('profilePhoto');
                
                const isFollowing = connection && connection.followings.includes(user._id.toString());

                const memberConnection = await Connections.findOne({ userId: user._id });
                const followersCount = memberConnection ? memberConnection.followers.length : 0;

                return {
                    _id: user._id,
                    username: user.username,
                    role: user.role,
                    profilePhoto: userPhotos ? userPhotos.profilePhoto : null,
                    isFollowing,
                    followersCount,
                };
            })
        );

        res.json({ members: membersWithPhotosAndStatus });
    } catch (err) {
        console.error('Error fetching members:', err);
        res.status(500).json({ err: 'Failed to fetch members' });
    }
};

const toggleFollow = async (req, res) => {
    const { userId, memberId } = req.params;
    const { follow } = req.body;

    try {
        let userConnection = await Connections.findOne({ userId });

        if (!userConnection) {
            userConnection = new Connections({
                userId,
                followers: [],
                followings: follow ? [memberId] : [],
            });
            await userConnection.save();
        } else {
            if (follow) {
                if (!userConnection.followings.includes(memberId)) {
                    userConnection.followings.push(memberId);
                }
            } else {
                userConnection.followings = userConnection.followings.filter(id => id !== memberId);
            }
            await userConnection.save();
        }

        let memberConnection = await Connections.findOne({ userId: memberId });

        if (!memberConnection) {
            memberConnection = new Connections({
                userId: memberId,
                followers: follow ? [userId] : [],
                followings: [],
            });
            await memberConnection.save();
        } else {
            if (follow) {
                if (!memberConnection.followers.includes(userId)) {
                    memberConnection.followers.push(userId);
                }
            } else {
                memberConnection.followers = memberConnection.followers.filter(id => id !== userId);
            }
            await memberConnection.save();
        }

        res.status(200).json({ message: follow ? 'Followed successfully' : 'Unfollowed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

const savedPosts = async (req, res) => {
    try {
        const loggedInUserId = req.params.userId;

        const savedPosts = await saveSchema.find({ userId: loggedInUserId });

        if (!savedPosts || savedPosts.length === 0) {
            return res.status(200).json({ savedPosts: [], message: "You have not saved any posts." });
        }

        const enrichedSavedPosts = await Promise.all(
            savedPosts.map(async (savedPost) => {
                const { userId, postId } = savedPost;

                const userInfo = await Register.findById(userId).select('username role');
                const userPhotos = await Photos.findOne({ userId }).select('profilePhoto');

                const postInfo = await postSchema.findOne({ userId, _id: postId }).select('createdAt postPhoto desc');

                console.log(userInfo);

                return {
                    _id: userId,
                    postId: postId,
                    username: userInfo ? userInfo.username : "Unknown User",
                    role: userInfo ? userInfo.role : "No Role",
                    profilePhoto: userPhotos ? userPhotos.profilePhoto : null,
                    createdAt: postInfo ? postInfo.createdAt : null,
                    postPhoto: postInfo ? postInfo.postPhoto : null,
                    description: postInfo ? postInfo.desc : null,
                    saved: savedPost.saved,
                };
            })
        );

        res.json({ savedPosts: enrichedSavedPosts });
    } catch (err) {
        console.error('Error fetching saved posts:', err);
        res.status(500).json({ err: 'Failed to fetch saved posts' });
    }
};

const toggleLike = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    try {
        const post = await postSchema.findById(postId);

        if (!post) return res.status(404).send("Post not found");

        post.likes += post.likes.includes(userId) ? -1 : 1;
        await post.save();
        res.json(post.likes);
    } catch (error) {
        res.json("Failed to update like status");
    }
}

const userDetails = (req, res) => {
    const token = req.cookies.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, user) => {
            if (err) {
                res.clearCookie('token');
                return res.json({ err: 'Your session has finished. Please login again to continue searching' });
            }

            try {
                const registerDetails = await Register.findById(user.id);
                const photoDetails = await Photos.findOne({ userId: user.id });
                const connectionDetails = await Connections.findOne({ userId: user.id });
                const postDetails = await postSchema.findOne({ userId: user.id });
                const saveDetails = await saveSchema.findOne({ userId: user.id });
                const userData = {
                    registerDetails,
                    photoDetails,
                    connectionDetails: connectionDetails 
                        ? { 
                            followersCount: connectionDetails.followers.length, 
                            followingsCount: connectionDetails.followings.length 
                          } 
                        : null,
                    postDetails,
                    saveDetails,
                };
                res.json({ user: userData });
            } catch (error) {
                res.status(500).json({ err: 'Something went wrong. Please try again.' });
            }
        });
    } else {
        res.json({ err: 'You have not logged in yet! Login to continue your work.' });
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
    postDetails,
    checkPosts,
    fetchPosts,
    savePost,
    unsavedPost,
    checkSaved,
    checkPostPhoto,
    saveEditedPost,
    toggleFollow,
    userDetails,
    savedPosts,
    toggleLike,
    members,
}