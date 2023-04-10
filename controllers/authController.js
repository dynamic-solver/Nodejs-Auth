// importing library
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name: name,
      email,
      password: hashedPassword,
    };

    await User.create(newUser);

    const token = jwt.sign({ _id: newUser._id }, "iamsecretkey");

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send("An error occurred during registration.");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.redirect("/register");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render("login", { email, message: "Incorrect Password" });
    }

    const token = jwt.sign({ _id: user._id }, "iamsecretkey");

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send("An error occurred during login.");
  }
};

const reset = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.render("reset", { message: "Passwords do not match" });
  }

  const isMatch = await bcrypt.compare(oldPassword, req.user.password);

  if (!isMatch) {
    return res.render("reset", { message: "Current password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    res.render("reset", { message: "Password has been updated successfully" });
  } catch (error) {
    console.log(error);
    res.render("reset", {
      message: "An error occurred while updating password",
    });
  }
};

const logout = async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.redirect("/");
};

export { register, login, reset, logout };
