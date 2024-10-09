const express = require("express");
const connectDB = require("./config/database");

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("./config/database");

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// get detail of user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const user = await User.find({ emailId: userEmail });
    if (user.length === 0) {
      res.status(404).send({ status: 404, message: "User not found" });
    } else {
      res
        .status(200)
        .send({
          userDetails: user,
          status: 200,
          message: "User get successfully",
        });
    }
  } catch (err) {
    console.log("Something Went Wrong");
  }
});

// get list of all users
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({ status: 404, users: users, message: "Users found" });
  } catch (err) {
    console.log("Something Went Wrong");
  }
});

// delete the user with id
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    const users = await User.findByIdAndDelete(userId);
    res
      .status(200)
      .send({
        status: 200,
        users: users,
        message: "User Deleted Successfully",
      });
  } catch (err) {
    console.log(err);
  }
});

// update user with Id
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWEDUPDATES = [
      "userId",
      "photoUrl",
      "about",
      "gender",
      "age",
      "skills",
    ];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWEDUPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
      res.status(400).send({ status: 400, message: "Update not allowed" });
    }

    const users = await User.findByIdAndUpdate({ _id: userId }, data);
    res
      .status(200)
      .send({ status: 200, users: data, message: "User Deleted Successfully" });
  } catch (err) {
    res.status(400).send({ status: 400, message: err.message });
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Not connected to the database"));
