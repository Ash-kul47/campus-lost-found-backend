require("dotenv").config();

// ================================
// Core Packages
// ================================
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");


// ================================
// Configuration
// ================================
const connectDB = require("./config/db");
const passport = require("./config/passport");

// ================================
// Routes
// ================================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const claimRoutes = require("./routes/claimRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// ================================
// App Initialization
// ================================
const app = express();

connectDB();

app.set("view engine", "ejs");

// ================================
// Security Middleware
// ================================
app.use(helmet());

app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        message: "Too many requests. Please try again later."
    }
});

app.use(limiter);

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// ================================
// Body Parsing Middleware
// ================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// Session & Passport
// ================================
app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

// ================================
// Basic Routes
// ================================
app.get("/", (req, res) => {
    res.send("Lost & Found API Running");
});

app.get("/register-page", (req, res) => {
    res.render("register");
});

// ================================
// API Routes
// ================================
app.use("/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/items", itemRoutes);

app.use("/api/claims", claimRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/dashboard", dashboardRoutes);

// ================================
// Server
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
