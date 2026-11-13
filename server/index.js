const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, '.env') });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Cached MongoDB Connection for Serverless (Vercel) & Local
let cachedDbPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!cachedDbPromise) {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not defined");
        }

        cachedDbPromise = mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 8000,
        }).catch(err => {
            cachedDbPromise = null;
            throw err;
        });
    }

    return cachedDbPromise;
};

// Immediate background connect
connectDB()
    .then(() => console.log("✅ Connected to MongoDB Successfully"))
    .catch((err) => console.error("❌ MongoDB Initial Connection Error:", err.message));

// Middleware to ensure DB connection on every request before executing routes
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("❌ MongoDB Connection Middleware Error:", err);
        res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

// Routes
app.use("/api/students", require("./routes/students"));
app.use("/api/weeks", require("./routes/weeks"));
app.use("/api/system", require("./routes/system"));

// Root endpoint for backend health/status check
app.get("/", (req, res) => {
    res.send("server run taher 11/13");
});

// Serve React App (Vite build folder: dist) if available, otherwise fallback to "server run"
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get(/.*/, (req, res) => {
        const indexPath = path.join(clientDistPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.send("server run");
        }
    });
} else {
    app.get(/.*/, (req, res) => {
        res.send("server run");
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;