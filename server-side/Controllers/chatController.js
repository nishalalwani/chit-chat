const asyncHandler= require("express-async-handler");
const Chat= require("../models/chatModel")
const User= require("../models/userModel")

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      console.log("UserId param not sent with request");
      return res.sendStatus(400);
    }
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
      
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name email image",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
     
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
       
      } catch (error) {
        res.status(400);
        throw new Error("AccessChatError",error.message);
      }
    }
  });
  
const fetchChats = asyncHandler(async (req, res) => {
  try {
  Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
 
  .populate("users", "-password")
  .populate("groupAdmin", "-password")
  .populate("latestMessage")
  .sort({ updatedAt: -1 })
  .then(async(results)=>{
    results=await User.populate(results,{
      path:"latestMessage.sender",
      select:"name email image"
    })
    res.status(200).send(results);
  })

    
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const accessGroupChat = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    console.log("ChatId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    // Fetch the chat based on chatId
    const fullChat = await Chat.findOne({ _id: chatId }).populate("users", "-password") .populate("groupAdmin", "-password");

    if (!fullChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if the chat involves the requesting user
    const userInChat = fullChat.users.some(user => user.equals(req.user._id));

    if (!userInChat) {
      return res.status(403).json({ message: "Unauthorized to access this chat" });
    }

    res.status(200).json(fullChat);
  } catch (error) {
    console.error("AccessChatError:", error);
    res.status(400).json({ message: "Error accessing chat" });
  }
});

  

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Data is insufficient" });
  }

  // Parse users only if it's a string
  const users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;

  // Ensure req.user is not pushed directly into the users array
  if (Array.isArray(users)) {
      users.push(req.user);

      try {
          const groupChat = await Chat.create({
              chatName: req.body.name,
              users: users,
              isGroupChat: true,
              groupAdmin: req.user,
          });

          const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
              .populate("users", "-password")
              .populate("groupAdmin", "-password");

          res.status(200).json(fullGroupChat);
      } catch (error) {
          res.status(400);
          throw new Error("createGroupError", error.message);
      }
  } else {
      res.status(400).send({ message: "Invalid format for 'users'" });
  }
});


const fetchGroups=asyncHandler(async(req, res)=>{
    try{
        const allGroups= await Chat.where("isGroupChat").equals(true);
        res.status(200).send(allGroups);
    }catch(error){
        res.status(400)
        throw new Error(error.message)
    }
})

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const groupExit=asyncHandler(async(req, res)=>{
    const {chatId,userId} = req.body;

    //check if the requester is admin

    const removed = await Chat.findByIdAndUpdate(chatId, {
        $pull: { users: userId }
    }, { new: true })
        
    .populate("users","-password")
    .populate("groupAdmin", "-password")

    if(!removed){
        res.status(404);
        throw new Error("Chat Not Found")
    }else{
        res.json(removed)
    }
})

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

const updateGroupImage=asyncHandler(async(req,res)=>{
  const {chatId,image}= req.body;

  if(!chatId || !image){
    return res.status(400).json({message:"Chat ID and image are required"})
  }

  try{
    const updatedChat= await Chat.findByIdAndUpdate(
      chatId,
      {
        groupImage:image
      },
      {
        new:true
      }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(updatedChat)
  }
  catch (error) {
    res.status(400).json({ message: "Error updating group image", error: error.message });
  }
})


module.exports={accessChat,fetchChats,createGroupChat,fetchGroups,groupExit,addToGroup,renameGroup,accessGroupChat,updateGroupImage}