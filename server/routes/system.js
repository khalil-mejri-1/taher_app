const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Week = require("../models/Week");

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
