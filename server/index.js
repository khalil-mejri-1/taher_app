require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/students", require("./routes/students"));
app.use("/api/weeks", require("./routes/weeks"));
app.use("/api/system", require("./routes/system"));

// Serve React App (Vite build folder: dist)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;