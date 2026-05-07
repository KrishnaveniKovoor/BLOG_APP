import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";
export const adminApp = exp.Router();

// Get all managed accounts (users and authors)
adminApp.get("/users", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const users = await UserModel.find({ role: { $in: ["USER", "AUTHOR","ADMIN"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    const stats = {
      totalAccounts: users.length,
      totalUsers: users.filter((user) => user.role === "USER").length,
      totalAuthors: users.filter((user) => user.role === "AUTHOR").length,
      activeAccounts: users.filter((user) => user.isUserActive).length,
      blockedAccounts: users.filter((user) => !user.isUserActive).length,
    };

    res
      .status(200)
      .json({ message: "Managed accounts", payload: { users, stats } });
  } catch (err) {
    next(err);
  }
});

// Block or unblock a user/author account
adminApp.patch(
  "/users/:userId/status",
  verifyToken("ADMIN"),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { isUserActive } = req.body;

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role === "ADMIN") {
        return res
          .status(403)
          .json({ message: "Cannot modify admin account status" });
      }

      user.isUserActive = Boolean(isUserActive);
      await user.save();

      res
        .status(200)
        .json({ message: "Account status updated", payload: user });
    } catch (err) {
      next(err);
    }
  },
);

// Admin dashboard stats
adminApp.get("/dashboard", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const users = await UserModel.countDocuments({ role: "USER" });
    const authors = await UserModel.countDocuments({ role: "AUTHOR" });
    const blocked = await UserModel.countDocuments({
      role: { $in: ["USER", "AUTHOR"] },
      isUserActive: false,
    });
    const articles = await ArticleModel.countDocuments();

    res.status(200).json({
      message: "Admin dashboard stats",
      payload: { users, authors, blocked, articles },
    });
  } catch (err) {
    next(err);
  }
});