import React, { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Wallet,
  Clock,
  FileDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  Search,
  Award,
  Sparkles,
  ArrowUpRight,
  X
} from 'lucide-react';
import './FinancePage.css';

const MONTHS_CONFIG = [
  { index: 0, fr: "Janvier", ar: "جانفي / يناير", short: "Jan" },
  { index: 1, fr: "Février", ar: "فيفري / فبراير", short: "Fév" },
  { index: 2, fr: "Mars", ar: "مارس", short: "Mar" },
  { index: 3, fr: "Avril", ar: "أفريل / أبريل", short: "Avr" },
  { index: 4, fr: "Mai", ar: "ماي / مايو", short: "Mai" },
  { index: 5, fr: "Juin", ar: "جوان / يونيو", short: "Juin" },
  { index: 6, fr: "Juillet", ar: "جويلية / يوليو", short: "Juil" },
  { index: 7, fr: "Août", ar: "أوت / أغسطس", short: "Août" },
  { index: 8, fr: "Septembre", ar: "سبتمبر", short: "Sep" },
  { index: 9, fr: "Octobre", ar: "أكتوبر", short: "Oct" },
  { index: 10, fr: "Novembre", ar: "نوفمبر", short: "Nov" },
  { index: 11, fr: "Décembre", ar: "ديسمبر", short: "Déc" },
];

