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
    console.log("Planning:", JSON.stringify(student.planning, null, 2));
    console.log("Attendance:", JSON.stringify(student.attendance, null, 2));
    console.log("CycleHistory length:", student.cycleHistory ? student.cycleHistory.length : 0);
  } else {
    console.log("Student not found");
  }
  process.exit(0);
}

check();
