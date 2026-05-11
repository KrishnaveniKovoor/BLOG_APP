import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { UserModel } from "../models/UserModel.js";

const { verify } = jwt;

config();

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.token;

      if (!token) {
        return res.status(401).json({ message: "Please login first" });
      }

      const decodedToken = verify(token, process.env.SECRET_KEY);

      if (!allowedRoles.includes(decodedToken.role)) {
        return res.status(403).json({ message: "You are not authorized" });
      }

      const dbUser = await UserModel.findById(decodedToken.id).select(
        "role isUserActive"
      );

      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!dbUser.isUserActive) {
        return res.status(403).json({ message: "Your account is blocked" });
      }

      req.user = decodedToken;

      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};