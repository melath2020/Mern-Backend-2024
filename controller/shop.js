const express = require("express");
const path = require("path");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Shop = require("../model/shop");
const fs = require('fs');


// create shop
router.post("/create-shop", catchAsyncErrors(async (req, res, next) => {
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });
      if (sellerEmail) {
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
  
      const seller = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
      };
  
      const activationToken = createActivationToken(seller);
  
      const activationUrl = `https://eshop-tutorial-pyri.vercel.app/seller/activation/${activationToken}`;
  
      try {
        await sendMail({
          email: seller.email,
          subject: "Activate your Shop",
          message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${seller.email} to activate your shop!`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }));




module.exports = router;
