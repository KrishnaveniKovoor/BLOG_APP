import exp from "express";
import { config } from "dotenv";
import { connect } from "mongoose";
import { userApp } from "./APIs/UserAPI.js";
import { authorApp } from "./APIs/AuthorAPI.js";
import { adminApp } from "./APIs/AdminAPI.js";
import { commonApp } from "./APIs/CommonAPI.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config();

//create express app
const app = exp();

// ===== CORS CONFIGURATION =====
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const isDev = process.env.NODE_ENV !== "production";

const isAllowedVercelOrigin = (origin) => {
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
};

const isAllowedRenderOrigin = (origin) => {
  return /^https:\/\/[a-z0-9-]+\.onrender\.com$/.test(origin);
};

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin
      if (!origin) return callback(null, true);

      // allow localhost during development
      if (
        isDev &&
        (origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:"))
      ) {
        return callback(null, true);
      }

      // allow deployed frontend URLs
      if (
        allowedOrigins.includes(origin) ||
        isAllowedVercelOrigin(origin) ||
        isAllowedRenderOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS not allowed for ${origin}`));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//body parser middleware
app.use(exp.json());

//cookie parser middleware
app.use(cookieParser());

//path level middlewares
app.use("/user-api", userApp);
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);
app.use("/auth", commonApp);

//connect to db
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB server connected");

    //assign port
    const port = process.env.PORT || 4000;

    app.listen(port, () =>
      console.log(`server listening on ${port}..`)
    );
  } catch (err) {
    console.log("err in db connect", err);
  }
};

connectDB();

//invalid path handler
app.use((req, res, next) => {
  console.log(req.url);

  res.status(404).json({
    message: `path ${req.url} is invalid`,
  });
});

//global error handler
app.use((err, req, res, next) => {
  console.log("error is ", err);

  //ValidationError
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  //CastError
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "error occurred",
      error: err.message,
    });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;

  const keyValue =
    err.keyValue ??
    err.cause?.keyValue ??
    err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];

    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //server error
  res.status(500).json({
    message: "error occurred",
    error: err.stack || String(err),
  });
});