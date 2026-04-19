import React from 'react';
import { Users, TrendingUp, Wallet, Clock, FileDown } from 'lucide-react';
import './FinancePage.css';

const FinancePage = ({ students }) => {
  // Statistics Calculations
  const totalStudents = students.length;

  const recettesReelles = students.reduce((sum, s) => sum + (s.totalMoneyPaid || 0), 0);

  const montantGlobalPrevu = students.reduce((sum, s) => sum + (s.tarif || 0), 0);

  const resteARecouvrer = Math.max(0, montantGlobalPrevu - recettesReelles);

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const currentYear = new Date().getFullYear();

  // For the monthly report, in a real scenario we would need a separate 'payments' collection with timestamps.
  // For this demonstration, we'll show grouped data if possible, or placeholders as in the screenshot.
  const getMonthlyTotal = (monthIndex) => {
    // Placeholder logic or filtering by inscription month if needed
    // In this version, we'll keep it simple to match the "0 DT" style if no monthly data exists
    return 0;
  };

  return (
    <div className="finance-container">
      <div className="finance-header">
        <div className="header-text">
          <h1>Finances & Rapports</h1>
          <p>Suivi du chiffre d'affaires, paiements et recouvrements.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalStudents}</span>
            <span className="stat-label">EFFECTIF TOTAL</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon receipts">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{recettesReelles} DT</span>
            <span className="stat-label">RECETTES RÉELLES (ENCAISSÉ)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon global">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{montantGlobalPrevu} DT</span>
            <span className="stat-label">MONTANT GLOBAL (PRÉVU)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon debt">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{resteARecouvrer} DT</span>
            <span className="stat-label">RESTE À RECOUVRER (DETTES)</span>
          </div>
        </div>
      </div>

      <div className="report-section">
        <div className="report-header">
          <div className="report-title">
            <span className="dot"></span>
            <h2>RAPPORT MENSUEL DES REVENUS</h2>
          </div>
          <button className="btn-export">
            <FileDown size={18} /> Exporter Rapport
          </button>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>MOIS / الشهر</th>
                <th>ANNÉE / السنة</th>
                <th>TOTAL REVENUS / مجموع المداخيل</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month, index) => {
                const total = getMonthlyTotal(index);
                return (
                  <tr key={month}>
                    <td><strong>{month}</strong></td>
                    <td>{currentYear}</td>
                    <td>{total} DT</td>
                    <td>
                      <span className={`status-badge ${total > 0 ? 'active' : 'empty'}`}>
                        {total > 0 ? 'COMPLET' : 'VIDE'}
                      </span>
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

export default FinancePage;
