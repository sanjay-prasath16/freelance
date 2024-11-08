const express = require('express');
const router = express.Router();
const cors = require('cors');
const authController = require('../controllers/authControllers');
const uploadFields = require('../middleware/upload');
const postFields = require('../middleware/PostDetails');

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_ROUTE
    })
)

router.get('/test', authController.test);
router.post('/', authController.loginUser);
router.post('/register', authController.registerUser);
router.get('/logout',authController.logoutUser);
router.get('/profile', authController.timeValidate);
router.post('/updateProfile', uploadFields, authController.updateProfile);
router.get('/verifyPhoto', authController.verifyPhoto);
router.post('/updateUserDetails', authController.updateUserDetails);
router.post('/postDetails', postFields, authController.postDetails);
router.get('/posts', authController.fetchPosts);
router.get('/posts/:userId', authController.checkPosts);
router.post('/save', authController.savePost);
router.post('/unsaved', authController.unsavedPost);
router.get('/checkSaved', authController.checkSaved);
router.get('/checkPostPhoto/:postId', authController.checkPostPhoto);
router.post('/savePostEdit', authController.saveEditedPost);
router.get('/members/:userId', authController.members);
router.post('/connections/:userId/:memberId', authController.toggleFollow);
router.get('/savedPosts/:userId', authController.savedPosts);
router.post('/like/:postId', authController.toggleLike);
router.get('/userDetails', authController.userDetails);

module.exports = router;