const FinancePage = ({
  students = [],
  onAddPayment,
  onDeletePayment,
  customAlert,
  customConfirm
}) => {
  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentRealYear);
  const [activeMonthModalIndex, setActiveMonthModalIndex] = useState(null);
  const [monthSearchQuery, setMonthSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Payment Form State (if needed)
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [paymentDate, setPaymentDate] = useState(now.toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Paiement Mensuel / خلاص شهري');
  const [paymentMonthNumber, setPaymentMonthNumber] = useState(1);
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // 1. Extract and normalize all payment transactions across students
  const allTransactions = useMemo(() => {
    const list = [];
    students.forEach(student => {
      if (student.payments && Array.isArray(student.payments) && student.payments.length > 0) {
        student.payments.forEach(p => {
          if (!p || !p.date) return;
          const pDate = new Date(p.date);
          if (isNaN(pDate.getTime())) return;
          list.push({
            id: p._id || p.id || `${student._id}-${pDate.getTime()}-${Math.random()}`,
            rawId: p._id || p.id,
            studentId: student._id,
            studentName: student.name || 'Élève',
            studentPhone: student.phone || '',
            date: pDate,
            amount: Number(p.amount) || 0,
            type: p.type || "Paiement Mensuel / خلاص شهري",
            note: p.note || '',
            month: p.month
          });
        });
      } else if ((student.totalMoneyPaid || 0) > 0) {
        // Fallback for students with money recorded prior to explicit transaction logs
        const fallbackDate = new Date(student.inscriptionDate || student.createdAt || now);
        const validDate = isNaN(fallbackDate.getTime()) ? now : fallbackDate;
        list.push({
          id: `legacy-${student._id}`,
          rawId: `legacy-${student._id}`,
          studentId: student._id,
          studentName: student.name || 'Élève',
          studentPhone: student.phone || '',
          date: validDate,
          amount: Number(student.totalMoneyPaid) || 0,
          type: student.paymentStatus?.includes('Partiel')
            ? "Paiement Partiel / خلاص جزئي"
            : "Frais d'inscription / خلاص مسجل",
          note: "Paiement initial enregistré",
          month: (student.paidMonths && student.paidMonths[0]) || 1
        });
      }
    });
    return list;
  }, [students]);

  // 2. Determine all available years from transactions
  const availableYears = useMemo(() => {
    const yearSet = new Set();
    yearSet.add(currentRealYear);
    allTransactions.forEach(tx => {
      const y = tx.date.getFullYear();
      if (!isNaN(y)) yearSet.add(y);
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [allTransactions, currentRealYear]);

  // 3. Calculate 12-month data for the selected year
  const monthlyData = useMemo(() => {
    return MONTHS_CONFIG.map(m => {
      const monthTransactions = allTransactions.filter(tx => {
        return tx.date.getFullYear() === selectedYear && tx.date.getMonth() === m.index;
      }).sort((a, b) => b.date - a.date);

      const totalRevenue = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const uniqueStudentIds = new Set(monthTransactions.map(tx => tx.studentId));

      return {
        ...m,
        year: selectedYear,
        transactions: monthTransactions,
        totalRevenue,
        txCount: monthTransactions.length,
        studentCount: uniqueStudentIds.size,
        isCurrentMonth: selectedYear === currentRealYear && m.index === currentRealMonth
      };
    });
  }, [allTransactions, selectedYear, currentRealYear, currentRealMonth]);

  // Active month data for the pop-up modal
  const activeMonthData = useMemo(() => {
    if (activeMonthModalIndex === null) return null;
    return monthlyData.find(m => m.index === activeMonthModalIndex) || null;
  }, [monthlyData, activeMonthModalIndex]);

  // Filtered transactions inside the active month modal
  const filteredMonthTransactions = useMemo(() => {
    if (!activeMonthData) return [];
    if (!monthSearchQuery.trim()) return activeMonthData.transactions;
    const q = monthSearchQuery.toLowerCase();
    return activeMonthData.transactions.filter(tx =>
      tx.studentName.toLowerCase().includes(q) ||
      (tx.studentPhone && tx.studentPhone.includes(q)) ||
      (tx.note && tx.note.toLowerCase().includes(q)) ||
      (tx.type && tx.type.toLowerCase().includes(q))
    );
  }, [activeMonthData, monthSearchQuery]);

  // 4. Yearly Totals & Analytics
  const yearlyAnalytics = useMemo(() => {
    const yearTotalRevenue = monthlyData.reduce((sum, m) => sum + m.totalRevenue, 0);
    const yearTotalTxCount = monthlyData.reduce((sum, m) => sum + m.txCount, 0);

    const activeMonths = monthlyData.filter(m => m.totalRevenue > 0);
    const avgMonthly = activeMonths.length > 0
      ? Math.round(yearTotalRevenue / activeMonths.length)
      : 0;

    let bestMonth = null;
    let maxRev = 0;
    monthlyData.forEach(m => {
      if (m.totalRevenue > maxRev) {
        maxRev = m.totalRevenue;
        bestMonth = m;
      }
    });

    const activeStudents = students.filter(s => !s.isArchived);
    const totalStudentsCount = activeStudents.length;
    const globalExpected = activeStudents.reduce((sum, s) => sum + (s.tarif || 0), 0);
    const allTimeCollected = activeStudents.reduce((sum, s) => sum + (s.totalMoneyPaid || 0), 0);
    const resteARecouvrer = Math.max(0, globalExpected - allTimeCollected);

    return {
      yearTotalRevenue,
      yearTotalTxCount,
      avgMonthly,
      bestMonth,
      totalStudentsCount,
      globalExpected,
      resteARecouvrer,
      maxMonthlyRevenue: maxRev || 1
    };
  }, [monthlyData, students]);

  // Open Month Details Modal
  const handleOpenMonthDetails = (monthIndex) => {
    setMonthSearchQuery('');
    setActiveMonthModalIndex(monthIndex);
  };

  // Close Month Details Modal
  const handleCloseMonthDetails = () => {
    setActiveMonthModalIndex(null);
    setMonthSearchQuery('');
  };

  // Delete payment
  const handleDeleteTransaction = async (tx) => {
    if (onDeletePayment) {
      await onDeletePayment(tx.studentId, tx.rawId);
    }
  };

  // Export to CSV with UTF-8 BOM for Excel
  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Mois;Année;Total Revenus (DT);Nombre d'Opérations;Nombre d'Élèves;Statut\n";

    monthlyData.forEach(m => {
      const statut = m.totalRevenue > 0 ? "PAYÉ / مداخيل مسجلة" : "VIDE / فارغ";
      csvContent += `"${m.fr} / ${m.ar}";"${m.year}";"${m.totalRevenue}";"${m.txCount}";"${m.studentCount}";"${statut}"\n`;
    });

    csvContent += `\n"TOTAL ANNUEL ${selectedYear}";"";"${yearlyAnalytics.yearTotalRevenue} DT";"${yearlyAnalytics.yearTotalTxCount} opérations";"";""\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rapport_Revenus_Taher_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="finance-container">
      {/* Printable Header (Visible only when printing) */}
      <div className="print-only-header">
        <h1>Centre Taher - Rapport Financier Annuel {selectedYear}</h1>
        <p>Généré le {now.toLocaleDateString('fr-FR')} - Suivi détaillé des encaissements par date</p>
      </div>

      {/* Main Header */}
      <div className="finance-header">
        <div className="header-text">
          <div className="header-badge">
            <Sparkles size={14} />
            <span>Gestion Financière Avancée</span>
          </div>
          <h1>Finances & Chiffre d'Affaires</h1>
          <p>Suivi précis des paiements et répartition des revenus selon la date de chaque opération de خلاص.</p>
        </div>

        <div className="header-actions">
          {/* Year Switcher */}
          <div className="year-navigator">
            <button
              className="year-btn"
              onClick={() => setSelectedYear(prev => prev - 1)}
              title="Année précédente"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="year-display">
              <Calendar size={16} />
              <span>{selectedYear}</span>
            </div>
            <button
              className="year-btn"
              onClick={() => setSelectedYear(prev => prev + 1)}
              title="Année suivante"
            >
              <ChevronRight size={18} />
            </button>

            {selectedYear !== currentRealYear && (
              <button
                className="year-reset-pill"
                onClick={() => setSelectedYear(currentRealYear)}
              >
                Aujourd'hui ({currentRealYear})
              </button>
            )}
          </div>

          <button
            className="btn-export-dropdown"
            onClick={handleExportCSV}
            title="Exporter le rapport au format Excel / CSV"
          >
            <FileDown size={18} />
            <span>Exporter CSV</span>
          </button>

          <button
            className="btn-print"
            onClick={handlePrint}
            title="Imprimer le rapport"
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Top Analytics Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue-highlight">
          <div className="stat-icon-wrapper receipts">
            <TrendingUp size={26} />
          </div>
          <div className="stat-info">
            <div className="stat-amount-row">
              <span className="stat-value">{yearlyAnalytics.yearTotalRevenue.toLocaleString()} DT</span>
              <span className="stat-year-tag">{selectedYear}</span>
            </div>
            <span className="stat-label">TOTAL ENCAISSÉ ({selectedYear}) / مجموع المداخيل</span>
            <span className="stat-sub">
              {yearlyAnalytics.yearTotalTxCount} opérations de خلاص enregistrées
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper best">
            <Award size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {yearlyAnalytics.bestMonth
                ? `${yearlyAnalytics.bestMonth.fr} (${yearlyAnalytics.bestMonth.totalRevenue} DT)`
                : '--'}
            </span>
            <span className="stat-label">MEILLEUR MOIS / أعلى شهر مداخيل</span>
            <span className="stat-sub">
              {yearlyAnalytics.bestMonth ? `${yearlyAnalytics.bestMonth.txCount} transactions` : 'Aucun encaissement'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper global">
            <Wallet size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{yearlyAnalytics.avgMonthly.toLocaleString()} DT</span>
            <span className="stat-label">MOYENNE MENSUELLE / المعدل الشهري</span>
            <span className="stat-sub">Sur les mois avec encaissements</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper debt">
            <Clock size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{yearlyAnalytics.resteARecouvrer.toLocaleString()} DT</span>
            <span className="stat-label">RESTE À RECOUVRER (DETTES) / ديون متبقية</span>
            <span className="stat-sub">Sur {yearlyAnalytics.totalStudentsCount} élèves actifs</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Bar Spectrum */}
      <div className="revenue-chart-card">
        <div className="chart-header">
          <div className="chart-title">
            <TrendingUp size={18} />
            <h3>Aperçu Visuel des Revenus Mensuels ({selectedYear})</h3>
          </div>
          <span className="chart-legend">
            انقر على أي شهر لفتح نافذة التفاصيل وعمليات الخلاص
          </span>
        </div>

        <div className="bars-container">
          {monthlyData.map((m) => {
            const heightPercent = yearlyAnalytics.maxMonthlyRevenue > 0
              ? Math.max(8, Math.round((m.totalRevenue / yearlyAnalytics.maxMonthlyRevenue) * 100))
              : 8;

            return (
              <div
                key={m.index}
                className={`bar-column ${m.totalRevenue > 0 ? 'has-revenue' : 'empty'} ${m.isCurrentMonth ? 'current-month-bar' : ''}`}
                onClick={() => handleOpenMonthDetails(m.index)}
                title={`${m.fr}: ${m.totalRevenue} DT (${m.txCount} transactions) - انقر لفتح النافذة`}
              >
                <div className="bar-tooltip">
                  <strong>{m.fr}</strong>
                  <span>{m.totalRevenue} DT</span>
                  <small>{m.txCount} خلاص (انقر للعرض)</small>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {m.totalRevenue > 0 && (
                      <span className="bar-value-pill">{m.totalRevenue}</span>
                    )}
                  </div>
                </div>

                <div className="bar-label">
                  <span className="month-short">{m.short}</span>
                  {m.isCurrentMonth && <span className="current-dot"></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Monthly Report Section */}
      <div className="report-section">
        <div className="report-header">
          <div className="report-title">
            <span className="dot pulse"></span>
            <div>
              <h2>RAPPORT MENSUEL DES REVENUS / تقرير المداخيل الشهرية</h2>
              <span className="report-subtitle">
                انقر على أي سطر لفتح نافذة تفاصيل عمليات الخلاص لشهر معين ({selectedYear})
              </span>
            </div>
          </div>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th className="th-month">MOIS / الشهر</th>
                <th className="th-year">ANNÉE / السنة</th>
                <th className="th-ops">OPÉRATIONS / العمليات</th>
                <th className="th-revenue">TOTAL REVENUS / مجموع المداخيل</th>
                <th className="th-status">STATUT / الحالة</th>
                <th className="th-actions">DÉTAILS / التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m) => {
                const pctOfYear = yearlyAnalytics.yearTotalRevenue > 0
                  ? ((m.totalRevenue / yearlyAnalytics.yearTotalRevenue) * 100).toFixed(0)
                  : 0;

                return (
                  <tr
                    key={m.index}
                    className={`month-row ${m.isCurrentMonth ? 'current-month-row' : ''} ${m.totalRevenue > 0 ? 'has-data-row' : ''}`}
                    onClick={() => handleOpenMonthDetails(m.index)}
                    title={`انقر لفتح نافذة تفاصيل شهر ${m.fr}`}
                  >
                    {/* Month Name */}
                    <td className="td-month">
                      <div className="month-cell-content">
                        <span className="month-number-badge">
                          {String(m.index + 1).padStart(2, '0')}
                        </span>
                        <div className="month-titles">
                          <strong className="month-fr">{m.fr}</strong>
                          <span className="month-ar">{m.ar}</span>
                        </div>
                        {m.isCurrentMonth && (
                          <span className="current-month-tag">Ce mois / هذا الشهر</span>
                        )}
                      </div>
                    </td>

                    {/* Year */}
                    <td className="td-year">
                      <span className="year-pill">{m.year}</span>
                    </td>

                    {/* Operations Count */}
                    <td className="td-ops">
                      {m.txCount > 0 ? (
                        <div className="ops-info">
                          <span className="ops-count-badge">
                            {m.txCount} {m.txCount > 1 ? 'opérations' : 'opération'}
                          </span>
                          <span className="ops-sub">
                            ({m.studentCount} {m.studentCount > 1 ? 'élèves' : 'élève'})
                          </span>
                        </div>
                      ) : (
                        <span className="no-ops-text">--</span>
                      )}
                    </td>

                    {/* Total Revenue */}
                    <td className="td-revenue">
                      <div className="revenue-cell">
                        <div className="revenue-amount">
                          <span className="currency-val">{m.totalRevenue.toLocaleString()}</span>
                          <span className="currency-unit">DT</span>
                        </div>
                        {m.totalRevenue > 0 && yearlyAnalytics.yearTotalRevenue > 0 && (
                          <div className="revenue-share-bar" title={`${pctOfYear}% du total annuel`}>
                            <div
                              className="revenue-share-fill"
                              style={{ width: `${Math.min(100, Math.max(5, pctOfYear))}%` }}
                            ></div>
                            <span className="share-text">{pctOfYear}%</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="td-status">
                      <span className={`status-badge ${m.totalRevenue > 0 ? 'active' : 'empty'}`}>
                        {m.totalRevenue > 0 ? (
                          <>
                            <span className="status-dot-inner active"></span>
                            PAYÉ / مداخيل مسجلة
                          </>
                        ) : (
                          <>
                            <span className="status-dot-inner empty"></span>
                            VIDE / فارغ
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-view-month-modal"
                        onClick={() => handleOpenMonthDetails(m.index)}
                        title="فتح نافذة التفاصيل"
                      >
                        <span>التفاصيل</span>
                        <ArrowUpRight size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================================================
          MODAL: POPUP DÉTAILS DU MOIS (نافذة تفاصيل خلاص الشهر)
         ========================================================================== */}
      {activeMonthData && (
        <div className="finance-modal-overlay" onClick={handleCloseMonthDetails}>
          <div className="month-details-modal-window" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="month-modal-header">
              <div className="modal-header-main">
                <div className="modal-month-badge">
                  {String(activeMonthData.index + 1).padStart(2, '0')}
                </div>
                <div className="modal-month-titles">
                  <div className="modal-title-row">
                    <h2>{activeMonthData.fr} {activeMonthData.year}</h2>
                    <span className="modal-month-ar">{activeMonthData.ar}</span>
                    {activeMonthData.isCurrentMonth && (
                      <span className="modal-current-badge">Ce mois / هذا الشهر</span>
                    )}
                  </div>
                  <p className="modal-subtitle">
                    تفاصيل وسجل عمليات الخلاص المسجلة لهذا الشهر حسب التاريخ الحقيقي لكل دفعة
                  </p>
                </div>
              </div>

              <button
                className="modal-close-icon-btn"
                onClick={handleCloseMonthDetails}
                title="إغلاق النافذة"
              >
                <X size={22} />
              </button>
            </div>

            {/* KPI Summary Strip */}
            <div className="month-modal-kpi-grid">
              <div className="modal-kpi-card highlight-revenue">
                <div className="kpi-icon-pill receipts">
                  <TrendingUp size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-num">{activeMonthData.totalRevenue.toLocaleString()} DT</span>
                  <span className="kpi-title">مجموع المداخيل / TOTAL ENCAISSÉ</span>
                </div>
              </div>

              <div className="modal-kpi-card">
                <div className="kpi-icon-pill ops">
                  <CreditCard size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-num">{activeMonthData.txCount}</span>
                  <span className="kpi-title">عدد العمليات / TRANSACTIONS</span>
                </div>
              </div>

              <div className="modal-kpi-card">
                <div className="kpi-icon-pill students">
                  <Users size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-num">{activeMonthData.studentCount}</span>
                  <span className="kpi-title">التلاميذ / ÉLÈVES AYANT PAYÉ</span>
                </div>
              </div>

              <div className="modal-kpi-card">
                <div className="kpi-icon-pill share">
                  <Award size={20} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-num">
                    {yearlyAnalytics.yearTotalRevenue > 0
                      ? `${((activeMonthData.totalRevenue / yearlyAnalytics.yearTotalRevenue) * 100).toFixed(0)}%`
                      : '0%'}
                  </span>
                  <span className="kpi-title">المساهمة السنوية / DU TOTAL ANNUEL</span>
                </div>
              </div>
            </div>

            {/* Search Filter Strip if there are transactions */}
            {activeMonthData.transactions.length > 0 && (
              <div className="month-modal-toolbar">
                <div className="modal-search-field">
                  <Search size={16} className="search-ico" />
                  <input
                    type="text"
                    placeholder="بحث في عمليات هذا الشهر (اسم التلميذ، الهاتف، ملاحظة)..."
                    value={monthSearchQuery}
                    onChange={(e) => setMonthSearchQuery(e.target.value)}
                  />
                  {monthSearchQuery && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setMonthSearchQuery('')}
                      title="مسح البحث"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="search-counter-badge">
                  {filteredMonthTransactions.length} من أصل {activeMonthData.txCount} عملية
                </span>
              </div>
            )}

            {/* Transactions Body */}
            <div className="month-modal-body">
              {filteredMonthTransactions.length > 0 ? (
                <div className="month-tx-table-wrapper">
                  <table className="month-tx-table">
                    <thead>
                      <tr>
                        <th>التاريخ والوقت / DATE & HEURE</th>
                        <th>التلميذ / ÉLÈVE</th>
                        <th>نوع العملية / TYPE D'OPÉRATION</th>
                        <th>ملاحظات / NOTES</th>
                        <th>المبلغ / MONTANT</th>
                        <th>حذف / ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMonthTransactions.map((tx, txIdx) => {
                        const timeStr = tx.date.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const dateStr = tx.date.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        });

                        return (
                          <tr key={tx.id || txIdx}>
                            <td className="cell-tx-date">
                              <span className="tx-day-text">{dateStr}</span>
                              <span className="tx-hour-text">{timeStr}</span>
                            </td>
                            <td className="cell-tx-student">
                              <div className="tx-student-badge">
                                <div className="student-circle-avatar">
                                  {tx.studentName.charAt(0).toUpperCase()}
                                </div>
                                <div className="student-meta">
                                  <span className="student-full-name">{tx.studentName}</span>
                                  {tx.studentPhone && (
                                    <span className="student-phone-num">{tx.studentPhone}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="cell-tx-type">
                              <span className="type-badge-pill">
                                {tx.type}
                              </span>
                              {tx.month && (
                                <span className="cycle-month-pill">Mois {tx.month}</span>
                              )}
                            </td>
                            <td className="cell-tx-note">
                              <span className="note-text-snippet">
                                {tx.note || '--'}
                              </span>
                            </td>
                            <td className="cell-tx-amount">
                              <span className="revenue-amount-tag">
                                +{tx.amount} DT
                              </span>
                            </td>
                            <td className="cell-tx-action">
                              <button
                                className="tx-delete-action-btn"
                                onClick={() => handleDeleteTransaction(tx)}
                                title="حذف عملية الخلاص هذه"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : activeMonthData.transactions.length === 0 ? (
                <div className="modal-empty-state">
                  <AlertCircle size={44} className="empty-state-icon" />
                  <h4>لا توجد عمليات خلاص مسجلة في شهر {activeMonthData.fr} {activeMonthData.year}</h4>
                  <p>كل عملية خلاص تتم لتلميذ في هذا التاريخ ستظهر هنا تلقائياً بمبلغها وتفاصيلها.</p>
                </div>
              ) : (
                <div className="modal-empty-state">
                  <Search size={36} className="empty-state-icon" />
                  <h4>لا توجد نتائج مطابقة لبحثك "{monthSearchQuery}"</h4>
                  <p>تأكد من كتابة الاسم أو رقم الهاتف بشكل صحيح.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="month-modal-footer">
              <div className="footer-summary-text">
                إجمالي مداخيل شهر {activeMonthData.fr}: <strong>{activeMonthData.totalRevenue.toLocaleString()} DT</strong>
              </div>
              <button
                className="btn-modal-close-main"
                onClick={handleCloseMonthDetails}
              >
                إغلاق النافذة (Fermer)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
