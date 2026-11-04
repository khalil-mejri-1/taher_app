import React from 'react';
import { Plus, Menu } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAddStudent, onToggleMenu, activeView }) => {
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
        <button className="btn btn-brown btn-add-student" onClick={onAddStudent}>
          <Plus size={18} />
          <span className="btn-text">Ajouter Étudiant</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
