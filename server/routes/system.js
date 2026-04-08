const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Week = require("../models/Week");

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
