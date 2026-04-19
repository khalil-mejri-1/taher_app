import React, { useState } from 'react';
import { X, Calendar, Phone, Image as ImageIcon, Trash2 } from 'lucide-react';
import './StudentHistoryModal.css';

const StudentHistoryModal = ({ student, isOpen, onClose, onToggleCompensated, onToggleMonthlyPayment, onDeleteSession }) => {
  if (!isOpen) return null;

  const isSundayOnly = (p) => {
    if (!p) return false;
    return p.dimanche?.unique &&
      !p.mardi?.matin &&
      !p.mercredi?.matin && !p.mercredi?.amidi &&
      !p.samedi?.matin && !p.samedi?.amidi;
  };

  const formatSessionName = (key) => {
    if (!key) return '';
    const parts = key.split('_');
    if (parts.length < 2) return key.toUpperCase();
    
    const day = parts[0].toUpperCase();
    let type = parts[1].toUpperCase();
    if (type === 'AMIDI') type = 'A.MIDI';
    
    return `${day} - ${type}`;
  };

  // Number of expected sessions per cycle
  const maxS = isSundayOnly(student.planning) ? 5 : 8;

  const months = [];
  let numMonths = 24; // Standardized to 2 years of history

  for (let i = 0; i < numMonths; i++) {
    const monthSessions = [];
    for (let j = 0; j < maxS; j++) {
      const hIdx = i * maxS + j;
      const sess = student.cycleHistory?.[hIdx];
      if (sess) monthSessions.push(sess);
      else monthSessions.push(null);
    }
    months.push({ number: i + 1, sessions: monthSessions });
  }

  const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const isMonthPaid = (monthNum) => {
    return student.paidMonths?.includes(monthNum);
  };

  const infoDateToDisplay = student.inscriptionDate ? new Date(student.inscriptionDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '--';

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal-content" onClick={e => e.stopPropagation()}>
        <div className="history-modal-header">
          <div className="student-info-main">
            <div className="student-details-text">
              <h2>{student.name}</h2>
              <br />
              <div className="student-meta-grid">
                <div className="meta-item">
                </div>
                <div className="meta-item">
                </div>
              </div>
            </div>
          </div>
          <button className="history-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="history-info-cards">
          <div className="info-card">
            <div className="card-icon orange">
              <Calendar size={20} />
            </div>
            <div className="card-content">
              <span className="label">DATE D'INSCRIPTION / تاريخ التسجيل</span>
              <span className="value">{infoDateToDisplay}</span>
            </div>
          </div>

          <div className="info-card cin-card">
            {student.idCardImage ? (
              <img 
                src={student.idCardImage} 
                alt="CIN" 
                className="cin-preview" 
                onClick={() => window.open(student.idCardImage, '_blank')}
                title="Cliquer pour agrandir"
              />
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
                {[...Array(maxS)].map((_, i) => (
                  <th key={i}>S{i + 1}</th>
                ))}
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
                      const historyIndex = (month.number - 1) * maxS + idx;
                      const displayType = student.historyOverrides?.[historyIndex] || session?.type;
                      const hasOverride = !!student.historyOverrides?.[historyIndex];
                      const isDeleted = displayType === 'deleted';
                      const shouldShowAsFilled = (session || hasOverride) && !isDeleted;

                      return (
                        <td key={idx}>
                          <div className={`status-dot-container ${shouldShowAsFilled ? 'has-data' : ''}`}>
                            {shouldShowAsFilled ? (
                              <div className="dot-wrapper">
                                <div className="dot-interactive-wrapper">
                                  <div
                                    className={`status-dot ${displayType}`}
                                    onClick={() => onToggleCompensated(student._id, historyIndex, session?.type || 'absent')}
                                    style={{ cursor: 'pointer' }}
                                  ></div>
                                  <button 
                                    className="delete-session-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSession(student._id, historyIndex);
                                    }}
                                    title="Supprimer la session"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                                <div className="session-detail-container">
                                  <span className="session-date">
                                    {session?.customDateStr || (session?.date ? new Date(session.date).toLocaleDateString('fr-FR') : '--')}
                                  </span>
                                  <span className="session-name">
                                    {formatSessionName(session?.session)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="status-dot empty" 
                                onClick={() => onToggleCompensated(student._id, historyIndex, 'empty-trigger')}
                                style={{ cursor: 'pointer' }}
                                title="Récupérer cette session"
                              ></div>
                            )}
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
