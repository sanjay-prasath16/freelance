const express = require('express');
const router = express.Router();
const cors = require('cors');
const { loginUser, registerUser, logoutUser, timeValidate, updateProfile , userDetails } = require('../controllers/authControllers');
const upload = require('../middleware/upload');

router.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_ROUTE
    })
)

router.post('/', loginUser);
router.post('/register', registerUser);
router.get('/logout',logoutUser);
router.get('/profile', timeValidate);
router.post('/updateProfile', upload.single('profilePhoto'), updateProfile);
router.get('/userDetails', userDetails);

module.exports = router;