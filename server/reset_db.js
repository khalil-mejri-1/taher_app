const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://2cpatron_db_user:jBLtbsqZmkaxOmuy@cluster0.2ottrnd.mongodb.net/bd_taher?retryWrites=true&w=majority";

const StudentSchema = new mongoose.Schema({}, { strict: false });
const Student = mongoose.model("Student", StudentSchema);

async function resetDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const result = await Student.updateMany({}, {
      $set: {
        cycleHistory: [],
        attendance: [],
        paidSessionsCount: 0,
        totalSessionsCount: 0,
        paidMonths: [],
        historyOverrides: {},
        totalMoneyPaid: 0,
        paymentStatus: "Non Payer / لم يدفع بعد"
      }
    });

    console.log(`Successfully reset ${result.modifiedCount} students!`);
    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (err) {
    console.error("Error resetting DB:", err);
  }
}

resetDB();
