import React, { useState } from 'react';
import { History, Edit2, Archive, Trash2, CheckCircle, RotateCcw } from 'lucide-react';
import './AttendanceTable.css';

const AttendanceTable = ({
  students,
  isArchivesView,
  onDelete,
  onEdit,
  onArchive,
  onUnarchive,
  onMarkAttendance,
  onFinishSession,
  onNewWeek,
  currentWeekDate,
  onDateChange,
  weeksHistory,
  onSelectHistoryWeek,
  selectedWeekData,
  onCloseHistoryDetail,
  onResetAll,
  onUpdatePayment,
  onUpdateNotes,
  onViewHistory
}) => {
  const isSundayOnly = (p) => {
    if (!p) return false;
    return p.dimanche?.unique && 
           !p.mardi?.matin && 
           !p.mercredi?.matin && !p.mercredi?.amidi &&
           !p.samedi?.matin && !p.samedi?.amidi;
  };

  const [finishedSessions, setFinishedSessions] = useState([]);
  const [isWeeksHistoryModalOpen, setIsWeeksHistoryModalOpen] = useState(false);
  const [sessionModal, setSessionModal] = useState(null); // { key, label, day }

  // Map session keys to planning paths
  const SESSION_PLANNING_MAP = {
    mardi_matin: (p) => p?.mardi?.matin,
    mercredi_matin: (p) => p?.mercredi?.matin,
    mercredi_amidi: (p) => p?.mercredi?.amidi,
    samedi_matin: (p) => p?.samedi?.matin,
    samedi_amidi: (p) => p?.samedi?.amidi,
    dimanche_unique: (p) => p?.dimanche?.unique,
  };

  const openSessionModal = (sessionKey, label, day) => {
    setSessionModal({ sessionKey, label, day });
  };

  const getStudentsForSession = (sessionKey) => {
    const planningFn = SESSION_PLANNING_MAP[sessionKey];
    if (!planningFn) return [];
    return students.filter(s => planningFn(s.planning));
  };

  const printAttendanceSheet = (sessionKey, label, day, sessionStudents) => {
    const today = new Date().toLocaleDateString('fr-FR');
    const rows = sessionStudents.map((s, i) => {
      const unpaid = (s.totalSessionsCount || 0) - (s.paidSessionsCount || 0);
      const hasDebt = unpaid > 0;
      const annotation = s.notes || '';
      return `
        <tr>
          <td style="text-align:right; font-weight:700;">
            ${s.name}
            ${hasDebt ? `<br/><span style="font-size:0.72rem; background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; border-radius:4px; padding:2px 6px; display:inline-block; margin-top:3px;">يجب الدفع !!!</span>` : ''}
          </td>
          <td style="text-align:center;"><div style="width:22px;height:22px;border:1.5px solid #94a3b8;border-radius:4px;margin:auto;"></div></td>
          <td style="text-align:center;"><div style="width:22px;height:22px;border:1.5px solid #94a3b8;border-radius:4px;margin:auto;"></div></td>
          <td style="color:#dc2626; font-size:0.8rem; text-align:right;">
            ${hasDebt ? `انتباه: ${unpaid} حصص بدون خلاص` : ''}
            ${annotation ? `<div style="color:#64748b; font-size:0.75rem;">${annotation}</div>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>Feuille d'appel - ${day} ${label}</title>
        <style>
          @page { size: A4; margin: 1.5cm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .header-right { text-align: right; }
          .header-right h1 { margin: 0; font-size: 1.3rem; }
          .header-right p { margin: 4px 0 0; font-size: 0.9rem; color: #334155; }
          .header-left { text-align: left; font-size: 0.85rem; color: #475569; }
          hr { border: none; border-top: 2px solid #e2e8f0; margin: 16px 0 24px; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #f8fafc; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 14px; font-size: 0.88rem; }
          th { font-weight: 700; color: #334155; }
          tbody tr:nth-child(even) { background: #f8fafc; }
          .count { margin-top: 24px; font-size: 0.85rem; color: #64748b; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <div>التاريخ: ${today}</div>
          </div>
          <div class="header-right">
            <h1>Atelier Taher - ورقة الحضور</h1>
            <p>الحصة: ${day} ${label}</p>
          </div>
        </div>
        <hr />
        <table>
          <thead>
            <tr>
              <th style="text-align:right;">اسم التلميذ</th>
              <th style="text-align:center; width:90px;">حاضر (PRÉSENT)</th>
              <th style="text-align:center; width:90px;">غائب (ABSENT)</th>
              <th style="text-align:right; width:200px;">ملاحظات</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="count">المجموع: ${sessionStudents.length} تلميذ(ة)</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  // Helper to format date as DD/MM
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  // Helper to format date for input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getWeekDay = (baseDate, daysToAdd) => {
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    return newDate;
  };

  const mardiDate = currentWeekDate;
  const mercrediDate = getWeekDay(currentWeekDate, 1);
  const samediDate = getWeekDay(currentWeekDate, 4);
  const dimancheDate = getWeekDay(currentWeekDate, 5);

  const isPresent = (student, sessionKey) => {
    if (selectedWeekData) {
      const record = selectedWeekData.records.find(r => r.studentId === student._id);
      return record?.attendance?.some(a => a.session === sessionKey && a.present);
    }
    return student.attendance?.some(a => a.session === sessionKey && a.present);
  };

  const handleFinish = async (sessionKey) => {
    if (finishedSessions.includes(sessionKey)) return;
    const success = await onFinishSession(sessionKey);
    if (success) {
      setFinishedSessions(prev => [...prev, sessionKey]);
    }
  };

  const handleDatePickerChange = (e) => {
    onDateChange(new Date(e.target.value));
  };

  const handleNewWeekClick = async () => {
    const confirmed = window.confirm("Voulez-vous enregistrer cette semaine et passer à la suivante ? Toutes les coches de présence seront réinitialisées.");
    if (confirmed) {
      const success = await onNewWeek(finishedSessions);
      if (success) {
        setFinishedSessions([]);
        alert("Nouvelle semaine démarrée !");
      }
    }
  };

  const isSessionFinished = (sessionKey) => {
    if (selectedWeekData) {
      return selectedWeekData.finishedSessions?.includes(sessionKey);
    }
    return finishedSessions.includes(sessionKey);
  };

  return (
    <div className="attendance-container">
      <div className="table-header-controls">
        <div className="table-title">
          <span className="dot"></span>
          <h2>{selectedWeekData ? `HISTORIQUE : SEMAINE DU ${formatDate(new Date(selectedWeekData.startDate))}` : (isArchivesView ? "LISTE DES ARCHIVÉS" : "FEUILLE DE PRÉSENCE HEBDOMADAIRE")}</h2>
        </div>
        <div className="table-actions">
          {selectedWeekData ? (
            <button className="btn-close-history" onClick={onCloseHistoryDetail}>Revenir à aujourd'hui</button>
          ) : (
            <>
              <button className="btn-history" onClick={() => setIsWeeksHistoryModalOpen(true)}>
                <History size={18} /> Historique Semaines
              </button>
              <div className="date-picker">
                <label>DATE DU MARDI:</label>
                <input type="date" value={formatDateForInput(currentWeekDate)} onChange={handleDatePickerChange} />
              </div>
              <button className="btn-new-week" onClick={handleNewWeekClick}>Nouvelle Semaine</button>
              <button className="btn-pdf">Format PDF</button>
              <button className="btn-reset-all" onClick={onResetAll}>
                <Trash2 size={18} /> Tout Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr className="main-header">
              <th rowSpan="2">INFORMATIONS ÉTUDIANT</th>
              <th className="th-mardi">{formatDate(mardiDate)}<br /> MARDI</th>

              <th className="th-mercredi" colSpan="2">{formatDate(mercrediDate)}<br /> MERCREDI</th>
              <th className="th-samedi" colSpan="2">{formatDate(samediDate)}<br /> SAMEDI</th>
              <th className="th-dimanche">{formatDate(dimancheDate)}<br /> DIMANCHE</th>
              <th rowSpan="2">CYCLE (SESSION)</th>
              <th rowSpan="2">RÈGLEMENT</th>
              <th rowSpan="2">ANNOTATIONS</th>
              <th rowSpan="2">ACTIONS</th>
            </tr>
            <tr className="sub-header">
              <th className="th-mardi"><div className="session-header"><span className="session-label-btn" onClick={() => openSessionModal('mardi_matin', 'MATIN', 'MARDI')}>MATIN</span><button className={`btn-term ${isSessionFinished('mardi_matin') ? 'finished' : ''}`} onClick={() => handleFinish('mardi_matin')} disabled={isSessionFinished('mardi_matin') || selectedWeekData}><CheckCircle size={14} /> {isSessionFinished('mardi_matin') ? 'TERMINE' : 'TERMINER'}</button></div></th>
              <th className="th-mercredi"><div className="session-header"><span className="session-label-btn" onClick={() => openSessionModal('mercredi_matin', 'MATIN', 'MERCREDI')}>MATIN</span><button className={`btn-term ${isSessionFinished('mercredi_matin') ? 'finished' : ''}`} onClick={() => handleFinish('mercredi_matin')} disabled={isSessionFinished('mercredi_matin') || selectedWeekData}><CheckCircle size={14} /> {isSessionFinished('mercredi_matin') ? 'TERMINE' : 'TERMINER'}</button></div></th>
              <th className="th-mercredi"><div className="session-header"><span className="session-label-btn" onClick={() => openSessionModal('mercredi_amidi', 'A.MIDI', 'MERCREDI')}>A.MIDI</span><button className={`btn-term ${isSessionFinished('mercredi_amidi') ? 'finished' : ''}`} onClick={() => handleFinish('mercredi_amidi')} disabled={isSessionFinished('mercredi_amidi') || selectedWeekData}><CheckCircle size={14} /> {isSessionFinished('mercredi_amidi') ? 'TERMINE' : 'TERMINER'}</button></div></th>
              <th className="th-samedi"><div className="session-header"><span className="session-label-btn" onClick={() => openSessionModal('samedi_matin', 'MATIN', 'SAMEDI')}>MATIN</span><button className={`btn-term ${isSessionFinished('samedi_matin') ? 'finished' : ''}`} onClick={() => handleFinish('samedi_matin')} disabled={isSessionFinished('samedi_matin') || selectedWeekData}><CheckCircle size={14} /> {isSessionFinished('samedi_matin') ? 'TERMINE' : 'TERMINER'}</button></div></th>
              <th className="th-samedi"><div className="session-header"><span className="session-label-btn" onClick={() => openSessionModal('samedi_amidi', 'A.MIDI', 'SAMEDI')}>A.MIDI</span><button className={`btn-term ${isSessionFinished('samedi_amidi') ? 'finished' : ''}`} onClick={() => handleFinish('samedi_amidi')} disabled={isSessionFinished('samedi_amidi') || selectedWeekData}><CheckCircle size={14} /> {isSessionFinished('samedi_amidi') ? 'TERMINE' : 'TERMINER'}</button></div></th>
              <th className="th-dimanche"><div className="session-header"><span className="session-label-btn" onClick={() => openSessionModal('dimanche_unique', 'UNIQUE', 'DIMANCHE')}>UNIQUE</span><button className={`btn-term ${isSessionFinished('dimanche_unique') ? 'finished' : ''}`} onClick={() => handleFinish('dimanche_unique')} disabled={isSessionFinished('dimanche_unique') || selectedWeekData}><CheckCircle size={14} /> {isSessionFinished('dimanche_unique') ? 'TERM' : 'TERMINER'}</button></div></th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>
                  <div className="student-info-cell">
                    <div className="student-avatar">
                      {student.name[0]}
                      {student.totalSessionsCount > 0 && student.totalSessionsCount % 8 === 0 && (
                        <div className="cycle-indicator" title="Cycle terminé !">!</div>
                      )}
                    </div>
                    <div className="student-details">
                      <strong>{student.name}</strong>
                      <span>{student.tarif} DT / {isSundayOnly(student.planning) ? '5' : '8'} Séances</span>
                    </div>
                  </div>
                </td>
                <td><div className={`attendance-check ${!student.planning?.mardi?.matin ? 'disabled' : ''} ${isPresent(student, 'mardi_matin') ? 'present' : ''}`} onClick={() => !isArchivesView && !selectedWeekData && student.planning?.mardi?.matin && onMarkAttendance(student._id, 'mardi_matin')}></div></td>
                <td><div className={`attendance-check ${!student.planning?.mercredi?.matin ? 'disabled' : ''} ${isPresent(student, 'mercredi_matin') ? 'present' : ''}`} onClick={() => !isArchivesView && !selectedWeekData && student.planning?.mercredi?.matin && onMarkAttendance(student._id, 'mercredi_matin')}></div></td>
                <td><div className={`attendance-check ${!student.planning?.mercredi?.amidi ? 'disabled' : ''} ${isPresent(student, 'mercredi_amidi') ? 'present' : ''}`} onClick={() => !isArchivesView && !selectedWeekData && student.planning?.mercredi?.amidi && onMarkAttendance(student._id, 'mercredi_amidi')}></div></td>
                <td><div className={`attendance-check ${!student.planning?.samedi?.matin ? 'disabled' : ''} ${isPresent(student, 'samedi_matin') ? 'present' : ''}`} onClick={() => !isArchivesView && !selectedWeekData && student.planning?.samedi?.matin && onMarkAttendance(student._id, 'samedi_matin')}></div></td>
                <td><div className={`attendance-check ${!student.planning?.samedi?.amidi ? 'disabled' : ''} ${isPresent(student, 'samedi_amidi') ? 'present' : ''}`} onClick={() => !isArchivesView && !selectedWeekData && student.planning?.samedi?.amidi && onMarkAttendance(student._id, 'samedi_amidi')}></div></td>
                <td><div className={`attendance-check ${!student.planning?.dimanche?.unique ? 'disabled' : ''} ${isPresent(student, 'dimanche_unique') ? 'present' : ''}`} onClick={() => !isArchivesView && !selectedWeekData && student.planning?.dimanche?.unique && onMarkAttendance(student._id, 'dimanche_unique')}></div></td>
                <td>
                  <div className="cycle-tracker">
                    {(() => {
                      const maxS = isSundayOnly(student.planning) ? 5 : 8;
                      const totalSessions = student.totalSessionsCount || 0;
                      const sessionsInCurrentCycle = totalSessions % maxS || (totalSessions > 0 ? maxS : 0);
                      const dots = [];
                      for (let i = 0; i < maxS; i++) {
                        let statusClass = '';
                        if (i < sessionsInCurrentCycle) {
                          const historyIndex = (student.cycleHistory?.length || 0) - sessionsInCurrentCycle + i;
                          const session = student.cycleHistory?.[historyIndex];
                          if (session) {
                            statusClass = session.type === 'present' ? 'attended' : 'missed';
                          }
                        }
                        dots.push(<span key={i} className={`cycle-dot ${statusClass}`}></span>);
                      }
                      return dots;
                    })()}
                  </div>
                </td>
                <td>
                  <div className="payment-cell">
                    {(() => {
                      const totalCount = student.totalSessionsCount || 0;
                      const paidCount = student.paidSessionsCount || 0;
                      const tarif = student.tarif || 80;
                      const debtNodes = [];

                      if (student.paymentStatus === "Payer Partiellement / دفع جزئي") {
                        const moneyReceivedTotal = student.totalMoneyPaid || 0;
                        const actualRemainder = (moneyReceivedTotal % tarif === 0 && moneyReceivedTotal > 0) ? 0 : (tarif - (moneyReceivedTotal % tarif));
                        if (actualRemainder > 0 && actualRemainder < tarif) {
                          debtNodes.push(
                            <div key="partial" className="payment-warning-container partial">
                              <span className="debt-info">Reste: {actualRemainder} DT</span>
                            </div>
                          );
                        }
                      }

                      if (totalCount > paidCount) {
                        const unpaidSessions = totalCount - paidCount;
                        debtNodes.push(
                          <div key="sessions" className="payment-warning-container">
                            <span className="payment-warning">{unpaidSessions} séances sans paiement !</span>
                          </div>
                        );
                      }
                      return debtNodes.length > 0 ? <>{debtNodes}</> : null;
                    })()}
                    <select
                      value={student.paymentStatus}
                      onChange={(e) => onUpdatePayment(student._id, e.target.value)}
                    >
                      <option value="Non Payer / لم يدفع بعد">NON PAYER / لم يدفع بعد</option>
                      <option value="Payer / تم الخلاص">PAYER / تم الخلاص</option>
                      <option value="Payer Partiellement / دفع جزئي">PAYER PARTIELLEMENT / دفع جزئي</option>
                    </select>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    className="annotation-input"
                    placeholder="Ajouter une note..."
                    defaultValue={student.notes}
                    onBlur={(e) => onUpdateNotes(student._id, e.target.value)}
                  />
                </td>
                <td>
                  <div className="action-btns">
                    <History size={18} className="icon-history" onClick={() => onViewHistory(student)} />
                    <Edit2 size={18} className="icon-edit" onClick={() => onEdit(student)} />
                    {isArchivesView ? (
                      <RotateCcw size={18} className="icon-unarchive" onClick={() => onUnarchive(student._id)} title="Désarchiver" />
                    ) : (
                      <Archive size={18} className="icon-archive" onClick={() => onArchive(student._id)} title="Archiver" />
                    )}
                    <Trash2 size={18} className="icon-delete" onClick={() => onDelete(student._id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isWeeksHistoryModalOpen && (
        <div className="modal-overlay">
          <div className="history-modal">
            <div className="modal-header">
              <h3>Historique des Semaines</h3>
              <button className="close-btn" onClick={() => setIsWeeksHistoryModalOpen(false)}>×</button>
            </div>
            <div className="weeks-grid">
              {weeksHistory.length === 0 ? (
                <p className="no-data">Aucune semaine enregistrée.</p>
              ) : (
                weeksHistory.map((week) => (
                  <div key={week._id} className="week-card" onClick={() => { onSelectHistoryWeek(week); setIsWeeksHistoryModalOpen(false); }}>
                    <div className="card-icon"><History size={24} /></div>
                    <div className="card-info">
                      <h4>Semaine du {formatDate(new Date(week.startDate))}</h4>
                      <span>{week.records.length} Étudiants</span>
                    </div>
                    <div className="card-arrow">→</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {sessionModal && (
        <div className="modal-overlay" onClick={() => setSessionModal(null)}>
          <div className="session-students-modal" onClick={e => e.stopPropagation()}>
            <div className="session-students-header">
              <div className="session-students-title">
                <div className="session-badge">{sessionModal.label}</div>
                <div>
                  <h3>{sessionModal.day} — {sessionModal.label}</h3>
                  <span className="session-students-sub">{getStudentsForSession(sessionModal.sessionKey).length} élève(s) programmé(s)</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn-print-appel"
                  onClick={() => printAttendanceSheet(sessionModal.sessionKey, sessionModal.label, sessionModal.day, getStudentsForSession(sessionModal.sessionKey))}
                >
                  🖨 Appel Rapide
                </button>
                <button className="close-btn" onClick={() => setSessionModal(null)}>×</button>
              </div>
            </div>
            <div className="session-students-list">
              {getStudentsForSession(sessionModal.sessionKey).length === 0 ? (
                <p className="no-data">Aucun élève programmé pour cette séance.</p>
              ) : (
                getStudentsForSession(sessionModal.sessionKey).map((s, i) => (
                  <div key={s._id} className="session-student-item">
                    <div className="session-student-num">{i + 1}</div>
                    <div className="session-student-avatar">{s.name[0]?.toUpperCase()}</div>
                    <div className="session-student-info">
                      <strong>{s.name}</strong>
                      <span>{s.phone}</span>
                    </div>
                    <div className={`session-student-status ${s.paymentStatus?.includes('Non') ? 'non-payer' : 'payer'}`}>
                      {s.paymentStatus?.includes('Non') ? 'NON PAYER' : 'PAYER'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
