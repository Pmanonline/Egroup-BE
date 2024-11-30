const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db.config");
const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");
const Routes = require("./routes/route.js");
const UserRoutes = require("./routes/userRoutes.js");
const PostsRoutes = require("./routes/postRoutes.js");
const authorRoutes = require("./routes/authorRoutes.js");
const commentRoutes = require("./routes/commentRoutes.js");
const groupRoutes = require("./routes/groupRoute.js");

dotenv.config();
connectDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  })
);

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // Explicitly set to false
};

// 2. Basic middleware
app.use(cors(corsOptions));
app.options("*", cors());
app.use(errorHandlingMiddleware);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  })
);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/insertImage", express.static(path.join(__dirname, "insertImage")));

app.use("/api", Routes);
app.use("/api", UserRoutes);
app.use("/api", PostsRoutes);
app.use("/api", authorRoutes);
app.use("/api", commentRoutes);
app.use("/api", groupRoutes);

// Server startup
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Rejection:", err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
