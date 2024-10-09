const express = require("express")
const profileRouter = express.Router()
const {userAuth}= require("../middlewares/auth")
const {validateEditProfileData}= require("../utils/validation")


// user profile get 
profileRouter.get("/profile/view",userAuth, async (req, res) => { 
    try {
      const user = req.user
        if(!user){
          throw new Error("User Does not exist")
        }
      res.send({"user": user});
    } catch (error) {
      res.status(403).send("Invalid Token");
    }
  });

profileRouter.post("/profile/edit", userAuth,async(req,res)=>{

    try{ 
        if(!validateEditProfileData(req)){
          throw new Error("Invalid Edit request")

        }
        const loggedInUser = req.user
        console.log("user",loggedInUser)
        Object.keys(req.body).forEach((key)=>(loggedInUser[key]= req.body[key]))
          await  loggedInUser.save()
        res.status(201).json({"message": "user Updated successfully", user:loggedInUser})
        
       }catch (error) {
        res.status(400).send("Error" + error.message);
      }

})




  module.exports = profileRouter
