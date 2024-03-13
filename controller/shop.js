const express = require("express");
const path = require("path");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Shop = require("../model/shop");
const fs = require('fs');
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");
const { baseUrl } = require("../utils/baseUrl");
const sendShopToken = require("../utils/shopToken");


  router.post("/create-shop",upload.single("file"),async(req,res,next)=>{
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });

      if (sellerEmail) {
        const filename=req.file?.filename;
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
  
        
  
        const seller = {
          name: req.body.name,
          email: email,
          password: req.body.password,
          avatar:fileUrl,
          address:req.body.address,
          phoneNumber:req.body.phoneNumber,
          zipCode:req.body.zipCode
        };
        const activationToken = createActivationToken(seller);
        const activationUrl = `${baseUrl}/seller/activation/${activationToken}`;

        try {
          await sendMail({
            email:seller.email,
            subject:"Activate Your Shop",
            message:`Hello ${seller.name}, please click on the link to activate your shop : ${activationUrl}`,
          })
          res.status(201).json({
            success:true,
            message:`please check your email:- ${seller.email} to activate your shop`
          })
          
        } catch (error) {
          return next(new ErrorHandler(error.message,500))
        }
    } catch (error) {
      return next(new ErrorHandler(error.message),400);
    }
      
     

  
   
})

  // create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login shop 
router.post("/login-shop",catchAsyncErrors(async(req,res,next)=>{
  try {
    const { email, password } = req.body;
    console.log(email)
    if (!email || !password) {
      return next(new ErrorHandler("Please provide the all fields!", 400));
    }
    const user = await Shop.findOne({ email }).select("+password");

    
    if (!user) {
      return next(new ErrorHandler("User doesn't exists!", 400));
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(
        new ErrorHandler("Please provide the correct information", 400)
      );
    }

    
    sendShopToken(user, 201, res);
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}))


// load user
router.get("/getSeller",isSeller,catchAsyncErrors(async(req,res,next)=>{
  try {
    const seller=await Shop.findById(req.seller._id);

    if (!seller) {
      return next(new ErrorHandler("User doesn't exists", 400));
    }

    res.status(200).json({
      success: true,
      seller,
    });
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}))




module.exports = router;
