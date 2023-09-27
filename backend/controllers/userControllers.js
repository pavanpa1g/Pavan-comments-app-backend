const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = async (req, res) => {
  const { name, email, password, picture } = req.body;

  if (!name || !email || !password) {
   
    return   res.status(400).json({message:"Please Enter all the required fields"});
  }

  try {
      const userExists = await User.findOne({ email });
  if (userExists) {
    return   res.status(400).json({message:"Email already exists"})
  }

  const user = await User.create({
    name,
    email,
    password,
    picture,
  });

  if (user) {
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } else {
    return res.status(500).json({message:"Error in creating a user"});
  }
  } catch (error) {
    res.status(500).json({message:'Server Error',error});
  }

};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password){
    return  res.status(400).json({ message : "Enter Email and Password" })
  }

  try {
      const user = await User.findOne({ email });


  if (user && (await user.matchPassword(password))) {
    //Login Success
   return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } else {
    //Failed Login
    return res.status(500).json({message:"Invalid Email or Password"});
  }
  } catch (error) {
    return res.status(500).json({message:'Server error',error})
  }

};


//using  api/user?search=value query
const allUsers = ( async(req,res)=>{
  const keyword = req.query.search ? {
    $or:[
      {name:{$regex: req.query.search,$options:"i"}},
      {email:{$regex: req.query.search,$options:"i"}},
    ]
  }:{};

  try {
      const users = await User.find(keyword).select("-password").find({_id:{$ne:req.user._id}})
  
  return res.send(users)
  } catch (error) {
    return res.status(error.statusCode).json({message:error})
  }

})


module.exports = { registerUser, authUser, allUsers };
