import React from 'react';
import { X, Calendar, Phone, Image as ImageIcon } from 'lucide-react';
import './StudentHistoryModal.css';

const StudentHistoryModal = ({ student, isOpen, onClose, onToggleCompensated, onToggleMonthlyPayment }) => {
  if (!isOpen) return null;

  // Group history into 12 months, each with 8 sessions
  const months = [];
  for (let i = 0; i < 12; i++) {
    const monthSessions = [];
    for (let j = 0; j < 8; j++) {
      const historyIndex = i * 8 + j;
      monthSessions.push(student.cycleHistory?.[historyIndex] || null);
    }
    months.push({ number: i + 1, sessions: monthSessions });
  }

  const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const isMonthPaid = (monthNum) => {
    return student.paidMonths?.includes(monthNum);
  };

  return (
    <div className="history-modal-overlay">
      <div className="history-modal-content">
        <button className="history-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="history-header">
          <div className="student-badge">
            <div className="initials-avatar">{initials}</div>
            <div className="student-name-container">
              <h2>Historique</h2>
              <span className="student-subtext">{student.name}</span>
            </div>
          </div>
          <div className="phone-badge">
            <span className="label">TÉLÉPHONE</span>
            <span className="value">{student.phone}</span>
          </div>
        </div>

        <div className="history-info-cards">
          <div className="info-card">
            <div className="card-icon orange">
              <Calendar size={20} />
            </div>
            <div className="card-content">
              <span className="label">DATE D'INSCRIPTION / تاريخ التسجيل</span>
              <span className="value">{new Date(student.inscriptionDate).toISOString().split('T')[0]}</span>
            </div>
          </div>

          <div className="info-card cin-card">
            {student.idCardImage ? (
               <img src={student.idCardImage} alt="CIN" className="cin-preview" />
            ) : (
              <div className="cin-placeholder">
                <ImageIcon size={24} />
                <span>Aucune photo CIN</span>
              </div>
            )}
          </div>
        </div>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>MOIS</th>
                <th>S1</th>
                <th>S2</th>
                <th>S3</th>
                <th>S4</th>
                <th>S5</th>
                <th>S6</th>
                <th>S7</th>
                <th>S8</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => {
                const isPaid = isMonthPaid(month.number);
                return (
                  <tr key={month.number} className={isPaid ? 'paid-row' : 'unpaid-row'}>
                    <td className="cycle-number-cell">
                      <span className="cycle-num">{month.number}</span>
                    </td>
                    {month.sessions.map((session, idx) => {
                      const historyIndex = (month.number - 1) * 8 + idx;
                      return (
                        <td key={idx}>
                          <div className={`status-dot-container ${session ? 'has-data' : ''}`}>
                            {session && (
                              <div className="dot-wrapper">
                                <div 
                                  className={`status-dot ${session.type}`}
                                  onClick={() => onToggleCompensated(student._id, historyIndex)}
                                  style={{ cursor: session.type !== 'present' ? 'pointer' : 'default' }}
                                ></div>
                                <span className="session-date">
                                  {new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                </span>
                              </div>
                            )}
                            {!session && <div className="status-dot empty"></div>}
                          </div>
                        </td>
                      );
                    })}
                    <td className="action-cell">
                      <button 
                        className={`payment-toggle-btn ${isPaid ? 'paid' : 'unpaid'}`}
                        onClick={() => onToggleMonthlyPayment(student._id, month.number)}
                      >
                        {isPaid ? 'PAYÉ' : 'PAYER'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentHistoryModal;
