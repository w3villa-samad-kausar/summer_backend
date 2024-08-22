const express=require("express");
const { getUserData } = require("../controllers/profileControllers/fetchUserData");
const profilePictureUpload=require('../controllers/profileControllers/profilePictureUploader')
const verifyToken = require("../middlewares/authMiddleware");
const { updateUserProfile } = require("../controllers/profileControllers/updateUserData");
const { deleteUser } = require("../controllers/profileControllers/deleteUser");
const router=express.Router();

router.get('/get-userdata',verifyToken, getUserData)
router.post('/profile-picture-upload',verifyToken,profilePictureUpload);
router.post('/update',verifyToken,updateUserProfile)
router.delete('/delete',verifyToken,deleteUser)


module.exports = router