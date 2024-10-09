    const mongoose = require("mongoose")

const connectDB =async ()=>{
    await mongoose.connect("mongodb+srv://subsj07:ncWGiYyGzYnHK24A@cluster0.zxmsdj2.mongodb.net/devTinder")

}


module.exports = connectDB
