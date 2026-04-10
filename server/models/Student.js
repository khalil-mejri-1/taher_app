const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  inscriptionDate: { type: Date, default: Date.now },
  tarif: { type: Number, required: true },
  paymentStatus: { type: String, default: "Non Payer" },
  idCardImage: { type: String }, // URL or Base64
  status: { type: String, enum: ["Actif", "En attente"], default: "Actif" },
  isArchived: { type: Boolean, default: false },
  planning: {
    mardi: { matin: Boolean },
    mercredi: { matin: Boolean, amidi: Boolean },
    samedi: { matin: Boolean, amidi: Boolean },
    dimanche: { unique: Boolean }
  },
  cycleHistory: [
    {
      session: String,
      date: Date,
      type: { type: String, enum: ["present", "absent", "compensated"] }
    }
  ],
  attendance: [
    {
      date: Date,
      session: String, // e.g., "mardi_matin"
      present: Boolean
    }
  ],
  notes: { type: String, default: "" },
  paidSessionsCount: { type: Number, default: 0 },
  totalSessionsCount: { type: Number, default: 0 },
  paidMonths: { type: [Number], default: [] },
  historyOverrides: { type: Object, default: {} },
  totalMoneyPaid: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Student", StudentSchema);
