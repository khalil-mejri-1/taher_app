const express = require("express");
const router = express.Router();
const Week = require("../models/Week");
const Student = require("../models/Student");

// Get all saved weeks
router.get("/", async (req, res) => {
  try {
    const weeks = await Week.find().sort({ startDate: -1 });
    res.json(weeks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a week and reset students attendance
router.post("/save-and-reset", async (req, res) => {
  const { startDate, finishedSessions } = req.body;
  
  try {
    // 1. Get all students to save their current week state
    const students = await Student.find({ isArchived: false });
    
    // 2. Create the week record
    const records = students.map(s => ({
      studentId: s._id,
      studentName: s.name,
      attendance: s.attendance || []
    }));

    const newWeek = new Week({
      startDate,
      records,
      finishedSessions
    });

    await newWeek.save();

    // 3. Reset attendance for ALL students
    await Student.updateMany({}, { $set: { attendance: [] } });

    res.status(201).json({ message: "Week saved and attendance reset successfully", week: newWeek });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a week
router.delete("/:id", async (req, res) => {
  try {
    await Week.findByIdAndDelete(req.params.id);
    res.json({ message: "Week deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
