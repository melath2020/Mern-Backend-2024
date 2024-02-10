const express = require("express");
const path=require('path');
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const router = express.Router();
const fs = require('fs');
const User = require("../model/user");
const jwt =require('jsonwebtoken');

// create user
router.post("/create-user",upload.single("file"),async(req,res,next)=>{
    
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
      const newUser=await User.create(user);
      res.status(201).json({
        success:true,
        newUser,
      })
   
})





  module.exports = router;