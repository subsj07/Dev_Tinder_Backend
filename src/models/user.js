const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const userSchema = new mongoose.Schema({

firstName:{
    type: String,
    required:true,
    minlength :3,
    maxLength: 14
},
lastName:{
    type: String
},
emailId:{
    type: String,
    required:true,
    lowerCase:true,
    unique: true,
    trim:true,
   validate(value){
    if(!validator.isEmail(value)){
        throw new Error ("Invalid Email address" + value)
    }
   }
},
password:{
    type: String,
    required:true,
    validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error ("Enter a strng password" + value)
        }
       }
},
age:{
    type: Number,
    min : 10
},
gender:{
    type: String,
   validate(value){
        if(!["male","female", "others"].includes(value)){
            throw new Error ("Gender data is not valid")
        }
    }
},
photoUrl:{
    type: String,
    default:"https://thumbs.dreamstime.com/b/vector-illustration-avatar-dummy-logo-collection-image-icon-stock-isolated-object-set-symbol-web-137160339.jpg"
},
about:{
    type: String,
    default:"This is a default about user"
},
skills:{
    type: [String]
}


},{timestamps:true})


userSchema.methods.getJWT = async function (){
    const user = this

    const token = await jwt.sign({_id:user._id},"ABC@12344444")

    return token
}

userSchema.methods.validatePassword = async function (passwordInputByUser){
    const user = this
    const passwordHash = user.password

    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
return isPasswordValid
}




const userModel= mongoose.model("User", userSchema)

module.exports = userModel