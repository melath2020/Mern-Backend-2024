const express = require("express");
const path=require('path');
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const router = express.Router();
const { baseUrl } = require("../utils/baseUrl");
const sendMail = require("../utils/sendMail");
const fs = require('fs');
const User = require("../model/user");
const jwt =require('jsonwebtoken');
const sendToken = require("../utils/jwtToken");
const catchAsyncErrors=require('../middleware/catchAsyncErrors');

// create user
router.post("/create-user",upload.single("file"),async(req,res,next)=>{
    try {
      
      const { name, email, password } = req.body;
      const userEmail = await User.findOne({ email });
  
      if (userEmail) {
        const filename=req.file.filename;
        const filePath=`uploads/${filename}`;
        fs.unlink(filePath,(err)=>{
          if(err){
            console.log(err);
            res.status(500).json({
              message:"Error Deleting file"
            })

          }else{
            res.json({
              message:"File Deleted Successfully"
            })
          }
        })
          return next(new ErrorHandler("User already exists", 400));
        }
  
        const filename=req.file.filename;
        const fileUrl=path.join(filename);
  
        
  
        const user = {
          name: name,
          email: email,
          password: password,
          avatar:fileUrl
        };
  
    console.log(user)
    const activationToken = createActivationToken(user);
    const activationUrl = `${baseUrl}/activation/${activationToken}`;

    try {
      await sendMail({
        email:user.email,
        subject:"Activate Your Account",
        message:`Hello ${user.name}, please click on the link to activate your account : ${activationUrl}`,
      })
      res.status(201).json({
        success:true,
        message:`please check your email:- ${user.email} to activate your account`
      })
      
    } catch (error) {
      return next(new ErrorHandler(error.message,500))
    }

    } catch (error) {
      return next(new ErrorHandler(error.message),400);
    }
      // const newUser=await User.create(user);
      // res.status(201).json({
      //   success:true,
      //   newUser,
      // })
   
})


// create activation token
const createActivationToken=(user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
}


// activate user
router.post("/activation",catchAsyncErrors(async(req,res,next)=>{
  try {
    const { activation_token } = req.body;

    const newUser = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET
    );

    if (!newUser) {
      return next(new ErrorHandler("Invalid token", 400));
    }
    const { name, email, password, avatar } = newUser;

    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorHandler("User already exists", 400));
    }
    user = await User.create({
      name,
      email,
      avatar,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
})
);

// login user
router.post("/login-user",catchAsyncErrors(async(req,res,next)=>{
  
}))




  module.exports = router;