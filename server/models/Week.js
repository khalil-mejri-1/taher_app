const mongoose = require("mongoose");

const WeekSchema = new mongoose.Schema({
  startDate: { type: Date, required: true }, // The Tuesday date that identifies the week
  records: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      studentName: String,
      attendance: Array, // Snapshot of student's attendance for this week
    }
  ],
  finishedSessions: [String], // Snapshot of which sessions were finished
}, { timestamps: true });

module.exports = mongoose.model("Week", WeekSchema);

