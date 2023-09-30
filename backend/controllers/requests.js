const Request = require("../models/requestSchema.js");
const Item = require("../models/itemSchema.js");
const User = require("../models/userSchema.js");

module.exports.getSentRequests = async (req, res) => {
    try {
        // const user = await User.findOne({userID: req.user.userID});
        // const allRequests= await Request.find({requestedBy: req.user.club});
        const allRequests = await Request.find({ requestedBy: req.query.user });
        res.json(allRequests);
    }
    catch (err) {
        res.send(err);
        console.log(err);
    }
}
module.exports.getReceivedRequests = async (req, res) => {
    try {
        // const user = await User.findOne({userID: req.user.userID});
        // const allRequests= await Request.find({ownedBy: req.user.club});
        const allRequests = await Request.find({ ownedBy: req.query.user });
        res.json(allRequests);
    }
    catch (err) {
        res.send(err);
        console.log(err);
    }
}

module.exports.acceptRequest = async (req, res) => {
    try {
        const targetRequest = await Request.findOneAndUpdate(
            { _id: req.body.requestId },
            { requestStatus: `Approved` }
        );
        const item = await Item.findOneAndUpdate(
            { _id: targetRequest?.itemId },
            { "status": "bcd", $push: { "bookings": targetRequest } }
        );
        res.json({
            item: item,
            req: targetRequest
        })
    }
    catch (err) {
        res.send(err);
        console.log(err);
    }
}

module.exports.rejectRequest = async (req, res) => {
    try {
        // const user = await User.findOne({userID: req.user.userID});
        const targetRequest = await Request.findOneAndUpdate(
            { _id: req.body.requestId },
            // {requestStatus:`Declined by ${req.user.club}`}
            { requestStatus: `Declined` }
        );
        res.json(targetRequest);
    }
    catch (err) {
        res.send(err);
        console.log(err);
    }
}
module.exports.newRequest = (req, res) => {
    const request = req.body;
    // request.requestedBy = req.user.club;
    const newRequest = new Request(request);
    try {
        newRequest.save();
        res.send(newRequest);
    }
    catch (err) {
        res.send(err);
        console.log(err);
    }
}

module.exports.deleteRequest = async (req, res) => {
    try {
        const id = req.body.ID;
        const targetRequest = await Request.findOne({ _id: id });
        // const time = {
        //     "Start": targetRequest.inTime,
        //     "End": targetRequest.outTime
        // };
        const item = await Item.findOneAndUpdate(
            { _id: targetRequest.itemId },
            { "status": "bcd", $pull: { "bookings": targetRequest } }
        );
        Request.findByIdAndRemove(id, (err, doc) => {
            if (!err) {
                res.status(200).send({ result: "Success" });
            } else {
                res.send(err);
                console.log(err);
            }
        })
    }
    catch {
        res.send(err);
        console.log(err);
    }
}