import React, { useState, useEffect, useMemo } from 'react';
import { History, Edit2, Archive, Trash2, CheckCircle, RotateCcw, Loader2, X } from 'lucide-react';
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
  onViewHistory,
  finishedSessions,
  setFinishedSessions,
  customAlert,
  customConfirm,
  isLoading
}) => {
  const isSundayOnly = (p) => {
    if (!p) return false;
    return p.dimanche?.unique &&
      !p.mardi?.matin &&
      !p.mercredi?.matin && !p.mercredi?.amidi &&
      !p.samedi?.matin && !p.samedi?.amidi;
  };


  const [loadingCheck, setLoadingCheck] = useState(null); // { studentId, sessionKey }
  const [loadingSession, setLoadingSession] = useState(null); // sessionKey
  const [isWeeksHistoryModalOpen, setIsWeeksHistoryModalOpen] = useState(false);
  const [sessionModal, setSessionModal] = useState(null); // { key, label, day }
  const [pendingChanges, setPendingChanges] = useState({}); // { studentId: { sessionKey: boolean } }
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  const [sessionFilter, setSessionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of students per page

  const enhancedStudents = useMemo(() => {
    return students.map(s => {
      let sTemp = { ...s };

      const maxS = isSundayOnly(sTemp.planning) ? 5 : 8;
      const history = sTemp.cycleHistory || [];
      const overrides = sTemp.historyOverrides || {};
      let lastIndex = -1;
      for (let i = 0; i < 24 * maxS; i++) {
        const t = overrides[i] || history[i]?.type;
        if (t && t !== 'deleted' && t !== 'empty-trigger') {
          lastIndex = i;
        }
      }
      const actualTotalCount = lastIndex !== -1 ? lastIndex + 1 : 0;
      const effectiveTotalCount = Math.max(Number(sTemp.totalSessionsCount || 0), actualTotalCount);
      
      // Update sTemp with accurate count for use in other parts of the component (e.g. print sheet)
      sTemp.totalSessionsCount = effectiveTotalCount;

      // Dynamic rule: If there are unpaid sessions but status says "Payer", switch to "Non Payer" visually
      const owesSessionsCount = Math.max(0, effectiveTotalCount - Number(sTemp.paidSessionsCount || 0));
      if (owesSessionsCount > 0 && sTemp.paymentStatus === "Payer / تم الخلاص") {
        sTemp.paymentStatus = "Non Payer / لم يدفع بعد";
      }

      return sTemp;
    });
  }, [students]);

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...enhancedStudents];

    if (sessionFilter !== 'all') {
      const parts = sessionFilter.split('_');
      if (parts.length === 2) {
        result = result.filter(s => s.planning?.[parts[0]]?.[parts[1]]);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
      );
    }

    if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b._id.localeCompare(a._id));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => a._id.localeCompare(b._id));
    }

    return result;
  }, [enhancedStudents, searchQuery, sortBy, sessionFilter]);

  // Handle Pagination resets
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, sessionFilter, students.length]);

  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(start, start + itemsPerPage);
  }, [filteredAndSortedStudents, currentPage, itemsPerPage]);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handlePageClick = (pageNum) => setCurrentPage(pageNum);

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
    return enhancedStudents.filter(s => planningFn(s.planning));
  };

  const handleCheckClick = (studentId, sessionKey) => {
    if (isArchivesView || selectedWeekData) return;
    
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    setPendingChanges(prev => {
      const studentChanges = prev[studentId] || {};
      
      // Determine if currently present considering pending changes
      const currentPresentInPending = studentChanges[sessionKey];
      const currentlyPresent = currentPresentInPending !== undefined 
        ? currentPresentInPending 
        : (student.attendance?.some(a => a.session === sessionKey && a.present) || false);
        
      const nextPresent = !currentlyPresent;
      
      // Check if nextPresent matches the original state in the database
      const originalPresent = student.attendance?.some(a => a.session === sessionKey && a.present) || false;
      
      const newStudentChanges = { ...studentChanges };
      
      if (nextPresent === originalPresent) {
        // If we toggled back to the original state, remove this session from pending
        delete newStudentChanges[sessionKey];
      } else {
        // Otherwise, record the change
        newStudentChanges[sessionKey] = nextPresent;
      }
      
      const newPending = { ...prev };
      if (Object.keys(newStudentChanges).length === 0) {
        // If no more changes for this student, remove the student entry
        delete newPending[studentId];
      } else {
        newPending[studentId] = newStudentChanges;
      }
      
      return newPending;
    });
  };

  const handleSaveBatch = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    
    setIsSavingBatch(true);
    const updates = [];

    for (const studentId of Object.keys(pendingChanges)) {
      const student = students.find(s => s._id === studentId);
      if (!student) continue;

      let newAttendance = [...(student.attendance || [])];
      let cycleChange = 0;

      const studentSessionChanges = pendingChanges[studentId];
      for (const sessionKey of Object.keys(studentSessionChanges)) {
        const nextPresent = studentSessionChanges[sessionKey];
        const originalPresent = student.attendance?.some(a => a.session === sessionKey && a.present);

        if (nextPresent === originalPresent) continue; // No change for this session

        if (nextPresent) {
          // Add if not present
          newAttendance.push({ date: new Date(), session: sessionKey, present: true });
          cycleChange += 1;
        } else {
          // Remove if present
          newAttendance = newAttendance.filter(a => a.session !== sessionKey);
          cycleChange -= 1;
        }
      }

      if (cycleChange === 0 && newAttendance.length === student.attendance?.length) continue;

      const maxS = isSundayOnly(student.planning) ? 5 : 8;
      const newCompleted = Math.max(0, Math.min(maxS, (student.cycle?.completed || 0) + cycleChange));

      updates.push({
        id: studentId,
        attendance: newAttendance,
        cycle: { ...student.cycle, completed: newCompleted }
      });
    }

    if (updates.length > 0) {
      const success = await onBatchAttendance(updates);
      if (success) {
        setPendingChanges({});
        if (customAlert) customAlert("Succès", "الحضور سجل بنجاح دفعة واحدة");
      }
    } else {
      setPendingChanges({}); // No real updates found
    }
    setIsSavingBatch(false);
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

  const getSessionDate = (sessionKey) => {
    const baseDate = currentWeekDate;
    if (sessionKey.startsWith('mardi')) return baseDate;
    if (sessionKey.startsWith('mercredi')) return getWeekDay(baseDate, 1);
    if (sessionKey.startsWith('samedi')) return getWeekDay(baseDate, 4);
    if (sessionKey.startsWith('dimanche')) return getWeekDay(baseDate, 5);
    return null;
  };

  const baseWeekDate = selectedWeekData ? new Date(selectedWeekData.startDate) : currentWeekDate;
  const mardiDate = baseWeekDate;
  const mercrediDate = getWeekDay(baseWeekDate, 1);
  const samediDate = getWeekDay(baseWeekDate, 4);
  const dimancheDate = getWeekDay(baseWeekDate, 5);

  const isPresent = (student, sessionKey) => {
    if (selectedWeekData) {
      const record = selectedWeekData.records.find(r => r.studentId === student._id);
      return record?.attendance?.some(a => a.session === sessionKey && a.present);
    }

    // Check pending changes first
    if (pendingChanges[student._id] && pendingChanges[student._id][sessionKey] !== undefined) {
      return pendingChanges[student._id][sessionKey];
    }

    return student.attendance?.some(a => a.session === sessionKey && a.present);
  };

  const handleFinish = async (sessionKey) => {
    if (loadingSession) return;
    
    const isFinished = isSessionFinished(sessionKey);

    if (isFinished) {
      const confirmed = await customConfirm("Annuler la clôture", "Voulez-vous vraiment annuler la clôture de cette session ? Cela réduira le compteur du cycle pour les élèves de cette حصة.");
      if (!confirmed) return;
    }
    
    setLoadingSession(sessionKey);
    try {
      const success = await onFinishSession(sessionKey, isFinished);
      if (success) {
        if (isFinished) {
          // Revert: remove from finishedSessions
          setFinishedSessions(prev => prev.filter(k => k !== sessionKey));
        } else {
          // Finish: add to finishedSessions
          setFinishedSessions(prev => [...prev, sessionKey]);
        }
      }
    } finally {
      setLoadingSession(null);
    }
  };

  const handleDatePickerChange = (e) => {
    onDateChange(new Date(e.target.value));
  };

  const handleNewWeekClick = async () => {
    const confirmed = await customConfirm("Nouvelle Semaine", "Voulez-vous enregistrer cette semaine et passer à la suivante ? Toutes les coches de présence seront réinitialisées.");
    if (confirmed) {
      const success = await onNewWeek(finishedSessions);
      if (success) {
        setFinishedSessions([]);
        customAlert("Succès", "Nouvelle semaine démarrée !");
      }
    }
  };

  const isSessionFinished = (sessionKey) => {
    if (selectedWeekData) {
      return selectedWeekData.finishedSessions?.includes(sessionKey);
    }
    
    // Explicitly marked as finished in the current week
    if (finishedSessions.includes(sessionKey)) return true;

    // Auto-detect based on history records for the current date
    const sessionDate = getSessionDate(sessionKey);
    if (!sessionDate) return false;
    
    const dateStr = sessionDate.toLocaleDateString('fr-FR');
    
    // Only auto-detect if we have students for this session
    const sessionStudents = getStudentsForSession(sessionKey);
    if (sessionStudents.length === 0) return false;

    // If at least half of the students have a history entry for this date/session, mark as finished
    // (We use a threshold to avoid a single manual history add from greying out the whole session button)
    const recordedCount = sessionStudents.filter(s => 
      s.cycleHistory?.some(h => new Date(h.date).toLocaleDateString('fr-FR') === dateStr)
    ).length;

    return recordedCount > 0 && recordedCount >= sessionStudents.length / 2;
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
              {Object.keys(pendingChanges).length > 0 && (
                <button 
                  className={`btn-save-batch ${isSavingBatch ? 'working' : ''}`} 
                  onClick={handleSaveBatch}
                  disabled={isSavingBatch}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  {isSavingBatch ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}
                  ارسال الحضور ({Object.keys(pendingChanges).length})
                </button>
              )}

            </>
          )}
        </div>
      </div>

      <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '15px', padding: '0 10px' }}>
        <input 
          type="text" 
          placeholder="Rechercher par nom ou numéro de téléphone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: 'white' }}
        >
          <option value="default">Tri par défaut</option>
          <option value="alphabetical">De A à Z (Alphabétique)</option>
          <option value="newest">Les plus récents en premier</option>
          <option value="oldest">Les plus anciens en premier</option>
        </select>
      </div>

      <div className="session-filters-bar" style={{ display: 'flex', gap: '10px', marginBottom: '15px', padding: '0 10px', overflowX: 'auto', paddingBottom: '5px' }}>
        <button 
          className={`session-filter-btn ${sessionFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSessionFilter('all')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: sessionFilter === 'all' ? 'none' : '1px solid #e2e8f0', background: sessionFilter === 'all' ? '#10b981' : 'white', color: sessionFilter === 'all' ? 'white' : '#64748b', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Tous les étudiants
        </button>
        <button 
          className={`session-filter-btn ${sessionFilter === 'mardi_matin' ? 'active' : ''}`}
          onClick={() => setSessionFilter('mardi_matin')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: sessionFilter === 'mardi_matin' ? 'none' : '1px solid #e2e8f0', background: sessionFilter === 'mardi_matin' ? '#3b82f6' : 'white', color: sessionFilter === 'mardi_matin' ? 'white' : '#64748b', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Mardi Matin
        </button>
        <button 
          className={`session-filter-btn ${sessionFilter === 'mercredi_matin' ? 'active' : ''}`}
          onClick={() => setSessionFilter('mercredi_matin')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: sessionFilter === 'mercredi_matin' ? 'none' : '1px solid #e2e8f0', background: sessionFilter === 'mercredi_matin' ? '#3b82f6' : 'white', color: sessionFilter === 'mercredi_matin' ? 'white' : '#64748b', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Mercredi Matin
        </button>
        <button 
          className={`session-filter-btn ${sessionFilter === 'mercredi_amidi' ? 'active' : ''}`}
          onClick={() => setSessionFilter('mercredi_amidi')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: sessionFilter === 'mercredi_amidi' ? 'none' : '1px solid #e2e8f0', background: sessionFilter === 'mercredi_amidi' ? '#3b82f6' : 'white', color: sessionFilter === 'mercredi_amidi' ? 'white' : '#64748b', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Mercredi A.Midi
        </button>
        <button 
          className={`session-filter-btn ${sessionFilter === 'samedi_matin' ? 'active' : ''}`}
          onClick={() => setSessionFilter('samedi_matin')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: sessionFilter === 'samedi_matin' ? 'none' : '1px solid #e2e8f0', background: sessionFilter === 'samedi_matin' ? '#3b82f6' : 'white', color: sessionFilter === 'samedi_matin' ? 'white' : '#64748b', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Samedi Matin
        </button>
        <button 
          className={`session-filter-btn ${sessionFilter === 'samedi_amidi' ? 'active' : ''}`}
          onClick={() => setSessionFilter('samedi_amidi')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: sessionFilter === 'samedi_amidi' ? 'none' : '1px solid #e2e8f0', background: sessionFilter === 'samedi_amidi' ? '#3b82f6' : 'white', color: sessionFilter === 'samedi_amidi' ? 'white' : '#64748b', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Samedi A.Midi
        </button>
        <button 
          className={`session-filter-btn ${sessionFilter === 'dimanche_unique' ? 'active' : ''}`}
          onClick={() => setSessionFilter('dimanche_unique')}
          style={{ padding: '8px 16px', borderRadius: '20px', border: sessionFilter === 'dimanche_unique' ? 'none' : '1px solid #e2e8f0', background: sessionFilter === 'dimanche_unique' ? '#3b82f6' : 'white', color: sessionFilter === 'dimanche_unique' ? 'white' : '#64748b', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Dimanche Unique
        </button>
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
              <th className="th-mardi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('mardi_matin', 'MATIN', 'MARDI')}>MATIN</span>
                  <span className="session-count-label">{getStudentsForSession('mardi_matin').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('mardi_matin') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('mardi_matin')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'mardi_matin' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('mardi_matin') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-mercredi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('mercredi_matin', 'MATIN', 'MERCREDI')}>MATIN</span>
                  <span className="session-count-label">{getStudentsForSession('mercredi_matin').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('mercredi_matin') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('mercredi_matin')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'mercredi_matin' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('mercredi_matin') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-mercredi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('mercredi_amidi', 'A.MIDI', 'MERCREDI')}>A.MIDI</span>
                  <span className="session-count-label">{getStudentsForSession('mercredi_amidi').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('mercredi_amidi') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('mercredi_amidi')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'mercredi_amidi' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('mercredi_amidi') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-samedi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('samedi_matin', 'MATIN', 'SAMEDI')}>MATIN</span>
                  <span className="session-count-label">{getStudentsForSession('samedi_matin').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('samedi_matin') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('samedi_matin')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'samedi_matin' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('samedi_matin') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-samedi">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('samedi_amidi', 'A.MIDI', 'SAMEDI')}>A.MIDI</span>
                  <span className="session-count-label">{getStudentsForSession('samedi_amidi').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('samedi_amidi') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('samedi_amidi')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'samedi_amidi' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {isSessionFinished('samedi_amidi') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
              <th className="th-dimanche">
                <div className="session-header">
                  <span className="session-label-btn" onClick={() => openSessionModal('dimanche_unique', 'UNIQUE', 'DIMANCHE')}>UNIQUE</span>
                  <span className="session-count-label">{getStudentsForSession('dimanche_unique').length} élèves</span>
                  <button
                    className={`btn-term ${isSessionFinished('dimanche_unique') ? 'finished' : ''} ${loadingSession ? 'working' : ''}`}
                    onClick={() => handleFinish('dimanche_unique')}
                    disabled={selectedWeekData || !!loadingSession}
                  >
                    {loadingSession === 'dimanche_unique' ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                    {(isSessionFinished('dimanche_unique') || loadingSession === 'dimanche_unique') ? 'TERMINE' : 'TERMINER'}
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // --- Skeleton Loading State ---
              Array.from({ length: itemsPerPage }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td>
                    <div className="student-info-cell" style={{ gap: '15px' }}>
                      <div className="skeleton skeleton-avatar"></div>
                      <div className="student-details" style={{ gap: '6px' }}>
                        <div className="skeleton skeleton-text" style={{ width: '120px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '80px', height: '10px' }}></div>
                      </div>
                    </div>
                  </td>
                  {/* Attendance Checkboxes Skeleton */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <td key={`sk-check-${i}`}>
                      <div className="skeleton skeleton-box"></div>
                    </td>
                  ))}
                  {/* Cycle Skeleton */}
                  <td>
                    <div className="cycle-tracker">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={`sk-dot-${i}`} className="skeleton skeleton-dot"></div>
                      ))}
                    </div>
                  </td>
                  {/* Payment Skeleton */}
                  <td>
                    <div className="skeleton skeleton-select"></div>
                  </td>
                  {/* Annotations Skeleton */}
                  <td>
                    <div className="skeleton skeleton-input"></div>
                  </td>
                  {/* Actions Skeleton */}
                  <td>
                    <div className="action-btns">
                      <div className="skeleton skeleton-icon"></div>
                      <div className="skeleton skeleton-icon"></div>
                      <div className="skeleton skeleton-icon"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontWeight: 'bold' }}>
                  Aucun étudiant trouvé.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr 
                  key={student._id}
                  className={student.paymentStatus === 'Payer / تم الخلاص' ? 'row-payer' : ''}
                >
                <td>
                  <div className="student-info-cell">
                    <div className="student-avatar">
                      {student.name[0]}
                      {(() => {
                        const maxS = isSundayOnly(student.planning) ? 5 : 8;
                        return student.totalSessionsCount > 0 && student.totalSessionsCount % maxS === 0 && (
                          <div className="cycle-indicator" title="Cycle terminé !">!</div>
                        );
                      })()}
                    </div>
                    <div className="student-details">
                      <strong>{student.name}</strong>
                      <span>{student.tarif} DT / {isSundayOnly(student.planning) ? '5' : '8'} Séances</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.mardi?.matin ? 'disabled' : ''} ${isPresent(student, 'mardi_matin') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mardi_matin' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.mardi?.matin && handleCheckClick(student._id, 'mardi_matin')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mardi_matin' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.mercredi?.matin ? 'disabled' : ''} ${isPresent(student, 'mercredi_matin') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_matin' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.mercredi?.matin && handleCheckClick(student._id, 'mercredi_matin')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_matin' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.mercredi?.amidi ? 'disabled' : ''} ${isPresent(student, 'mercredi_amidi') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_amidi' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.mercredi?.amidi && handleCheckClick(student._id, 'mercredi_amidi')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'mercredi_amidi' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.samedi?.matin ? 'disabled' : ''} ${isPresent(student, 'samedi_matin') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_matin' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.samedi?.matin && handleCheckClick(student._id, 'samedi_matin')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_matin' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.samedi?.amidi ? 'disabled' : ''} ${isPresent(student, 'samedi_amidi') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_amidi' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.samedi?.amidi && handleCheckClick(student._id, 'samedi_amidi')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'samedi_amidi' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div
                    className={`attendance-check ${!student.planning?.dimanche?.unique ? 'disabled' : ''} ${isPresent(student, 'dimanche_unique') ? 'present' : ''} ${loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'dimanche_unique' ? 'loading' : ''}`}
                    onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && student.planning?.dimanche?.unique && handleCheckClick(student._id, 'dimanche_unique')}
                  >
                    {loadingCheck?.studentId === student._id && loadingCheck?.sessionKey === 'dimanche_unique' && <Loader2 size={12} className="check-spinner" />}
                  </div>
                </td>
                <td>
                  <div className="cycle-tracker">
                    {(() => {
                      const maxS = isSundayOnly(student.planning) ? 5 : 8;
                      const history = student.cycleHistory || [];
                      const overrides = student.historyOverrides || {};
                      
                      let lastIndex = -1;
                      // Max 24 months, check every possible dot
                      for (let i = 0; i < 24 * maxS; i++) {
                        const t = overrides[i] || history[i]?.type;
                        if (t && t !== 'deleted' && t !== 'empty-trigger') {
                          lastIndex = i;
                        }
                      }
                      
                      let targetMonthIndex = 0;
                      if (lastIndex !== -1) {
                        targetMonthIndex = Math.floor(lastIndex / maxS);
                      }
                      
                      const dots = [];
                      for (let i = 0; i < maxS; i++) {
                        let statusClass = '';
                        const historyIndex = targetMonthIndex * maxS + i;
                        const session = history[historyIndex];
                        const effectiveType = overrides[historyIndex] || session?.type;
                        
                        if (effectiveType && effectiveType !== 'deleted' && effectiveType !== 'empty-trigger') {
                          if (effectiveType === 'present') {
                            statusClass = 'attended';
                          } else if (effectiveType === 'compensated') {
                            statusClass = 'compensated';
                          } else {
                            statusClass = 'missed';
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
                      const maxS = isSundayOnly(student.planning) ? 5 : 8;
                      const history = student.cycleHistory || [];
                      const overrides = student.historyOverrides || {};
                      
                      let lastIndex = -1;
                      for (let i = 0; i < 24 * maxS; i++) {
                        const t = overrides[i] || history[i]?.type;
                        if (t && t !== 'deleted' && t !== 'empty-trigger') {
                          lastIndex = i;
                        }
                      }
                      
                      const actualTotalCount = lastIndex !== -1 ? lastIndex + 1 : 0;
                      const totalCount = Math.max(Number(student.totalSessionsCount || 0), actualTotalCount);
                      const paidCount = Number(student.paidSessionsCount || 0);
                      const tarif = student.tarif || 80;
                      const debtNodes = [];

                      let hasPartialDebt = false;
                      let actualRemainder = 0;

                      if (student.paymentStatus === "Payer Partiellement / دفع جزئي") {
                        const moneyReceivedTotal = student.totalMoneyPaid || 0;
                        actualRemainder = (moneyReceivedTotal % tarif === 0 && moneyReceivedTotal > 0) ? 0 : (tarif - (moneyReceivedTotal % tarif));
                        if (actualRemainder > 0 && actualRemainder < tarif) {
                          hasPartialDebt = true;
                        }
                      }

                      const hasUnpaidSessions = totalCount > paidCount;
                      const unpaidSessions = totalCount - paidCount;

                      if (hasPartialDebt && hasUnpaidSessions) {
                        debtNodes.push(
                          <div key="combined" className="payment-warning-container partial">
                            <span className="payment-warning">{unpaidSessions} séances sans paiement !</span>
                            <span className="debt-info">Reste: {actualRemainder} DT</span>
                          </div>
                        );
                      } else if (hasPartialDebt) {
                        debtNodes.push(
                          <div key="partial" className="payment-warning-container partial">
                            <span className="debt-info">Reste: {actualRemainder} DT</span>
                          </div>
                        );
                      } else if (hasUnpaidSessions) {
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
            )))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="modern-pagination">
          <button className="page-nav-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
            Précédent
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page} 
                className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button className="page-nav-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Suivant
          </button>
        </div>
      )}

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
                <button
                  className={`btn-term-modal ${isSessionFinished(sessionModal.sessionKey) ? 'finished' : ''}`}
                  onClick={() => handleFinish(sessionModal.sessionKey)}
                  disabled={selectedWeekData || !!loadingSession}
                >
                  {loadingSession === sessionModal.sessionKey ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                  {isSessionFinished(sessionModal.sessionKey) ? 'CLÔTURÉ' : 'TERMINER LA SÉANCE'}
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

                    <div className="session-student-attendance-actions">
                      <button
                        className={`btn-attendance present ${isPresent(s, sessionModal.sessionKey) ? 'active' : ''}`}
                        onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && !isPresent(s, sessionModal.sessionKey) && handleCheckClick(s._id, sessionModal.sessionKey)}
                        disabled={loadingCheck?.studentId === s._id || isSessionFinished(sessionModal.sessionKey) || selectedWeekData}
                      >
                        <div className="icon-box"></div>
                        <span>Présent</span>
                      </button>
                      <button
                        className={`btn-attendance absent ${!isPresent(s, sessionModal.sessionKey) ? 'active' : ''}`}
                        onClick={() => !isArchivesView && !selectedWeekData && !loadingCheck && isPresent(s, sessionModal.sessionKey) && handleCheckClick(s._id, sessionModal.sessionKey)}
                        disabled={loadingCheck?.studentId === s._id || isSessionFinished(sessionModal.sessionKey) || selectedWeekData}
                      >
                        <div className="icon-box">{!isPresent(s, sessionModal.sessionKey) && <X size={14} strokeWidth={3} />}</div>
                        <span>Absent</span>
                      </button>
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
