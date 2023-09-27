const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(401).json({ message: "Please provide userId" });
    }

    let isChat = await Chat.find({
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
      select: "name picture email",
    });


    if (isChat.length > 0) {
      return res.status(200).json({data:isChat[0]});
    } else {
      console.log('clicked')
      const chatData = {
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      try {
        const createdChat = await Chat.create(chatData);

        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );

        return res.status(200).json(FullChat);
      } catch (error) {
        console.log("err", error);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error });
      }
    }
  } catch (error) {
    console.log("err", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name picture email",
        });
        return res.status(200).json(results);
      });
  } catch (error) {
    console.log("err", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const createGroupChat = async (req, res) => {

  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please Fill all the fields" });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than 2 users are required to form a group chat" });
  }

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

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    console.log("err", error);
    return res.status(400).json({ message: `Internal Server Error`, error });
  }
};

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updateChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updateChat) {
      return res.status(404).json({ message: "No Such Group Exists" });
    } else {
      return res.status(201).json(updateChat);
    }
  } catch (error) {
    return res.status(500).json({ message: `Internal Server Error`, error });
  }
};

const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(404).send("Chat Not Found");
    }
    return res.status(201).json(added);
  } catch (error) {
    console.log(`Error ${error}`);
    return res.status(500).json({ message: `Internal Server Error`, error });
  }
};

const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(404).send("Chat Not Found");
    }
    return res.status(201).json(removed);
  } catch (error) {
    console.log(`Error ${error}`);
    return res.status(500).json({ message: `Internal Server Error`, error });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
