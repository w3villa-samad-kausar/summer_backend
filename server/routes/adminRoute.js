const express=require("express");
const verifyToken = require("../middlewares/authMiddleware");
const { getUsers } = require("../controllers/adminControllers/getUsers");
const router=express.Router();

router.post('/get-users',verifyToken,getUsers)

module.exports = router