const mongoose = require('mongoose');

const uri = "mongodb+srv://2cpatron_db_user:jBLtbsqZmkaxOmuy@cluster0.2ottrnd.mongodb.net/bd_taher?retryWrites=true&w=majority";

const studentSchema = new mongoose.Schema({
  name: String,
  planning: Object,
  attendance: Array,
  cycleHistory: Array
}, { strict: false });

const Student = mongoose.model('Student', studentSchema);

async function check() {
  await mongoose.connect(uri);
  const student = await Student.findOne({ name: /ZINA MASSOUDI/i });
  if (student) {
    const recentHistory = student.cycleHistory.filter(h => new Date(h.date) >= new Date('2026-04-20'));
    console.log("Recent History:", JSON.stringify(recentHistory, null, 2));
  } else {
    console.log("Student not found");
  }
  process.exit(0);
}

check();
