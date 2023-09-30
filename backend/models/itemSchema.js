const mongoose = require("mongoose");
const ApprovedRequest = require('./requestSchema');
const ItemDocument = require('./itemDocumentSchema')


const itemSchema = new mongoose.Schema({
  "name": String,
  "category": String,
  "ownedBy": String,
  "heldBy": String,
  "quantity": Number,
  "purchasedOn": Number,
  // "purchaseOrder": String,
  "status": String,
  "remarks": String,
  // "bill": String,
  // "sanctionLetter": String,
  // "inspectionReport": String,
  "itemDocument": {
    type: mongoose.Schema.Types.ObjectId,
    ref: ItemDocument,
  },
  "bookings": [ApprovedRequest.schema]
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);