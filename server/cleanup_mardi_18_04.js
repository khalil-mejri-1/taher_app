const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const studentSchema = new mongoose.Schema({
    cycleHistory: Array,
    totalSessionsCount: Number,
    cycle: Object
}, { strict: false });

const Student = mongoose.model('Student', studentSchema);

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

        const sessionKey = 'mardi_matin';
        const targetDate = new Date('2026-04-18');

        const students = await Student.find({ 'cycleHistory.session': sessionKey });
        console.log(`Found ${students.length} students with Mardi history.`);

        let updatedCount = 0;
        for (const student of students) {
            const initialLen = student.cycleHistory.length;
            
            const entriesToRemove = student.cycleHistory.filter(h => 
                h.session === sessionKey && isSameDay(h.date, targetDate)
            );

            if (entriesToRemove.length > 0) {
                console.log(`Removing ${entriesToRemove.length} entries for ${student.name}`);
                
                const newHistory = student.cycleHistory.filter(h => 
                    !(h.session === sessionKey && isSameDay(h.date, targetDate))
                );

                const removedCount = initialLen - newHistory.length;
                student.cycleHistory = newHistory;
                student.totalSessionsCount = Math.max(0, (student.totalSessionsCount || 0) - removedCount);

                // Update cycle.completed if any removed entry was positive
                let completedReduction = 0;
                entriesToRemove.forEach(e => {
                    if (['present', 'attended', 'compensated', 'payer'].includes(e.type)) {
                        completedReduction++;
                    }
                });

                if (student.cycle && student.cycle.completed !== undefined) {
                    student.cycle.completed = Math.max(0, student.cycle.completed - completedReduction);
                    student.markModified('cycle');
                }

                await student.save();
                updatedCount++;
            }
        }

        console.log(`Successfully cleaned up ${updatedCount} students.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
