const mongoose = require('mongoose');
const Student = require('./server/models/Student');
require('dotenv').config();

const legacyMapping = {};

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/taher_app";

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const students = await Student.find({});
    console.log(`Found ${students.length} students`);

    for (const student of students) {
      const name = student.name?.toUpperCase().trim();
      const info = legacyMapping[name];
      
      if (info) {
        console.log(`Migrating ${student.name}...`);
        
        const legacyCount = info.start || 0;
        const totalSessionsCount = legacyCount + (student.cycleHistory?.length || 0);
        
        let paidSessionsCount = student.paidSessionsCount || 0;
        if (info.paid) {
          // If they have legacy paid sessions, we add them to the existing count
          // Wait! Usually legacy paid is the TOTAL paid in the past.
          // In my previous if-else: finalPaidCount = info.paid + student.paidSessionsCount
          // So we should update students.paidSessionsCount to include info.paid
          paidSessionsCount += info.paid;
        }

        await Student.findByIdAndUpdate(student._id, {
          legacyCount: legacyCount,
          totalSessionsCount: totalSessionsCount,
          paidSessionsCount: paidSessionsCount
        });
      }
    }

    console.log("Migration completed");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
