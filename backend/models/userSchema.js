const mongoose = require('mongoose');
const userSchema= new mongoose.Schema({
    name: String,
    mobileNumber: Number,
    club: String,
    userID: String,
    password: String
});
module.exports=mongoose.model("User",userSchema);
