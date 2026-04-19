const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    name: String,
    planning: Object,
    cycleHistory: Array,
    totalSessionsCount: Number,
    cycle: Object,
    isArchived: Boolean
}, { strict: false });

const systemConfigSchema = new mongoose.Schema({
    key: { type: String, unique: true },
    value: mongoose.Schema.Types.Mixed
});

const Student = mongoose.model('Student', studentSchema);
const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const sessionKey = 'dimanche_unique';
        const targetDateStr = '2026-04-19';
        const targetDate = new Date(targetDateStr);

        // 1. Remove from SystemConfig finishedSessions
        const config = await SystemConfig.findOne({ key: 'finishedSessions' });
        if (config && Array.isArray(config.value)) {
            const newValue = config.value.filter(k => k !== sessionKey);
            config.value = newValue;
            await config.save();
            console.log('Removed from finishedSessions config');
        }

        // 2. Update Students
        const students = await Student.find({
            'cycleHistory.date': { $gte: new Date('2026-04-18'), $lte: new Date('2026-04-20') }
        });

        console.log(`Found ${students.length} students with history around April 19`);

        let updatedCount = 0;
        for (const student of students) {
            const initialLen = student.cycleHistory.length;
            
            // Filter out entries matching both session and date
            const newHistory = student.cycleHistory.filter(h => {
                const hDate = new Date(h.date);
                const sameDay = hDate.getUTCFullYear() === targetDate.getUTCFullYear() &&
                              hDate.getUTCMonth() === targetDate.getUTCMonth() &&
                              hDate.getUTCDate() === targetDate.getUTCDate();
                const matchRange = hDate >= new Date('2026-04-18') && hDate <= new Date('2026-04-20');
                if (matchRange) {
                    console.log(`Student ${student.name} has entry on ${hDate.toISOString()} - Session: ${h.session}`);
                }
                
                return !(sameDay && sameSession);
            });

            if (newHistory.length < initialLen) {
                const removedCount = initialLen - newHistory.length;
                console.log(`Updating student ${student.name}: removed ${removedCount} entries`);
                
                student.cycleHistory = newHistory;
                student.totalSessionsCount = Math.max(0, (student.totalSessionsCount || 0) - removedCount);
                
                // Optional: revert cycle.completed if necessary, but handleFinishSession usually handles it.
                // For a manual fix, we just want the button to turn TERMINER (Green).
                
                await student.save();
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
