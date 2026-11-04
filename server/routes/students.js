const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();

    // Auto-migrate students with existing totalMoneyPaid but empty payments
    const bulkOps = [];
    students.forEach(student => {
      if ((student.totalMoneyPaid || 0) > 0 && (!student.payments || student.payments.length === 0)) {
        const initialPayment = {
          date: student.inscriptionDate || student.createdAt || new Date(),
          amount: student.totalMoneyPaid,
          type: student.paymentStatus && student.paymentStatus.includes('Partiel') ? "Paiement Partiel / خلاص جزئي" : "Frais d'inscription / تسجيل",
          note: "Paiement initial enregistré",
          month: (student.paidMonths && student.paidMonths.length > 0) ? student.paidMonths[0] : 1
        };
        student.payments = [initialPayment];
        bulkOps.push({
          updateOne: {
            filter: { _id: student._id },
            update: { $set: { payments: [initialPayment] } }
          }
        });
      }
    });

    if (bulkOps.length > 0) {
      Student.bulkWrite(bulkOps).catch(e => console.error("Auto-migration payments error:", e));
    }

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

// Add a payment transaction to a student
router.post("/:id/payments", async (req, res) => {
  try {
    const { amount, date, type, note, month } = req.body;
    const numAmount = Number(amount) || 0;
    const paymentDate = date ? new Date(date) : new Date();

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const newPayment = {
      date: paymentDate,
      amount: numAmount,
      type: type || "Paiement Mensuel / خلاص شهري",
      note: note || "",
      month: month ? Number(month) : undefined
    };

    if (!student.payments) student.payments = [];
    student.payments.push(newPayment);
    student.totalMoneyPaid = (student.totalMoneyPaid || 0) + numAmount;

    // Auto-update paidSessionsCount if appropriate
    const maxSessions = (student.planning?.dimanche?.unique && !student.planning?.mardi?.matin) ? 5 : 8;
    const sessionCost = (student.tarif || 80) / maxSessions;
    if (sessionCost > 0) {
      const addedSessions = Math.round(numAmount / sessionCost);
      student.paidSessionsCount = (student.paidSessionsCount || 0) + addedSessions;
    }

    if (month && (!student.paidMonths || !student.paidMonths.includes(Number(month)))) {
      student.paidMonths = [...(student.paidMonths || []), Number(month)];
    }

    // Auto-update paymentStatus
    if ((student.paidSessionsCount || 0) >= (student.totalSessionsCount || 0)) {
      student.paymentStatus = "Payer / تم الخلاص";
    }

    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a payment transaction from a student
router.delete("/:id/payments/:paymentId", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const paymentIndex = student.payments.findIndex(p => p._id.toString() === req.params.paymentId);
    if (paymentIndex === -1) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const removedPayment = student.payments[paymentIndex];
    student.payments.splice(paymentIndex, 1);
    student.totalMoneyPaid = Math.max(0, (student.totalMoneyPaid || 0) - (removedPayment.amount || 0));

    // Deduct sessions
    const maxSessions = (student.planning?.dimanche?.unique && !student.planning?.mardi?.matin) ? 5 : 8;
    const sessionCost = (student.tarif || 80) / maxSessions;
    if (sessionCost > 0 && removedPayment.amount) {
      const removedSessions = Math.round(removedPayment.amount / sessionCost);
      student.paidSessionsCount = Math.max(0, (student.paidSessionsCount || 0) - removedSessions);
    }

    if (removedPayment.month && student.paidMonths) {
      student.paidMonths = student.paidMonths.filter(m => m !== removedPayment.month);
    }

    if ((student.totalSessionsCount || 0) > (student.paidSessionsCount || 0)) {
      student.paymentStatus = "Non Payer / لم يدفع بعد";
    }

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
