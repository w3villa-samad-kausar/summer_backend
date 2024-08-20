const express=require("express");
const { getUserData } = require("../controllers/profileControllers/fetchUserData");
const profilePictureUpload=require('../controllers/profileControllers/profilePictureUploader')
const verifyToken = require("../middlewares/authMiddleware");
const router=express.Router();

router.get('/get-userdata',verifyToken, getUserData)
router.post('/profile-picture-upload',verifyToken,profilePictureUpload);


module.exports = router