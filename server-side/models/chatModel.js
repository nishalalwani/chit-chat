const mongoose = require ("mongoose");

const chatModel = mongoose.Schema({
    chatName:{type:String},
    isGroupChat:{type:Boolean,default:false},
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    latestMessage : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    groupAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    groupImage:{
        type:String,
        default:"https://icon-library.com/images/lead-icon-png/lead-icon-png-17.jpg"
    }
})


module.exports = mongoose.model("Chat", chatModel);