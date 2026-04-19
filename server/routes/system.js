const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Week = require("../models/Week");
const Config = require("../models/Config");

// Get a config value
router.get("/config/:key", async (req, res) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    res.json(config ? config.value : null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set a config value
router.post("/config", async (req, res) => {
  const { key, value } = req.body;
  try {
    const config = await Config.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json(config);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Reset Progress (Keep Students)
router.post("/reset-sessions", async (req, res) => {
  try {
    await Student.updateMany({}, {
      $set: {
        attendance: [],
        cycleHistory: [],
        paidSessionsCount: 0,
        totalSessionsCount: 0,
        paidMonths: [],
        totalMoneyPaid: 0,
        paymentStatus: "Non Payer / لم يدفع بعد"
      }
    });

    await Week.deleteMany({});
    res.json({ message: "Toutes les sessions et la progression ont été réinitialisées." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete EVERYTHING
router.delete("/reset-all", async (req, res) => {
  try {
    await Student.deleteMany({});
    await Week.deleteMany({});
    res.json({ message: "Système réinitialisé avec succès (Tous les étudiants et l'historique ont été supprimés)." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
