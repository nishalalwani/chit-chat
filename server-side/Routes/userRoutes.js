const express= require('express');
const {loginController, registerController,fetchAllUsersController,getLastSeenController,getAllUsers}= require("../Controllers/userController")

const Router= express.Router();
const {protect} =require("../middlewares/authMiddleware")


Router.post('/login',loginController);
Router.post('/register', registerController);
Router.get("/fetchUsers",protect,fetchAllUsersController)
Router.get("/getUsers",protect,getAllUsers)
Router.get("/last-seen",protect,getLastSeenController)
Router.get("/last-seen",protect,getLastSeenController)

module.exports= Router;