const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");



const sendMessage = async(req,res)=>{
    const {content,chatId} = req.body;
    console.log("body",req.body)
    if(!content || !chatId){
        return res.status(401).json({message:"Invalid data passed to request"});
    }

    try {
        const newMessage = {
            sender:req.user._id,
            content:content,
            chat:chatId,
        }


        let message = await Message.create(newMessage)

        message = await message.populate('sender',"name picture")
        message = await message.populate('chat')
        message = await User.populate(message,{
            path:"chat.users",
            select:"name picture email"
        })

        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message,
        });

        return res.status(200).json(message)

    } catch (error) {
        return res.status(400).json({error:error.message})
    }
}



const allMessages = async (req,res)=>{
    const {chatId} = req.params;
    try {
        const messages = await Message.find({chat: chatId})
        .populate("sender","name picture email")
        .populate('chat')

        return res.status(200).json(messages)
    } catch (error) {
        return res.status(400).json({error:error.message})
    }
}

module.exports = {sendMessage,allMessages}