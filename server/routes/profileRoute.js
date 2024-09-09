const express=require("express");
const { getUserData } = require("../controllers/profileControllers/fetchUserData");
const profilePictureUpload=require('../controllers/profileControllers/profilePictureUploader')
const verifyToken = require("../middlewares/authMiddleware");
const { updateUserProfile } = require("../controllers/profileControllers/updateUserData");
const { deleteUser } = require("../controllers/profileControllers/deleteUser");
const adressAutoComplete = require("../controllers/profileControllers/addressAutocomplete");
const paymentIntent = require("../controllers/profileControllers/paymentGateway");
const { insertFcmToken } = require("../controllers/profileControllers/fcmTokenStore");
const { updateUserPlan } = require("../controllers/profileControllers/updatePlan");
const router=express.Router();

router.get('/get-userdata',verifyToken, getUserData)
router.post('/profile-picture-upload',verifyToken,profilePictureUpload);
router.post('/update',verifyToken,updateUserProfile)
router.delete('/delete',verifyToken,deleteUser)
router.get('/address-auto-complete',verifyToken,adressAutoComplete);
router.post('/update-plan',verifyToken,updateUserPlan)

//payment route

router.post('/payment',verifyToken,paymentIntent)

//notification route
router.post('/update-fcm-token',verifyToken,insertFcmToken)

module.exports = router