// importing libraries
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import {
  register,
  login,
  reset,
  logout,
} from "./controllers/authController.js";
import User from "./models/user.js";
import jwt from "jsonwebtoken";

const port = 3000;
const app = express();

// connecting DB
mongoose
  .connect("mongodb://localhost:27017", {
    dbName: "backend",
  })
  .then(() => {
    console.log("Connected to db");
  })
  .catch((error) => {
    console.log("Not Connected to db", error);
  });

// Middlewares
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "iamsecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// set the views
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));

//  Authentication Middleware
const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.render("login");
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, "iamsecretkey");
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.render("login");
      }
      req.user = user;
      return next();
    } catch (error) {
      console.log(error);
    }
  }

  res.render("login");
};

app.get("/", isAuthenticated, (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  const { name } = req.user;
  res.render("logout", { name });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", register);

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", login);

app.get("/reset", isAuthenticated, (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  res.render("reset");
});

app.post("/reset", isAuthenticated, reset);

app.get("/logout", logout);

app.listen(3000, () => {
  console.log(`Listening on port ${port}`);
});
