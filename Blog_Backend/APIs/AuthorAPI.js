import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/VerifyToken.js";

export const authorApp = exp.Router();


// WRITE ARTICLE
authorApp.post(
  "/article",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const articleObj = req.body;

      const user = req.user;

      // Check author
      const author = await UserModel.findById(articleObj.author);

      if (!author) {
        return res.status(404).json({
          message: "Invalid author",
        });
      }

      // Verify logged-in author
      if (author.email !== user.email) {
        return res.status(403).json({
          message: "You are not authorized",
        });
      }

      // Create article
      const articleDoc = new ArticleModel(articleObj);

      await articleDoc.save();

      res.status(201).json({
        message: "Article published successfully",
        payload: articleDoc,
      });
    } catch (err) {
      next(err);
    }
  },
);


// READ OWN ARTICLES
authorApp.get(
  "/articles",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const authorIdOfToken = req.user?.id;

      const articlesList = await ArticleModel.find({
        author: authorIdOfToken,
      });

      res.status(200).json({
        message: "Articles",
        payload: articlesList,
      });
    } catch (err) {
      next(err);
    }
  },
);


// EDIT ARTICLE
authorApp.put(
  "/article",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const authorIdOfToken = req.user?.id;

      const { articleId, title, category, content } = req.body;

      const modifiedArticle = await ArticleModel.findOneAndUpdate(
        {
          _id: articleId,
          author: authorIdOfToken,
        },
        {
          $set: {
            title,
            category,
            content,
          },
        },
        { new: true },
      );

      if (!modifiedArticle) {
        return res.status(403).json({
          message: "Not authorized to edit article",
        });
      }

      res.status(200).json({
        message: "Article modified",
        payload: modifiedArticle,
      });
    } catch (err) {
      next(err);
    }
  },
);


// DELETE ARTICLE (SOFT DELETE)
authorApp.patch(
  "/article",
  verifyToken("AUTHOR"),
  async (req, res, next) => {
    try {
      const authorIdOfToken = req.user?.id;

      const { articleId, isArticleActive } = req.body;

      const articleOfDB = await ArticleModel.findOne({
        _id: articleId,
        author: authorIdOfToken,
      });

      if (!articleOfDB) {
        return res.status(404).json({
          message: "Article not found",
        });
      }

      if (isArticleActive === articleOfDB.isArticleActive) {
        return res.status(200).json({
          message: "Article already in same state",
        });
      }

      articleOfDB.isArticleActive = isArticleActive;

      await articleOfDB.save();

      res.status(200).json({
        message: "Article modified",
        payload: articleOfDB,
      });
    } catch (err) {
      next(err);
    }
  },
);