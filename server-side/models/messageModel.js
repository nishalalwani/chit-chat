const { default: mongoose } = require("mongoose");
const momgoose= require("mongoose");

const messageModal= mongoose.Schema(
    {
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        reciever:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        chat:{
            type:momgoose.Schema.Types.ObjectId,
            ref:"Chat"
        },
        content: {
            type: String, 
            required: true 
        }
    },
    {
        timestamps :true,
    }
)

module.exports= mongoose.model("Message",messageModal);
