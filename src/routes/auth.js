const express = require("express")
const authRouter = express.Router()
const User = require("../models/user")
const {validateSignupData}= require("../utils/validation")
const bcrypt = require("bcrypt")

// signup with new user
authRouter.post("/signup", async (req,res)=>{
    //console.log(req.body)
    // const user = new User(req.body)
    
    try{
        validateSignupData(req)
        const {firstName,lastName,emailId,password, skills,age} = req.body
    
        const passwordHash = await bcrypt.hash(password,10)
    
        const user = new User({firstName,lastName,emailId,password:passwordHash, skills,age})
    
        await user.save()
        res.status(200).send({message:"User Added Successfully" ,status:200,userData:user})
    }
    catch(err){
    console.log("Error", err.message)
    res.status(400).send({message:err.message ,status:400})
    
    }
    
    })
    
    // login user api
    authRouter.post("/login", async (req, res) => {
        try {
          const { emailId, password } = req.body;
          if (!emailId || !password) {
            return res.status(400).json({ message: "Email and password are required", status: 400 });
          }
          const user = await User.findOne({ emailId: emailId });
      
          if (!user) {
            return res.status(400).json({ message: "User does not exist", status: 400 });
          }
      
          // Validate password
          const isPasswordValid = await user.validatePassword(password)
      
          if (isPasswordValid) {
           
            const token = await user.getJWT()
            res.cookie('token', token, { httpOnly: true })
            // res.cookie(token)
            return res.status(200).json({ message: "User logged in successfully", status: 200 });
          } else {
            return res.status(400).json({ message: "Password does not match", status: 400 });
          }
        } catch (err) {
          console.error("Error during login:", err.message);
          return res.status(500).json({ message: "Server error", status: 500 });
        }
      });


    authRouter.post("/logout", async (req,res)=>{

        res.cookie("token",null,{
            expires :new Date (Date.now())
        })
        res.status(200).send("Logout Successfully")
    })  

 module.exports = authRouter
