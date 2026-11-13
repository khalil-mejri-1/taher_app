import React from 'react';
import { Plus, Menu, Users } from 'lucide-react';
import './Navbar.css';

const Navbar = ({
  onAddStudent,
  onToggleMenu,
  activeView,
  registeredStudentsCount = 0,
  archivedStudentsCount = 0,
  isLoading = false
}) => {
  const getTitle = () => {
    switch (activeView) {
      case 'finances': return 'Finances & Rapports';
      case 'archives': return 'Archives des Étudiants';
      default: return "Vue d'ensemble";
    }
  };

  const getSubtitle = () => {
    switch (activeView) {
      case 'finances': return 'Suivi du chiffre d\'affaires et des règlements';
      case 'archives': return 'Liste des dossiers d\'anciens étudiants';
      default: return 'Suivez la progression et les règlements en temps réel';
    }
  };

  const isArchives = activeView === 'archives';
  const displayCount = isArchives ? archivedStudentsCount : registeredStudentsCount;
  const displayLabel = isArchives
    ? (displayCount <= 1 ? 'Étudiant archivé' : 'Étudiants archivés')
    : (displayCount <= 1 ? 'Étudiant inscrit' : 'Étudiants inscrits');

  const tooltipText = `${registeredStudentsCount} étudiant${registeredStudentsCount > 1 ? 's' : ''} inscrit${registeredStudentsCount > 1 ? 's' : ''} • ${archivedStudentsCount} archivé${archivedStudentsCount > 1 ? 's' : ''}`;

  return (
    <header className="navbar">
      <div className="navbar-left">
        {onToggleMenu && (
          <button className="menu-toggle-btn" onClick={onToggleMenu} aria-label="Menu principal">
            <Menu size={22} />
          </button>
        )}
        <div className="navbar-headings">
          <h1>{getTitle()}</h1>
          <p>{getSubtitle()}</p>
        </div>
      </div>

      <div className="navbar-right">
        <div
          className={`navbar-students-badge ${isArchives ? 'is-archives' : ''}`}
          title={tooltipText}
          aria-label={isLoading ? "Chargement du nombre d'étudiants" : `${displayCount} ${displayLabel}`}
        >
          <div className="students-badge-icon">
            <Users size={18} />
          </div>
          <div className="students-badge-info">
            <span className="students-badge-count">
              {isLoading ? '—' : displayCount}
            </span>
            <span className="students-badge-label">
              {displayLabel}
            </span>
          </div>
        </div>

        <button className="btn btn-brown btn-add-student" onClick={onAddStudent}>
          <Plus size={18} />
          <span className="btn-text">Ajouter Étudiant</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
