const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

// Get all the pending connection request forthe loggin user
userRouter.get("/user/requests/recevied", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "intrested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "gender",
      "photoUrl",
      "sbout",
      "skills",
      "age",
    ]);
    res.status(200).json({
      message: "Data recived successfully",
      data: connectionRequest,
      status: 200,
    });
  } catch (err) {
    console.log("Error", err.message);
    res.status(400).send({ message: err.message, status: 400 });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "gender",
        "photoUrl",
        "sbout",
        "skills",
        "age",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "gender",
        "photoUrl",
        "sbout",
        "skills",
        "age",
      ]);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    // console.log("connectionRequest", data);

    res.status(200).json({
      message: "Data recived successfully",
      data: data,
      status: 200,
    });
  } catch (err) {
    console.log("Error", err.message);
    res.status(400).send({ message: err.message, status: 400 });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select([
        "firstName",
        "lastName",
        "gender",
        "photoUrl",
        "sbout",
        "skills",
        "age",
      ])
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Data recived successfully",
      data: users,
      status: 200,
    });
  } catch (err) {
    console.log("Error", err.message);
    res.status(400).send({ message: err.message, status: 400 });
  }
});

module.exports = userRouter;
