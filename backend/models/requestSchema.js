const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    itemId: mongoose.Schema.Types.ObjectId,
    name: String,
    category: String,
    ownedBy: String,
    requestedBy: String,
    quantity: Number,
    requestTime: Number,
    inTime: Number,
    outTime: Number,
    requestStatus: String,
    remarks: String
});

module.exports = (mongoose.model("Request", requestSchema));