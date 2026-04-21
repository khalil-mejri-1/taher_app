const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a student
router.post("/", async (req, res) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a student
router.put("/:id", async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Batch update attendance
router.post("/batch-attendance", async (req, res) => {
  const { updates } = req.body; // Array of { id, attendance, cycle }
  try {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { 
          $set: { 
            attendance: update.attendance,
            cycle: update.cycle
          } 
        }
      }
    }));
    await Student.bulkWrite(bulkOps);
    res.json({ message: "Attendance updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Finish or Undo session for all relevant students
router.post("/finish-session", async (req, res) => {
  const { sessionKey, sessionDate, isUndo, studentIds } = req.body;
  const day = sessionKey.split('_')[0];
  const sessionType = sessionKey.split('_')[1];

  try {
    // Find relevant students
    const query = { [`planning.${day}.${sessionType}`]: true };
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      query._id = { $in: studentIds };
    }
    
    const students = await Student.find(query);

    const bulkOps = students.map(student => {
      let newHistory = [...(student.cycleHistory || [])];
      let newTotalCount = student.totalSessionsCount || 0;
      let newCompleted = student.cycle?.completed || 0;

      if (isUndo) {
        const initialCount = newHistory.length;
        const entriesToRemove = newHistory.filter(h =>
          h.session === sessionKey && new Date(h.date).toISOString().split('T')[0] === new Date(sessionDate).toISOString().split('T')[0]
        );

        if (entriesToRemove.length > 0) {
          newHistory = newHistory.filter(h =>
            !(h.session === sessionKey && new Date(h.date).toISOString().split('T')[0] === new Date(sessionDate).toISOString().split('T')[0])
          );
          const removedCount = initialCount - newHistory.length;
          newTotalCount = Math.max(0, newTotalCount - removedCount);
          
          entriesToRemove.forEach(removed => {
            if (["present", "attended", "compensated", "payer"].includes(removed.type)) {
              newCompleted = Math.max(0, newCompleted - 1);
            }
          });
        }
      } else {
        // Normal Finish
        // Check if already in history for this session/date to avoid duplicates
        const exists = newHistory.some(h => 
          h.session === sessionKey && new Date(h.date).toISOString().split('T')[0] === new Date(sessionDate).toISOString().split('T')[0]
        );
        
        if (!exists) {
          // Check current attendance record
          const isPresent = student.attendance?.some(a => 
            a.session === sessionKey && a.present && new Date(a.date).toISOString().split('T')[0] === new Date(sessionDate).toISOString().split('T')[0]
          );

          newHistory.push({
            session: sessionKey,
            date: sessionDate,
            type: isPresent ? 'present' : 'absent'
          });
          newTotalCount = newTotalCount + 1;
          // Note: we don't increment newCompleted here because the checkbox in the UI already did it
        }
      }

      return {
        updateOne: {
          filter: { _id: student._id },
          update: {
            $set: {
              cycleHistory: newHistory,
              totalSessionsCount: newTotalCount,
              "cycle.completed": newCompleted
            }
          }
        }
      };
    });

    if (bulkOps.length > 0) {
      await Student.bulkWrite(bulkOps);
    }
    res.json({ message: "Session update successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a student
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
