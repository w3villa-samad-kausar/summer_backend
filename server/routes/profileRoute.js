const express=require("express");
const { getUserData } = require("../controllers/profileControllers/fetchUserData");
const verifyToken = require("../middlewares/authMiddleware");
const router=express.Router();

router.get('/get-userdata',verifyToken, getUserData)

module.exports = router