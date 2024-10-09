const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "intrested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type" });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({ message: "User Does not exist" });
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request already exist" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.status(200).json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data: data,
      });
    } catch (err) {
      console.log("Error", err.message);
      res.status(400).send({ message: err.message, status: 400 });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .send({ message: "Status not allowed !", status: 400 });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "intrested",
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found!", status: 400 });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      return res
        .status(200)
        .json({
          message: "connectionRequest" + status,
          data: data,
          status: 200,
        });
    } catch (err) {
      console.log("Error", err.message);
      res.status(400).send({ message: err.message, status: 400 });
    }
  }
);

module.exports = requestRouter;
