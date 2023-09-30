const mongoose = require("mongoose");
const Item = require("../models/itemSchema.js");
const ItemDocument = require("../models/itemDocumentSchema.js");
const {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const storage = require("../config/config.js");
const _ = require("lodash");

const uploadImageFunction = async (file) => {
  const timestamp = Date.now();
  if (!file) {
    throw new Error("No file provided");
  }
  const fileName = `${file.originalname.split(".")[0]}_${timestamp}.${file.originalname.split(".")[1]
    }`;
  const fileRef = ref(storage, fileName);
  try {
    const fileSnapshot = await uploadBytesResumable(fileRef, file.buffer, {
      contentType: file.mimetype,
    });
    const fileURL = await getDownloadURL(fileSnapshot.ref);
    return fileURL;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

module.exports.uploadImage = async (req, res) => {
  const timestamp = Date.now();
  if (req.file) {
    console.log(req.file);
    const fileName = `${req.file.originalname.split(".")[0]}_${timestamp}.${req.file.originalname.split(".")[1]
      }`;
    const fileRef = ref(storage, fileName);

    try {
      const fileSnapshot = await uploadBytesResumable(
        fileRef,
        req.file.buffer,
        {
          contentType: req.file.mimetype,
        }
      );
      const fileURL = await getDownloadURL(fileSnapshot.ref);
      res.status(200).json({ url: fileURL });
    } catch (err) {
      res.status(500).send(err);
      console.log(err);
    }
  } else {
    return res.status(400).json({ error: "Image file is required" });
  }
};
module.exports.download = async (req, res) => {
  const timestamp = Date.now();
  if (req.files["bill"]) {
    const fileNameBill = `${req.files["bill"][0].originalname.split(".")[0]
      }_${timestamp}.${req.files["bill"][0].originalname.split(".")[1]}`;
    const billRef = ref(storage, fileNameBill);

    try {
      const billSnapshot = await uploadBytesResumable(
        billRef,
        req.files["bill"][0].buffer,
        {
          contentType: req.files["bill"][0]?.mimetype,
        }
      );
      billURL = await getDownloadURL(billSnapshot.ref);
    } catch (err) {
      res.status(500).send(err);
      console.log(err);
    }
  } else {
    return res.status(400).json({ error: "Bill file is required" });
  }
};

module.exports.addItem = async (req, res) => {
  console.log("Add item API called");
  let billURL = "";
  let sanctionURL = "";
  let purchaseURL = "";
  let inspectionURL = "";
  let savedItemDocument = {};
  const timestamp = Date.now();

  // Upload bill to firebase
  if (req.files["bill"]) {
    // Give unique name to bill with bill+timestamp to save in database
    const fileNameBill = `${req.files["bill"][0].originalname.split(".")[0]
      }_${timestamp}.${req.files["bill"][0].originalname.split(".")[1]}`;
    const billRef = ref(storage, fileNameBill);

    try {
      const billSnapshot = await uploadBytesResumable(
        billRef,
        req.files["bill"][0].buffer,
        {
          contentType: req.files["bill"][0]?.mimetype,
        }
      );
      billURL = await getDownloadURL(billSnapshot.ref);
    } catch (err) {
      res.status(500).send(err);
      console.log(err);
    }
  }

  // Upload sanctionLetter to firebase
  if (req.files["sanctionLetter"]) {
    
    // Give unique name to sanctionLetter+timestamp to save in database
    const fileNameSanctionLetter = `${req.files["sanctionLetter"][0].originalname.split(".")[0]
      }_${timestamp}.${req.files["sanctionLetter"][0].originalname.split(".")[1]
      }`;
    const sanctionRef = ref(storage, fileNameSanctionLetter);

    try {
      const sanctionLetterSnapshot = await uploadBytesResumable(
        sanctionRef,
        req.files["sanctionLetter"][0].buffer,
        {
          contentType: req.files["sanctionLetter"][0]?.mimetype,
        }
      );
      sanctionURL = await getDownloadURL(sanctionLetterSnapshot.ref);
    } catch (err) {
      res.status(500).send(err);
      console.log(err);
    }
  }

    if (req.files["purchaseOrder"]) {
      // Give unique name to purchasedOrder+timestamp to save in database
      const fileNamePurchaseOrder = `${
        req.files["purchaseOrder"][0].originalname.split(".")[0]
      }_${timestamp}.${req.files["purchaseOrder"][0].originalname.split(".")[1]}`;
      const purchaseOrderRef = ref(storage, fileNamePurchaseOrder);

      try {
        const purchaseOrderSnapshot = await uploadBytesResumable(
          purchaseOrderRef,
          req.files["purchaseOrder"][0].buffer,
          {
            contentType: req.files["purchaseOrder"][0]?.mimetype,
          }
        );
        purchaseURL = await getDownloadURL(purchaseOrderSnapshot.ref);
      } catch (err) {
        res.status(500).send(err);
        console.log(err);
      }
    }

  if (req.files["inspectionReport"]) {
    
    // Give unique name to inspectionReport+timestamp to save in database
    const fileNameInspectionReport = `${req.files["inspectionReport"][0].originalname.split(".")[0]
      }_${timestamp}.${req.files["inspectionReport"][0].originalname.split(".")[1]
      }`;
    const inspectionReportRef = ref(storage, fileNameInspectionReport);
    try {
      const inspectionReportSnapshot = await uploadBytesResumable(
        inspectionReportRef,
        req.files["inspectionReport"][0].buffer,
        {
          contentType: req.files["inspectionReport"][0]?.mimetype,
        }
      );
      inspectionURL = await getDownloadURL(inspectionReportSnapshot.ref);
    } catch (err) {
      res.status(500).send(err);
      console.log(err);
    }
  }

  // save the documents
  const itemDocument = new ItemDocument({
    bill: _.isEmpty(billURL) ? "" : billURL,
    sanctionLetter: _.isEmpty(sanctionURL) ? "" : sanctionURL,
    inspectionReport: _.isEmpty(inspectionURL) ? "" : inspectionURL,
    purchaseOrder: _.isEmpty(purchaseURL) ? "" : purchaseURL,
  });
  try {
    savedItemDocument = await itemDocument.save();
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
  console.log("File successfully uploaded.");

  const { itemsList, ...rest } = req.body;
  /// making entry of each item in database
  const promises = itemsList?.map(async (data) => {
    const newItem = new Item({
      name: data.name,
      category: data.category,
      ownedBy: req.user ? req.user : data.ownedBy, // Change after authentication setup complete
      heldBy: data.heldBy ? data.heldBy : data.ownedBy,
      quantity: data.quantity,
      purchasedOn: data.purchasedOn,
      // bill: billURL,
      // sanctionLetter: sanctionURL,
      // purchaseOrder: purchaseURL,
      // inspectionReport: inspectionURL,
      itemDocument: new mongoose.Types.ObjectId(savedItemDocument._id), // Assigning an ObjectId to itemDocument field
      status: data.status,
      remarks: data.remarks,
      bookings: [],
    });

    try {
      const addedItem = await newItem.save();
      return addedItem;
    } catch (err) {
      console.log(err);
      throw err;
    }
  });

  try {
    const addedItems = await Promise.all(promises);
    res.status(201).send({
      result: "Success",
      items: addedItems,
      itemDocument: savedItemDocument,
    });
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
  }
};

module.exports.listAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(201).json(items);
  } catch {
    res.status(500).send(err);
    console.log(err);
  }
};

module.exports.deleteItem = async (req, res) => {
  try {
    const id = req.body.ID;
    // console.log("Delete item api called ", id);
    Item.findByIdAndRemove(id, (err, doc) => {
      if (!err) {
        res.status(200).send({ result: "Success" });
      } else {
        res.send(err);
        console.log(err);
      }
    });
  } catch {
    res.send(err);
    console.log(err);
  }
};

module.exports.editItem = async (req, res) => {
  const itemId = req.params.id;
  const update = req.body;
  try {
    // Update the item in the Item collection
    const updatedItem = await Item.findByIdAndUpdate(itemId, update, {
      new: true,
    });
    // Return the updated item
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
module.exports.editDocument = async (req, res) => {
  let url;
  // console.log(req.params);
  const documentId = req.params.documentId;
  const documentType = req.params.documentType;
  try {
    if (!req.file || Object.keys(req.file).length === 0) {
      throw new Error("Image not provided");
    }
    url = await uploadImageFunction(req.file);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while uploading image");
  }
  try {
    const update = {
      [documentType]: url,
    };
    // Update the document in the ItemDocument collection
    const updatedDocument = await ItemDocument.findByIdAndUpdate(
      documentId,
      update,
      {
        new: true,
      }
    );
    // Return the updated document
    res.json(updatedDocument);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error while updating document");
  }
};

module.exports.returnItem = async (req, res) => {
  try {

    //Update status to available, and held by back to original 
    const updatedItem = await Item.findOneAndUpdate(
      { _id: req.body.itemId },
      { heldBy: req.body.heldBy, status: "available" }
    );
    if (!updatedItem) res.status(404).send({ result: "Item Not Found" });


    // Remove the first request from the bookings array
    updatedItem.bookings.shift();
    await updatedItem.save();

    res.json({ updatedItem, updatedBooking });
  } catch (err) {
    res.status(500).send(err);
  }
};
