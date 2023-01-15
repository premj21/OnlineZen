import { User } from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import cloudinary from 'cloudinary'; 
import getDataUri from "../utils/datauri.js";
const useregister = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
     
    if (!user) {
      const file = req.file; 
   const fileUri =  getDataUri(file);
   const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);


      const user = await User.create({
        name,
        email,
        password,
        avatar: {
          public_id: mycloud.public_id,
          url: mycloud.secure_url,
        },
      });
      sendToken(res, user, "Registerd Successfully", 201);
    } else return res.status(409).json({ message: "User alredy exist" });
  } catch (error) {
    console.log(error);
  }
};

const Userlogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credential" });
    const isit = await user.comparePassword(password);
    if (!isit)
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credential" });
    sendToken(res, user, "Welcome Back", 200);
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        success: true,
        message: "Logged Out Successfully",
      });
  } catch (error) {
    console.log(error);
  }
};

const getMyProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
};

const changepassword = async (req, res, next) => {
  try {
    const { oldpassword, newpassword } = req.body;
    let user = await User.findById(req.user._id).select("+password");
    const match = await user.comparePassword(oldpassword);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Old password Incorrect" });
    user.password = newpassword;

    await user.save();
    res.status(200).json({
      success: true,
      message: "Password changed Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const updateprofile = async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const updateprofilepicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id); 
     const file = req.file; 
   const fileUri =  getDataUri(file);
   const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  user.avatar={
    public_id:mycloud.public_id,
    url:mycloud.secure_url
  }
  await user.save(); 
   res.status(200).json({
      success: true,
      message: "ProfilePicture Updated Successfully",
    });

  } catch (error) {
    console.log(error);
  }
};

const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    const resetTOken = await user.getResetToken();
    await user.save();
    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetTOken}`;
    const msg = `Click on the link to reset your password . ${url}.If you are not request then please ignore`;
    sendEmail(user.email, "OnlineZen Reset Password", msg);
    res.status(200).json({
      success: true,
      message: `Reset Token has been sent to ${user.email}`,
    });
  } catch (error) {
    console.log(error);
  }
};
const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Token Invalid / Expired",
      });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(201).json({
      success: true,
      message: "Password Changed Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const addtoplaylist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);
    if (!course)
      return res.status(404).json({
        success: false,
        message: "INvalid Course",
      });
    const exist = user.playlist.find((item) => {
      if (item.course.toString() === course._id.toString()) return true;
    });
    if (exist)
      return res.status(409).json({
        success: false,
        message: "Alredy Present",
      });

    user.playlist.push({
      course: course._id,
      poster: course.poster.url,
    });
    await user.save();
    res.status(200).json({
      success: true,
      message: "Course added Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
const removefromplaylist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.body.id);
    const newcr = user.playlist.filter((item) => {
      if (item.course.toString() !== course._id.toString()) return item;
    });
    user.playlist = newcr;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Course Removed Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export {
  Userlogin,
  useregister,
  logout,
  getMyProfile,
  changepassword,
  updateprofile,
  updateprofilepicture,
  forgetpassword,
  resetpassword,
  addtoplaylist,
  removefromplaylist,
};
