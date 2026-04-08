import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import './RegistrationModal.css';

const RegistrationModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const initialFormState = {
    name: '',
    phone: '',
    inscriptionDate: new Date().toISOString().split('T')[0],
    tarif: '',
    paymentStatus: 'Non Payer / لم يدفع بعد',
    status: 'Actif',
    planning: {
      mardi: { matin: false },
      mercredi: { matin: false, amidi: false },
      samedi: { matin: false, amidi: false },
      dimanche: { unique: false }
    },
    totalMoneyPaid: 0
  };

  const [formData, setFormData] = useState(initialFormState);
  const [imageName, setImageName] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, idCardImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlanningChange = (day, session) => {
    setFormData(prev => ({
      ...prev,
      planning: {
        ...prev.planning,
        [day]: { ...prev.planning[day], [session]: !prev.planning[day][session] }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If status is "En attente", set isArchived to true
    const submissionData = {
      ...formData,
      isArchived: formData.status === 'En attente'
    };
    onSubmit(submissionData);
    setImageName('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? 'Modifier le Dossier' : 'Nouvelle Inscription'}</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <p className="modal-subtitle">
          {initialData ? 'Mettez à jour les informations de cet étudiant.' : 'Saisissez le nom complet et définissez les horaires prévus pour cet étudiant.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>NOM / الإسم</label>
              <input type="text" name="name" placeholder="Ex: Mariem Ben Youssef" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>TÉLÉPHONE / الهاتف</label>
              <input type="text" name="phone" placeholder="رقم الهاتف" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>DATE D'INSCRIPTION / التاريخ</label>
              <input type="date" name="inscriptionDate" value={formData.inscriptionDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>TARIF (DT) / الثمن</label>
              <input type="text" name="tarif" placeholder="Ex: 80" value={formData.tarif} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>ÉTAT DE PAIEMENT / حالة الدفع</label>
            <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
              <option value="Non Payer / لم يدفع بعد">Non Payer / لم يدفع بعد</option>
              <option value="Payer / تم الخلاص">Payer / تم الخلاص</option>
              <option value="Payer Partiellement / دفع جزئي">Payer Partiellement / دفع جزئي</option>
            </select>
          </div>

          {formData.paymentStatus === "Payer Partiellement / دفع جزئي" && (
            <div className="form-group animated-fade">
              <label>MONTANT PAYÉ / المبلغ المدفوع (DT)</label>
              <input
                type="number"
                name="totalMoneyPaid"
                placeholder="Ex: 40"
                value={formData.totalMoneyPaid}
                onChange={(e) => setFormData(prev => ({ ...prev, totalMoneyPaid: parseFloat(e.target.value) || 0 }))}
                onWheel={(e) => e.target.blur()}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>CARTE D'IDENTITÉ / بطاقة التعريف</label>
            <input
              type="file"
              id="idCard"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="idCard" className="upload-box">
              <Upload size={20} color="#d35400" />
              <span>{imageName || "Télécharger la photo de la carte"}</span>
            </label>
          </div>

          <div className="form-group">
            <label>STATUT DE DÉMARRAGE / حالة التسجيل</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="status" value="Actif" checked={formData.status === 'Actif'} onChange={handleChange} />
                <span className="radio-custom"></span>
                Actif (Directement au tableau)
              </label>
              <label className="radio-label">
                <input type="radio" name="status" value="Archives" checked={formData.status === 'Archives'} onChange={handleChange} />
                <span className="radio-custom"></span>
                ARCHIVER / تسجيل في الارشيف
              </label>
            </div>
          </div>

          <label className="planning-title">JOURS DE PRÉSENCE PRÉVUS (PLANNING)</label>
          <div className="planning-grid">
            <div className="planning-card">
              <h4>MARDI</h4>
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.planning.mardi.matin} onChange={() => handlePlanningChange('mardi', 'matin')} />
                <span className="checkbox-custom"></span> Matin
              </label>
            </div>
            <div className="planning-card">
              <h4>MERCREDI</h4>
              <div className="checkbox-stack">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.planning.mercredi.matin} onChange={() => handlePlanningChange('mercredi', 'matin')} />
                  <span className="checkbox-custom"></span> Matin
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.planning.mercredi.amidi} onChange={() => handlePlanningChange('mercredi', 'amidi')} />
                  <span className="checkbox-custom"></span> A.Midi
                </label>
              </div>
            </div>
            <div className="planning-card">
              <h4>SAMEDI</h4>
              <div className="checkbox-stack">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.planning.samedi.matin} onChange={() => handlePlanningChange('samedi', 'matin')} />
                  <span className="checkbox-custom"></span> Matin
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.planning.samedi.amidi} onChange={() => handlePlanningChange('samedi', 'amidi')} />
                  <span className="checkbox-custom"></span> A.Midi
                </label>
              </div>
            </div>
            <div className="planning-card">
              <h4>DIMANCHE</h4>
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.planning.dimanche.unique} onChange={() => handlePlanningChange('dimanche', 'unique')} />
                <span className="checkbox-custom"></span> seule séance
              </label>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            {initialData ? 'ENREGISTRER LES MODIFICATIONS' : 'CRÉER LE DOSSIER'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
