require('dotenv').config();
const mongoose = require('mongoose');

// Inline schema to override phone required constraint
const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' }, // Not required in seed
  inscriptionDate: { type: Date, default: Date.now },
  tarif: { type: Number, required: true },
  paymentStatus: { type: String, default: "Non Payer" },
  status: { type: String, default: "Actif" },
  isArchived: { type: Boolean, default: false },
  planning: {
    mardi: { matin: Boolean },
    mercredi: { matin: Boolean, amidi: Boolean },
    samedi: { matin: Boolean, amidi: Boolean },
    dimanche: { unique: Boolean }
  },
  cycleHistory: [{ session: String, date: Date, type: String }],
  attendance: [{ date: Date, session: String, present: Boolean }],
  notes: { type: String, default: "" },
  paidSessionsCount: { type: Number, default: 0 },
  totalSessionsCount: { type: Number, default: 0 },
  paidMonths: { type: [Number], default: [] },
  totalMoneyPaid: { type: Number, default: 0 }
}, { timestamps: true });

const Student = mongoose.model('Student', StudentSchema);

const MONGODB_URI = process.env.MONGODB_URI;

// Day abbreviation to planning field mapping
const parseSchedule = (schedule) => {
  const planning = {
    mardi:    { matin: false },
    mercredi: { matin: false, amidi: false },
    samedi:   { matin: false, amidi: false },
    dimanche: { unique: false }
  };

  const parts = schedule.split(' - ').map(s => s.trim());
  for (const part of parts) {
    switch (part) {
      case 'tue_m': planning.mardi.matin = true; break;
      case 'wed_m': planning.mercredi.matin = true; break;
      case 'wed_a': planning.mercredi.amidi = true; break;
      case 'sat_m': planning.samedi.matin = true; break;
      case 'sat_a': planning.samedi.amidi = true; break;
      case 'sun_m': planning.dimanche.unique = true; break;
    }
  }
  return planning;
};

const rawStudents = [];

const students = rawStudents.map(s => ({
  name: s.name,
  phone: s.phone,
  tarif: s.tarif,
  status: 'Actif',
  isArchived: false,
  paymentStatus: 'Non Payer / لم يدفع بعد',
  planning: parseSchedule(s.schedule),
  paidSessionsCount: 0,
  totalSessionsCount: 0,
  paidMonths: [],
  totalMoneyPaid: 0,
  attendance: [],
  cycleHistory: [],
  notes: ''
}));

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const result = await Student.insertMany(students);
    console.log(`✅ Successfully inserted ${result.length} students!`);
    
    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seed();
