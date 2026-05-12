import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { UserModel } from "../models/UserModel.js";

const { verify } = jwt;

config();

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // get token from cookies
      const token = req.cookies?.token;

      console.log("token from cookies:", token);

      // if token missing
      if (!token) {
        return res.status(401).json({
          message: "Please login first",
        });
      }

      // verify token
      const decodedToken = verify(
        token,
        process.env.SECRET_KEY
      );

      console.log("decoded token:", decodedToken);
      console.log("allowed roles:", allowedRoles);

      // role check
      if (!allowedRoles.includes(decodedToken.role)) {
        console.log("role mismatch");
        
        return res.status(403).json({
          message: "You are not authorized",
        });
      }

      // find user in DB
      const dbUser = await UserModel.findById(
        decodedToken.id
      ).select("role isUserActive");

      console.log("db user:", dbUser);

      // if user not found
      if (!dbUser) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      // if blocked
      if (!dbUser.isUserActive) {
        return res.status(403).json({
          message: "Your account is blocked",
        });
      }

      // attach user
      req.user = decodedToken;

      next();
    } catch (err) {
      console.log("verify token error:", err);

      res.status(401).json({
        message: "Invalid token",
      });
    }
  };
};