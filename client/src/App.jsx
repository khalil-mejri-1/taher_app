import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AttendanceTable from './components/AttendanceTable';
import RegistrationModal from './components/RegistrationModal';
import StudentHistoryModal from './components/StudentHistoryModal';
import FinancePage from './components/FinancePage';
import NotificationModal from './components/NotificationModal';
import './index.css';

const BASE_URL = 'https://taher-app.vercel.app';
// const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/students`;

function App() {
  const [students, setStudents] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'archives'
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date('2026-04-07')); // Default to a Tuesday
  const [selectedWeekData, setSelectedWeekData] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: () => { },
    inputValue: '',
    placeholder: ''
  });

  const [lastPartialAmounts, setLastPartialAmounts] = useState({});

  const [finishedSessions, setFinishedSessions] = useState(() => {
    const saved = localStorage.getItem('finishedSessions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('finishedSessions', JSON.stringify(finishedSessions));
  }, [finishedSessions]);

  const customAlert = (title, message) => {
    setNotification({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: () => { }
    });
  };

  const customConfirm = (title, message) => {
    return new Promise((resolve) => {
      setNotification({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        onConfirm: () => resolve(true),
        onClose: () => {
          setNotification(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const customPrompt = (title, message, placeholder = '', initialValue = '', inputType = 'text') => {
    return new Promise((resolve) => {
      setNotification({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        placeholder,
        inputValue: initialValue,
        inputType,
        onConfirm: (val) => resolve(val),
        onClose: () => {
          setNotification(prev => ({ ...prev, isOpen: false }));
          resolve(null);
        }
      });
    });
  };

  useEffect(() => {
    fetchStudents();
    fetchWeeks();
  }, []);

  const fetchWeeks = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/weeks`);
      setWeeks(data);
    } catch (err) {
      console.error('Error fetching weeks:', err);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isSundayOnly = (p) => {
    if (!p) return false;
    return p.dimanche?.unique &&
      !p.mardi?.matin &&
      !p.mercredi?.matin && !p.mercredi?.amidi &&
      !p.samedi?.matin && !p.samedi?.amidi;
  };

  const handleSaveStudent = async (formData) => {
    try {
      const submissionData = { ...formData };
      const tarif = parseFloat(submissionData.tarif) || 80;

      // Handle direct archive registration
      if (submissionData.status === 'Archives') {
        submissionData.isArchived = true;
        submissionData.status = 'Actif'; // Reset status to Actif but keep archived flag
      } else {
        submissionData.isArchived = false;
      }

      const maxSessions = isSundayOnly(submissionData.planning) ? 5 : 8;

      if (submissionData.paymentStatus === "Payer Partiellement / دفع جزئي") {
        if (!editingStudent || submissionData.paidSessionsCount < maxSessions) {
          submissionData.paidSessionsCount = maxSessions;
        }
      } else if (submissionData.paymentStatus === "Payer / تم الخلاص") {
        if (!editingStudent || submissionData.paidSessionsCount < maxSessions) {
          submissionData.paidSessionsCount = maxSessions;
          submissionData.totalMoneyPaid = tarif;
          if (!submissionData.paidMonths?.includes(1)) {
            submissionData.paidMonths = [1];
          }
        }
      } else if (submissionData.paymentStatus === "Non Payer / لم يدفع بعد") {
        submissionData.paidSessionsCount = 0;
        submissionData.totalMoneyPaid = 0;
        submissionData.paidMonths = [];
      }

      if (editingStudent) {
        await axios.put(`${API_URL}/${editingStudent._id}`, submissionData);
      } else {
        await axios.post(API_URL, submissionData);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
    }
  };

  const handleFinishSession = async (sessionKey, isUndo = false) => {
    const day = sessionKey.split('_')[0];
    const sessionType = sessionKey.split('_')[1];

    const updates = students.map(async (student) => {
      // Check if student is assigned to this session
      if (student.planning?.[day]?.[sessionType]) {
        if (isUndo) {
          // Revert logic
          let newHistory = [...(student.cycleHistory || [])];
          // Find the last history item matching this session
          const lastIndex = newHistory.map(h => h.session).lastIndexOf(sessionKey);
          if (lastIndex > -1) {
            newHistory.splice(lastIndex, 1);
          }

          await axios.put(`${API_URL}/${student._id}`, {
            cycleHistory: newHistory,
            totalSessionsCount: Math.max(0, (student.totalSessionsCount || 1) - 1)
          });
        } else {
          // Finish logic
          const isPresent = student.attendance?.some(a => a.session === sessionKey && a.present);

          const newHistoryEntry = {
            session: sessionKey,
            date: new Date(),
            type: isPresent ? 'present' : 'absent'
          };

          const newHistory = [...(student.cycleHistory || []), newHistoryEntry];

          await axios.put(`${API_URL}/${student._id}`, {
            cycleHistory: newHistory,
            totalSessionsCount: (student.totalSessionsCount || 0) + 1
          });
        }
      }
    });

    try {
      await Promise.all(updates);
      fetchStudents();
      return true; // Indicate success to child
    } catch (err) {
      console.error('Error finishing session:', err);
      return false;
    }
  };

  const handleNewWeek = async (finishedSessions) => {
    try {
      await axios.post(`${BASE_URL}/api/weeks/save-and-reset`, {
        startDate: currentWeekDate,
        finishedSessions: finishedSessions
      });

      // Increment date by 7 days
      const nextWeek = new Date(currentWeekDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentWeekDate(nextWeek);

      await fetchStudents();
      await fetchWeeks();
      return true;
    } catch (err) {
      console.error('Error starting new week:', err);
      return false;
    }
  };

  const handleSelectWeek = (week) => {
    setSelectedWeekData(week);
  };

  const handleMarkAttendance = async (studentId, sessionKey) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    const existingAttendance = student.attendance || [];
    const index = existingAttendance.findIndex(a => a.session === sessionKey);

    let newAttendance = [...existingAttendance];
    let cycleChange = 0;

    if (index > -1) {
      // Toggle off
      newAttendance.splice(index, 1);
      cycleChange = -1;
    } else {
      // Toggle on
      newAttendance.push({ date: new Date(), session: sessionKey, present: true });
      cycleChange = 1;
    }

    const newCompleted = Math.max(0, Math.min(8, (student.cycle?.completed || 0) + cycleChange));

    try {
      await axios.put(`${API_URL}/${studentId}`, {
        attendance: newAttendance,
        cycle: { ...student.cycle, completed: newCompleted }
      });
      fetchStudents();
    } catch (err) {
      console.error('Error marking attendance:', err);
    }
  };

  const handleUpdatePayment = async (studentId, newStatus) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    const maxSessions = isSundayOnly(student.planning) ? 5 : 8;
    let updates = { paymentStatus: newStatus };
    let finalPaidCount = student.paidSessionsCount || 0;
    let finalMoneyPaid = student.totalMoneyPaid || 0;
    let effectiveTotalSessionsCount = student.totalSessionsCount || 0;
    const owesSessionsCount = Math.max(0, effectiveTotalSessionsCount - finalPaidCount);
    const visuallyNonPayer = owesSessionsCount > 0 && student.paymentStatus === "Payer / تم الخلاص";

    if (newStatus === "Payer Partiellement / دفع جزئي") {
      const defaultValue = lastPartialAmounts[studentId] || '';
      const amountStr = await customPrompt("Paiement Partiel", "Entrez le montant payé (DT) / أدخل المبلغ المدفوع:", "Ex: 40", defaultValue.toString());
      if (amountStr === null) return;
      const amount = parseFloat(amountStr) || 0;

      setLastPartialAmounts(prev => ({ ...prev, [studentId]: amount }));

      finalMoneyPaid += amount;
      updates.totalMoneyPaid = finalMoneyPaid;

      // Full session credit based on student planning
      finalPaidCount += maxSessions;
      updates.paidSessionsCount = finalPaidCount;

    } else if (newStatus === "Non Payer / لم يدفع بعد") {
      // Sync with Historique Modal: Remove current month from paidMonths
      const currentMonth = Math.floor((student.totalSessionsCount || 0) / (maxSessions + 0.01)) + 1;
      const existingPaidMonths = student.paidMonths || [];

      // Remove the current month specifically
      updates.paidMonths = existingPaidMonths.filter(m => m !== currentMonth);

      // Reset session credits to only previously fully paid months
      const previousMonthsPaidCount = (updates.paidMonths.length) * maxSessions;
      updates.paidSessionsCount = Math.min(student.paidSessionsCount, previousMonthsPaidCount);
      updates.totalMoneyPaid = Math.min(student.totalMoneyPaid, (updates.paidMonths.length) * (student.tarif || 80));

    } else if (newStatus === "Payer / تم الخلاص" && (student.paymentStatus !== newStatus || visuallyNonPayer)) {
      // Full payment based on student planning
      const tarif = student.tarif || 80;

      if (student.paymentStatus === "Payer Partiellement / دفع جزئي") {
        // Leave finalMoneyPaid and finalPaidCount exactly as they are.
      } else {
        finalMoneyPaid += tarif;
        finalPaidCount += maxSessions;
      }

      updates.totalMoneyPaid = finalMoneyPaid;
      updates.paidSessionsCount = finalPaidCount;

      // Sync with Historique Modal
      const monthToPay = Math.ceil(finalPaidCount / maxSessions);
      const existingPaidMonths = student.paidMonths || [];
      if (!existingPaidMonths.includes(monthToPay)) {
        updates.paidMonths = [...existingPaidMonths, monthToPay];
      }
    }

    // Auto-revert status if debt remains
    if ((student.totalSessionsCount || 0) > finalPaidCount) {
      updates.paymentStatus = "Non Payer / لم يدفع بعد";
      if (newStatus.includes("Payer")) {
        const sessionPrice = (student.tarif || 80) / maxSessions;
        customAlert("Paiement Enregistré");
      }
    }

    try {
      await axios.put(`${API_URL}/${studentId}`, updates);
      fetchStudents();
    } catch (err) {
      console.error('Error updating payment:', err);
    }
  };

  const handleToggleCompensated = async (studentId, historyIndex, fallbackType) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    let currentType = student.historyOverrides?.[historyIndex];
    if (!currentType) {
      if (student.cycleHistory && student.cycleHistory[historyIndex]) {
        currentType = student.cycleHistory[historyIndex].type;
      } else if (fallbackType === 'empty-trigger') {
        currentType = 'none';
      } else {
        currentType = fallbackType;
      }
    }

    if (!currentType) return;

    let nextType = 'present';
    if (currentType === 'present') nextType = 'absent';
    else if (currentType === 'absent') nextType = 'compensated';
    else if (currentType === 'compensated' || currentType === 'none') nextType = 'present';

    let totalAdjust = 0;
    let selectedDate = null;
    let newCycleHistory = [...(student.cycleHistory || [])];

    // If we are filling a previously empty or deleted slot
    if (fallbackType === 'empty-trigger') {
      totalAdjust = 1;

      // Prompt for date
      const today = new Date().toISOString().split('T')[0];
      const dateStr = await customPrompt("Date de la séance", "Veuillez choisir la date de cette حصة جديدة:", "", today, "date");
      if (!dateStr) return; // Cancelled
      selectedDate = new Date(dateStr);

      // Ensure history array is long enough by filling with dummy sessions if needed
      while (newCycleHistory.length <= historyIndex) {
        newCycleHistory.push({
          session: 'manual_add',
          date: selectedDate,
          type: 'absent' // Default for fill-ins
        });
      }
      // Set the specific one to nextType
      newCycleHistory[historyIndex] = {
        session: 'manual_add',
        date: selectedDate,
        type: nextType
      };
    } else {
      // Just toggle type in existing history if it exists
      if (newCycleHistory[historyIndex]) {
        newCycleHistory[historyIndex].type = nextType;
      }
    }

    const newOverrides = { ...(student.historyOverrides || {}), [historyIndex]: nextType };
    const newTotal = (student.totalSessionsCount || 0) + totalAdjust;

    try {
      const updateData = {
        historyOverrides: newOverrides,
        totalSessionsCount: newTotal,
        cycleHistory: newCycleHistory
      };

      await axios.put(`${API_URL}/${studentId}`, updateData);

      const updatedStudent = {
        ...student,
        ...updateData
      };

      setStudents(prev => prev.map(s => s._id === studentId ? updatedStudent : s));
      setSelectedStudentHistory(updatedStudent);

    } catch (err) {
      console.error('Error toggling compensated status:', err);
    }
  };

  const handleDeleteSessionHistory = async (studentId, historyIndex) => {
    const confirmed = await customConfirm("Supprimer la session", "Voulez-vous vraiment فسخ (effacer) cette session de l'historique ?");
    if (!confirmed) return;

    const student = students.find(s => s._id === studentId);
    if (!student) return;

    const hIdx = historyIndex;

    let newCycleHistory = [...(student.cycleHistory || [])];
    if (hIdx >= 0 && hIdx < newCycleHistory.length) {
      newCycleHistory.splice(hIdx, 1);
    }

    // Shift overrides to maintain alignment
    const oldOverrides = student.historyOverrides || {};
    const newOverrides = {};
    Object.keys(oldOverrides).forEach(key => {
      const k = parseInt(key);
      if (k < historyIndex) {
        newOverrides[k] = oldOverrides[k];
      } else if (k > historyIndex) {
        newOverrides[k - 1] = oldOverrides[k];
      }
    });

    const newTotalCount = Math.max(0, (student.totalSessionsCount || 0) - 1);

    try {
      await axios.put(`${API_URL}/${studentId}`, {
        historyOverrides: newOverrides,
        totalSessionsCount: newTotalCount,
        cycleHistory: newCycleHistory
      });

      const updatedStudent = {
        ...student,
        historyOverrides: newOverrides,
        totalSessionsCount: newTotalCount,
        cycleHistory: newCycleHistory
      };

      setStudents(prev => prev.map(s => s._id === studentId ? updatedStudent : s));
      setSelectedStudentHistory(updatedStudent);
    } catch (err) {
      console.error('Error deleting session history:', err);
    }
  };

  const handleToggleMonthlyPayment = async (studentId, monthNumber) => {
    const student = students.find(s => s._id === studentId);
    if (!student) return;

    const maxSessions = isSundayOnly(student.planning) ? 5 : 8;
    const currentPaidMonths = student.paidMonths || [];
    let newPaidMonths;
    let paidSessionsChange = 0;

    if (currentPaidMonths.includes(monthNumber)) {
      newPaidMonths = currentPaidMonths.filter(m => m !== monthNumber);
      paidSessionsChange = -maxSessions;
    } else {
      newPaidMonths = [...currentPaidMonths, monthNumber];
      paidSessionsChange = maxSessions;
    }

    const newPaidSessionsCount = Math.max(0, (student.paidSessionsCount || 0) + paidSessionsChange);

    // Auto update paymentStatus based on the new balance
    let newPaymentStatus = student.paymentStatus;
    if ((student.totalSessionsCount || 0) > newPaidSessionsCount) {
      newPaymentStatus = "Non Payer / لم يدفع بعد";
    } else {
      newPaymentStatus = "Payer / تم الخلاص";
    }

    try {
      const updates = {
        paidMonths: newPaidMonths,
        paidSessionsCount: newPaidSessionsCount,
        paymentStatus: newPaymentStatus
      };

      await axios.put(`${API_URL}/${studentId}`, updates);

      // Update local state
      setStudents(prev => prev.map(s => s._id === studentId ? { ...s, ...updates } : s));
      setSelectedStudentHistory(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error toggling monthly payment:', err);
    }
  };

  const handleUpdateNotes = async (studentId, notes) => {
    try {
      await axios.put(`${API_URL}/${studentId}`, { notes });
      setStudents(prev => prev.map(s => s._id === studentId ? { ...s, notes } : s));
    } catch (err) {
      console.error('Error updating notes:', err);
    }
  };

  const handleResetSessions = async () => {
    const confirmed = await customConfirm("Réinitialisation des Sessions", "Voulez-vous vraiment redémarrer toutes les sessions à zéro pour tous les étudiants ?");
    if (confirmed) {
      try {
        await axios.post(`${BASE_URL}/api/system/reset-sessions`);
        setFinishedSessions([]);
        localStorage.removeItem('finishedSessions');
        fetchStudents();
        fetchWeeks();
        customAlert("Succès", "Toutes les sessions ont été réinitialisées.");
      } catch (err) {
        console.error('Error resetting sessions:', err);
      }
    }
  };

  const handleResetAll = async () => {
    const confirmed = await customConfirm("Réinitialisation Totale", "ATTENTION: Cette action supprimera DÉFINITIVEMENT tous les étudiants et tout l'historique des semaines. Êtes-vous sûr ?");
    if (confirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/system/reset-all`);
        fetchStudents();
        fetchWeeks();
        customAlert("Succès", "Toutes les données ont été supprimées.");
      } catch (err) {
        console.error('Error resetting system:', err);
      }
    }
  };

  const handleArchiveStudent = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { isArchived: true });
      fetchStudents();
    } catch (err) {
      console.error('Error archiving student:', err);
    }
  };

  const handleUnarchiveStudent = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { isArchived: false, status: 'Actif' });
      fetchStudents();
    } catch (err) {
      console.error('Error unarchiving student:', err);
    }
  };

  const handleDeleteStudent = async (id) => {
    const confirmed = await customConfirm("Suppression", "Voulez-vous vraiment supprimer ce dossier ? Cette action est irréversible.");
    if (confirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchStudents();
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(s => {
    if (activeView === 'archives') return s.isArchived;
    if (activeView === 'dashboard') return !s.isArchived;
    return true;
  });

  const handleOpenModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="main-content">
        <Navbar onAddStudent={handleOpenModal} onResetSessions={handleResetSessions} />
        <div className="content-body">
          {activeView === 'finances' ? (
            <FinancePage students={students} />
          ) : (
            <AttendanceTable
              students={filteredStudents}
              isLoading={isLoading}
              isArchivesView={activeView === 'archives'}
              onArchive={handleArchiveStudent}
              onUnarchive={handleUnarchiveStudent}
              onDelete={handleDeleteStudent}
              onEdit={handleEditStudent}
              onMarkAttendance={handleMarkAttendance}
              onFinishSession={handleFinishSession}
              onNewWeek={handleNewWeek}
              finishedSessions={finishedSessions}
              setFinishedSessions={setFinishedSessions}
              currentWeekDate={currentWeekDate}
              onDateChange={setCurrentWeekDate}
              weeksHistory={weeks}
              onSelectHistoryWeek={handleSelectWeek}
              selectedWeekData={selectedWeekData}
              onCloseHistoryDetail={() => setSelectedWeekData(null)}
              onResetAll={handleResetAll}
              onUpdatePayment={handleUpdatePayment}
              onUpdateNotes={handleUpdateNotes}
              onViewHistory={(student) => {
                setSelectedStudentHistory(student);
                setIsHistoryModalOpen(true);
              }}
              onToggleCompensated={handleToggleCompensated}
              customAlert={customAlert}
              customConfirm={customConfirm}
            />
          )}
        </div>
      </main>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveStudent}
        initialData={editingStudent}
      />

      {isHistoryModalOpen && selectedStudentHistory && (
        <StudentHistoryModal
          student={selectedStudentHistory}
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          onToggleCompensated={handleToggleCompensated}
          onToggleMonthlyPayment={handleToggleMonthlyPayment}
          onDeleteSession={handleDeleteSessionHistory}
        />
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        placeholder={notification.placeholder}
        inputValue={notification.inputValue}
        inputType={notification.inputType}
        onConfirm={notification.onConfirm}
      />
    </div>
  );
}

export default App;
