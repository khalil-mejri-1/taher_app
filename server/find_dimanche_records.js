const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    name: String,
    cycleHistory: Array,
}, { strict: false });

const Student = mongoose.model('Student', studentSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const sessionKey = 'dimanche_unique';
        const students = await Student.find({ 'cycleHistory.session': sessionKey });

        console.log(`Checking ${students.length} students with Dimanche history...`);

        for (const student of students) {
            const matches = student.cycleHistory.filter(h => h.session === sessionKey);
            matches.forEach(h => {
                console.log(`Student: ${student.name} | Date: ${h.date} | Session: ${h.session}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
