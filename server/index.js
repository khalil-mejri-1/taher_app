require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

app.get("/", (req, res) => {
    res.send("Server is running... 🚀");
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;