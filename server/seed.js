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

const rawStudents = [
  { name: "ARIJ MNASRI", phone: "95107003", schedule: "wed_a - sat_a", tarif: 100 },
  { name: "NESRINE NAFATI", phone: "20718716", schedule: "sun_m", tarif: 100 },
  { name: "ZINA MASSOUDI", phone: "24118608", schedule: "wed_m - wed_a", tarif: 100 },
  { name: "MARWA HENTATI", phone: "29833550", schedule: "sun_m", tarif: 100 },
  { name: "MARIEM TRABELSI", phone: "29833550", schedule: "sun_m", tarif: 140 },
  { name: "ARBIA HARATHI", phone: "55385240", schedule: "sun_m", tarif: 100 },
  { name: "MANEL YOUSFI", phone: "44165037", schedule: "sun_m", tarif: 100 },
  { name: "EMNA KOUBAA", phone: "25071880", schedule: "sun_m", tarif: 100 },
  { name: "AICHA HERCHI", phone: "92786994", schedule: "sun_m", tarif: 100 },
  { name: "ASMA NEJI", phone: "26036666", schedule: "wed_m - wed_a", tarif: 80 },
  { name: "CHAHINEZ MEJDOUB", phone: "51966655", schedule: "tue_m - wed_m", tarif: 110 },
  { name: "HANEN BAHLOUL", phone: "54554326", schedule: "wed_m - wed_a", tarif: 100 },
  { name: "AFEF AMARA", phone: "56391964", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "HANEN ELAYBA", phone: "26790141", schedule: "tue_m - wed_m", tarif: 100 },
  { name: "DHEKRA GHLISSI", phone: "21263306", schedule: "wed_m - wed_a", tarif: 150 },
  { name: "NADA CHIHA", phone: "54539843", schedule: "tue_m - wed_m", tarif: 100 },
  { name: "OMAYMA HLELI", phone: "92903006", schedule: "tue_m - wed_m", tarif: 150 },
  { name: "MOUNA DRIRA", phone: "53892089", schedule: "wed_m - sat_m", tarif: 140 },
  { name: "ZAYNEB NSIRI", phone: "20525279", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "EMNA GHODHBEN", phone: "44711748", schedule: "sun_m", tarif: 140 },
  { name: "MANEL HARCHI", phone: "24900048", schedule: "sun_m", tarif: 100 },
  { name: "MALEK KEMEL", phone: "20949813", schedule: "sun_m", tarif: 110 },
  { name: "IMEN SAFI", phone: "26082196", schedule: "sun_m", tarif: 110 },
  { name: "YOSRA BEN ALI", phone: "54354293", schedule: "sun_m", tarif: 110 },
  { name: "HANA BRLGHITH", phone: "25784749", schedule: "sun_m", tarif: 100 },
  { name: "NESRINE DRADRA", phone: "23983814", schedule: "sun_m", tarif: 110 },
  { name: "EMNA LWETTI", phone: "22330870", schedule: "sun_m", tarif: 100 },
  { name: "OMAYMA HMIDET", phone: "92386665", schedule: "sun_m", tarif: 100 },
  { name: "RIHAB BOUALI", phone: "23181643", schedule: "sun_m", tarif: 100 },
  { name: "RAWAA BOUZIDI", phone: "44227937", schedule: "sun_m", tarif: 100 },
  { name: "BASSMA HAMDEWI", phone: "26555171", schedule: "sun_m", tarif: 140 },
  { name: "WIDED AHMER", phone: "55674431", schedule: "sun_m", tarif: 100 },
  { name: "MALEK MKAWAR", phone: "28299141", schedule: "sun_m", tarif: 140 },
  { name: "RIM NASRI", phone: "58881648", schedule: "sun_m", tarif: 100 },
  { name: "RIM HIDRI", phone: "25413797", schedule: "sun_m", tarif: 100 },
  { name: "RIHAB BOUHLEL", phone: "99407726", schedule: "sun_m", tarif: 100 },
  { name: "HALIMA CHMISSI", phone: "94285408", schedule: "wed_m - wed_a", tarif: 100 },
  { name: "MARIEM HAMROUNI", phone: "53754102", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "MARIEM CHAWI", phone: "46990799", schedule: "wed_m - sat_m", tarif: 100 },
  { name: "MARIEM BOUJELBEN", phone: "24840439", schedule: "wed_m - wed_a", tarif: 100 },
  { name: "MARIEM ALLOUCH", phone: "96835250", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "MANEL KESKES", phone: "55802910", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "MAISSA MALLEK", phone: "97824710", schedule: "tue_m - wed_a", tarif: 100 },
  { name: "MAISSA FOURATI", phone: "51397285", schedule: "wed_a - sat_a", tarif: 100 },
  { name: "HIBA ALLAH CHALBI", phone: "52760619", schedule: "tue_m - wed_m", tarif: 100 },
  { name: "MARIEM ZOUARI", phone: "50367602", schedule: "tue_m - wed_m", tarif: 100 },
  { name: "HAJER NAJI", phone: "27450951", schedule: "tue_m - wed_m", tarif: 100 },
  { name: "GHADA GHAMGI", phone: "99817052", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "FATMA BEN AYED", phone: "22824291", schedule: "tue_m - wed_m", tarif: 100 },
  { name: "EMNA ABYADH", phone: "56636692", schedule: "wed_a - sat_m", tarif: 100 },
  { name: "DALEL BOULILA", phone: "51535777", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "CHAYMA AYDI", phone: "93401041", schedule: "wed_m - wed_a - sat_m - sat_a", tarif: 100 },
  { name: "AMENI TWETI", phone: "29059097", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "SIHEM SALAH", phone: "", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "EMNA AKROUT", phone: "58732073", schedule: "tue_m - wed_a", tarif: 100 },
  { name: "YASSMINE SWUISSI", phone: "22172550", schedule: "wed_m - wed_a", tarif: 140 },
  { name: "WAFA HAMEDI", phone: "53067215", schedule: "wed_m - sat_m", tarif: 140 },
  { name: "SOUHIR GOMRI", phone: "54772209", schedule: "tue_m - wed_a", tarif: 140 },
  { name: "SOUAD HAMZA", phone: "20056491", schedule: "tue_m - wed_m", tarif: 140 },
  { name: "SALSABIL HENI", phone: "28416658", schedule: "tue_m - sat_m", tarif: 100 },
  { name: "ISLEM FOURATI", phone: "20829956", schedule: "tue_m - wed_a", tarif: 100 },
  { name: "YASSMINE GUIDARA", phone: "55911639", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "OMAYMA BEN NASSER", phone: "26255554", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "ABIR BEN MAHMOD", phone: "23757188", schedule: "wed_m - wed_a", tarif: 100 },
  { name: "EYA ABIDA", phone: "44906999", schedule: "tue_m - sat_m", tarif: 100 },
  { name: "MAYSSAM BOULILA", phone: "56377920", schedule: "tue_m - wed_m", tarif: 100 },
  { name: "AMENI KARWI", phone: "44567989", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "EYA NAES", phone: "28639807", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "RIHEM HAMDI", phone: "28880938", schedule: "sat_m - sat_a", tarif: 100 },
  { name: "RAWYA CHTOUROU", phone: "29208112", schedule: "tue_m - sat_m", tarif: 100 },
  { name: "RANIA KTATA", phone: "29208112", schedule: "tue_m - sat_m", tarif: 100 },
  { name: "NOUR MWELHI", phone: "53754102", schedule: "sat_m - sat_a", tarif: 100 }
];

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
