import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { hash, compare } from "bcryptjs";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/VerifyToken.js";
const { sign } = jwt;
export const commonApp = exp.Router();
import { upload } from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";
config();
// import cloudinary from "../config/cloudinaryUpload.js";
//Route for register
commonApp.post("/users", upload.single("profileImageUrl"), async (req, res, next) => {
  let cloudinaryResult;
  try {
    let allowedRoles = ["USER", "AUTHOR", "ADMIN"];
    //get user from req
    const newUser = req.body;
    console.log(newUser);
    console.log(req.file);

    //check role
    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Only one admin allowed
    if (newUser.role === "ADMIN") {
      const existingAdmin = await UserModel.findOne({ role: "ADMIN" });
      if (existingAdmin) {
        return res.status(409).json({ message: "An admin already exists", error: "An admin account already exists. Only one admin is allowed." });
      }
    }

    //Upload image to cloudinary from memoryStorage
    if (req.file) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return res.status(400).json({ message: "Cloudinary credentials missing", error: "Please add Cloudinary credentials to .env to upload profile images." });
      }
      cloudinaryResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "blog_app" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });
}

    // console.log("cloudinaryResult", cloudinaryResult);
    //add CDN link(secure_url) of image to newUserObj
    newUser.profileImageUrl = cloudinaryResult?.secure_url;

    //run validators manually
    //hash password and replace plain with hashed one
    newUser.password = await hash(newUser.password, 12);

    //create New user document
    const newUserDoc = new UserModel(newUser);

    //save document
    await newUserDoc.save();
    //send res
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.log("err is ", err);
    //delete image from cloudinary
    if (cloudinaryResult?.public_id) {
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      } catch (destroyErr) {
        console.log("Error destroying image from cloudinary", destroyErr);
      }
    }
    next(err);
  }
});

//Route for Login(USER, AUTHOR and ADMIN)
commonApp.post("/login", async (req, res, next) => {
  //console.log(req.body)
  //get user cred obj
  const { email, password } = req.body;
  //find user by email
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email", error: "Invalid email" });
  }
  //compare password
  const isMatched = await compare(password, user.password);
  //if passwords not matched
  if (!isMatched) {
    return res.status(400).json({ message: "Invalid password", error: "Invalid password" });
  }
  if (!user.isUserActive) {
    return res.status(403).json({ message: "Account blocked. Contact admin." });
  }

  const signedToken = sign(
    {
      id: user._id,
      email: email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "7d",
    },
  );

  const origin = req.get('origin');
  const isCrossOrigin = origin && (
    origin.includes('vercel.app') || 
    origin.includes('render.com') || 
    origin !== `http://localhost:${process.env.PORT || 4000}`
  );
  const isProduction = process.env.NODE_ENV === 'production' || isCrossOrigin;
  
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    RENDER: process.env.RENDER,
    origin,
    isCrossOrigin,
    isProduction
  });
  
  res.cookie("token", signedToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  let userObj = user.toObject();
  delete userObj.password;
  userObj.id = userObj._id;

  res.status(200).json({ message: "login success", payload: userObj });
});

//Route for Logout
commonApp.get("/logout", (req, res) => {
  //delete token from cookie storage
  const origin = req.get('origin');
  const isCrossOrigin = origin && (
    origin.includes('vercel.app') || 
    origin.includes('render.com') || 
    origin !== `http://localhost:${process.env.PORT || 4000}`
  );
  const isProduction = process.env.NODE_ENV === 'production' || isCrossOrigin;
  
  console.log('Logout environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    RENDER: process.env.RENDER,
    origin,
    isCrossOrigin,
    isProduction
  });
  
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  //send res
  res.status(200).json({ message: "Logout success" });
});

//Page refresh
commonApp.get(
  "/check-auth",
  async (req, res) => {
    try {
      console.log('Check-auth request:', {
        cookies: req.cookies,
        hasToken: !!req.cookies?.token,
        origin: req.get('origin'),
        NODE_ENV: process.env.NODE_ENV,
        RENDER: process.env.RENDER
      });

      const token = req.cookies?.token;
      if (!token) {
        console.log('No token found in cookies');
        return res.status(200).json({ isAuthenticated: false });
      }

      const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
      const dbUser = await UserModel.findById(decodedToken.id).select("-password");
      if (!dbUser || !dbUser.isUserActive) {
        console.log('User not found or inactive:', decodedToken.id);
        return res.status(200).json({ isAuthenticated: false });
      }

      let userObj = dbUser.toObject();
      userObj.id = userObj._id;

      console.log('User authenticated successfully:', userObj.email);
      res.status(200).json({
        isAuthenticated: true,
        message: "authenticated",
        payload: userObj,
      });
    } catch (err) {
      console.log('Check-auth error:', err.message);
      res.status(200).json({ isAuthenticated: false });
    }
  },
);

//Change password
commonApp.put(
  "/password",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Current and new password are required" });
      }
      if (currentPassword === newPassword) {
        return res
          .status(400)
          .json({ message: "New password must be different" });
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatched = await compare(currentPassword, user.password);
      if (!isMatched) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      user.password = await hash(newPassword, 12);
      await user.save();
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  },
);