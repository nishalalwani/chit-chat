const express= require("express")

const {accessChat,
       fetchChats,
       createGroupChat,
       fetchGroups,
       groupExit,
       addToGroup,
       accessGroupChat,
       renameGroup,
       updateGroupImage}=require("../Controllers/chatController")

const {protect} =require("../middlewares/authMiddleware")

const router= express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect,fetchChats);
router.route("/access-group").post(protect, accessGroupChat);
router.route("/createGroup").post(protect,createGroupChat)
router.route("/fetchGroups").get(protect,fetchGroups)
router.route("/groupExit").put(protect,groupExit)
router.route("/addToGroup").put(protect,addToGroup)
router.route("/rename").put(protect,renameGroup)
router.route("/updateImage").put(protect,updateGroupImage)

module.exports=router;