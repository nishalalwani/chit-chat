const express=require('express');
const User =require('../models/userModel')
const expressAsyncHandler = require('express-async-handler')
const generateToken =require('../Config/generateToken')

const loginController=expressAsyncHandler(async(req,res)=>{
    const {name,password}=req.body;
    const user =await User.findOne({name});

    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            image:user.image,
            isAdmin:user.isAdmin,
            token:generateToken(user._id)
        })
    }else{
        throw new Error("Invalid username or password")
    }
})



const registerController = expressAsyncHandler(async (req, res, next) => {
    const { name, email, password, image } = req.body;

    // Check for all fields
    if (!name || !email || !password || !image) {
        res.status(400);
        throw new Error("All necessary input fields have not been filled");
    }

    // Check for pre-existing users
    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Check if username is already taken
    const userNameExist = await User.findOne({ name });
    if (userNameExist) {
        res.status(400);
        throw new Error("Username already taken");
    }

    // Create new entry in the database
    const newUser = await User.create({ name, email, password, image });
    if (newUser) {
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            image: newUser.image,
            isAdmin: newUser.isAdmin,
            token: generateToken(newUser._id)
        });
    } else {
        res.status(400);
        throw new Error("Registration Error");
    }
});

module.exports = registerController;


const fetchAllUsersController= expressAsyncHandler(async (req,res)=>{
    const keyword=req.query.search
    ?{
       $or:[
        {name:{$regex:req.query.search, $options:"i"}},
        {email:{$regex:req.query.search, $options:"i"}}
       ] ,
    }:{};

    //$ne (not equal) operator to exclude documents where the _id field does not match the _id of the current user (req.user._id).

    const users= await User.find(keyword).find({
        _id:{$ne:req.user._id},
    })
    res.send(users);
})

const getAllUsers = expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

const getLastSeenController = expressAsyncHandler(async (req, res) => {
    const users = await User.find({}, 'name lastSeen');

    if (!users) {
        res.status(404);
        throw new Error('Users not found');
    }

    const lastSeenData = {};
    users.forEach((user) => {
        lastSeenData[user._id] = user.lastSeen;
    });

    res.status(200).json(lastSeenData);
});

module.exports= {loginController,registerController,fetchAllUsersController,getLastSeenController,getAllUsers}
