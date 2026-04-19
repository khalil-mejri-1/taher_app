const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    attendance: Array,
    cycleHistory: Array,
    totalSessionsCount: Number
}, { strict: false });

const configSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed
});

const Student = mongoose.model('Student', studentSchema);
const Config = mongoose.model('Config', configSchema);

const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getUTCFullYear() === date2.getUTCFullYear() &&
           date1.getUTCMonth() === date2.getUTCMonth() &&
           date1.getUTCDate() === date2.getUTCDate();
};

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const sessionKey = 'dimanche_unique';
        const targetDate = new Date('2026-04-19');

        // 1. Clear finishedSessions config
        const config = await Config.findOne({ key: 'finishedSessions' });
        if (config && Array.isArray(config.value)) {
            const newValue = config.value.filter(k => k !== sessionKey);
            config.value = newValue;
            await config.save();
            console.log('Removed Dimanche from finishedSessions config');
        }

        // 2. Update Students
        const students = await Student.find({
            $or: [
                { 'attendance.session': sessionKey },
                { 'cycleHistory.session': sessionKey }
            ]
        });

        console.log(`Scanning ${students.length} students...`);

        let updatedCount = 0;
        for (const student of students) {
            let changed = false;

            // Clear unsaved attendance
            const oldAttLen = student.attendance?.length || 0;
            const newAttendance = (student.attendance || []).filter(a => a.session !== sessionKey);
            if (newAttendance.length < oldAttLen) {
                student.attendance = newAttendance;
                changed = true;
                console.log(`Cleared unsaved attendance for ${student.name}`);
            }

            // Clear persistent history
            const oldHistLen = student.cycleHistory?.length || 0;
            const newHistory = (student.cycleHistory || []).filter(h => {
                const hDate = new Date(h.date);
                const sameDay = isSameDay(hDate, targetDate);
                const sameSession = h.session === sessionKey;
                return !(sameDay && sameSession);
            });

            if (newHistory.length < oldHistLen) {
                const removedCount = oldHistLen - newHistory.length;
                student.cycleHistory = newHistory;
                student.totalSessionsCount = Math.max(0, (student.totalSessionsCount || 0) - removedCount);
                changed = true;
                console.log(`Removed ${removedCount} history entries for ${student.name}`);
            }

            if (changed) {
                await student.save();
                updatedCount++;
            }
        }

        console.log(`Done. Updated ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
