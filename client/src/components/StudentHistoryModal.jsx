import React, { useState } from 'react';
import { X, Calendar, Phone, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import './StudentHistoryModal.css';

const StudentHistoryModal = ({ student, isOpen, onClose, onToggleCompensated, onToggleMonthlyPayment, onDeleteSession }) => {
  const [loadingMonth, setLoadingMonth] = useState(null);
  const [loadingDeleteIndex, setLoadingDeleteIndex] = useState(null);
  const [loadingDotIndex, setLoadingDotIndex] = useState(null);

  if (!isOpen) return null;

  const isSundayOnly = (p) => {
    if (!p) return false;
    return p.dimanche?.unique &&
      !p.mardi?.matin && !p.mardi?.amidi &&
      !p.mercredi?.matin && !p.mercredi?.amidi &&
      !p.jeudi?.matin && !p.jeudi?.amidi &&
      !p.vendredi?.matin && !p.vendredi?.amidi &&
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

  // Default expected sessions per cycle based on current planning
  const defaultMaxS = isSundayOnly(student.planning) ? 5 : 8;
  const history = student.cycleHistory || [];
  const paidSessionsCount = Number(student.paidSessionsCount || 0);
  const paidMonthsList = student.paidMonths || [];

  // Build 24 months dynamically respecting the cycle size of each session
  const months = [];
  let currentHistoryIndex = 0;
  const totalHistoryLength = history.length;

  for (let m = 1; m <= 24; m++) {
    let monthCycleSize = defaultMaxS;
    if (currentHistoryIndex < totalHistoryLength) {
      const nextSession = history[currentHistoryIndex];
      if (nextSession?.session === 'dimanche_unique') {
        monthCycleSize = 5;
      } else if (nextSession?.session && nextSession.session !== 'manual_add') {
        monthCycleSize = 8;
      }
    }

    const monthSessions = [];

    for (let j = 0; j < monthCycleSize; j++) {
      const hIdx = currentHistoryIndex;
      if (hIdx < totalHistoryLength) {
        const sess = history[hIdx];
        monthSessions.push({
          ...sess,
          historyIndex: hIdx,
          isPaid: hIdx < paidSessionsCount,
          hasData: true
        });
      } else {
        monthSessions.push({
          historyIndex: hIdx,
          isPaid: hIdx < paidSessionsCount,
          hasData: false
        });
      }
      currentHistoryIndex++;
    }

    const isPaid = paidMonthsList.includes(m) || 
      (monthSessions.some(s => s.hasData) && currentHistoryIndex <= paidSessionsCount);

    months.push({
      number: m,
      cycleSize: monthCycleSize,
      sessions: monthSessions,
      isPaid
    });
  }

  const maxTableColumns = months.some(m => m.cycleSize === 8) ? 8 : (defaultMaxS === 8 ? 8 : 5);

  const initials = student.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const infoDateToDisplay = student.inscriptionDate ? new Date(student.inscriptionDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '--';

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal-content" onClick={e => e.stopPropagation()}>
        <div className="history-modal-header">
          <div className="student-info-main">
            <div className="student-details-text">
              <h2>{student.name}</h2>
            </div>
          </div>
          <button className="history-close-btn" onClick={onClose} title="Fermer">
            <X size={22} />
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
                <th className="cycle-th">MOIS</th>
                {[...Array(maxTableColumns)].map((_, i) => (
                  <th key={i} className="session-th">S{i + 1}</th>
                ))}
                <th className="action-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => {
                const isPaid = month.isPaid;
                return (
                  <tr key={month.number} className={isPaid ? 'paid-row' : 'unpaid-row'}>
                    <td className="cycle-number-cell">
                      <span className="cycle-num">{month.number}</span>
                    </td>
                    {[...Array(maxTableColumns)].map((_, idx) => {
                      if (idx >= month.cycleSize) {
                        return (
                          <td key={idx} className="disabled-session-cell">
                            <span className="disabled-dash">—</span>
                          </td>
                        );
                      }

                      const session = month.sessions[idx];
                      const historyIndex = session.historyIndex;
                      const displayType = student.historyOverrides?.[historyIndex] || session?.type;
                      const hasOverride = !!student.historyOverrides?.[historyIndex];
                      const isDeleted = displayType === 'deleted';
                      const shouldShowAsFilled = (session?.hasData || hasOverride) && !isDeleted;

                      const isDotLoading = loadingDotIndex === historyIndex;
                      const isDeleteLoading = loadingDeleteIndex === historyIndex;

                      return (
                        <td key={idx}>
                          <div className={`status-dot-container ${shouldShowAsFilled ? 'has-data' : ''}`}>
                            {shouldShowAsFilled ? (
                              <div className="dot-wrapper">
                                <div className="dot-interactive-wrapper">
                                  {isDotLoading ? (
                                    <div className="status-dot-loading" title="Enregistrement...">
                                      <Loader2 size={12} className="spin-loader" />
                                    </div>
                                  ) : (
                                    <div
                                      className={`status-dot ${displayType}`}
                                      onClick={async () => {
                                        if (loadingDotIndex !== null || loadingMonth !== null || loadingDeleteIndex !== null) return;
                                        setLoadingDotIndex(historyIndex);
                                        try {
                                          await onToggleCompensated(student._id, historyIndex, session?.type || 'absent');
                                        } finally {
                                          setLoadingDotIndex(null);
                                        }
                                      }}
                                      style={{ cursor: 'pointer' }}
                                      title={session.isPaid ? "Séance Payée / حصة خالصة" : "Séance Non Payée / حصة غير خالصة"}
                                    ></div>
                                  )}
                                  <button 
                                    className={`delete-session-btn ${isDeleteLoading ? 'btn-is-loading' : ''}`}
                                    disabled={loadingDeleteIndex !== null || loadingMonth !== null || loadingDotIndex !== null}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (loadingDeleteIndex !== null || loadingMonth !== null || loadingDotIndex !== null) return;
                                      setLoadingDeleteIndex(historyIndex);
                                      try {
                                        await onDeleteSession(student._id, historyIndex);
                                      } finally {
                                        setLoadingDeleteIndex(null);
                                      }
                                    }}
                                    title="Supprimer la session"
                                  >
                                    {isDeleteLoading ? <Loader2 size={10} className="spin-loader" /> : <Trash2 size={10} />}
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
                              isDotLoading ? (
                                <div className="status-dot-loading" title="Enregistrement...">
                                  <Loader2 size={12} className="spin-loader" />
                                </div>
                              ) : (
                                <div 
                                  className="status-dot empty" 
                                  onClick={async () => {
                                    if (loadingDotIndex !== null || loadingMonth !== null || loadingDeleteIndex !== null) return;
                                    setLoadingDotIndex(historyIndex);
                                    try {
                                      await onToggleCompensated(student._id, historyIndex, 'empty-trigger');
                                    } finally {
                                      setLoadingDotIndex(null);
                                    }
                                  }}
                                  style={{ cursor: 'pointer' }}
                                  title="Récupérer cette session"
                                ></div>
                              )
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="action-cell">
                      <button
                        className={`payment-toggle-btn ${isPaid ? 'paid' : 'unpaid'} ${loadingMonth === month.number ? 'btn-is-loading' : ''}`}
                        disabled={loadingMonth !== null || loadingDeleteIndex !== null || loadingDotIndex !== null}
                        onClick={async () => {
                          if (loadingMonth !== null || loadingDeleteIndex !== null || loadingDotIndex !== null) return;
                          setLoadingMonth(month.number);
                          try {
                            await onToggleMonthlyPayment(student._id, month.number, month.cycleSize);
                          } finally {
                            setLoadingMonth(null);
                          }
                        }}
                      >
                        {loadingMonth === month.number ? (
                          <span className="btn-loading-flex">
                            <Loader2 size={12} className="spin-loader" />
                            <span>...</span>
                          </span>
                        ) : (
                          isPaid ? 'PAYÉ' : 'PAYER'
                        )}
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
