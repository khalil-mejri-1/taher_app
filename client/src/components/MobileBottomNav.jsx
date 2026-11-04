import React from 'react';
import { LayoutDashboard, Archive, CircleDollarSign, Plus, Menu } from 'lucide-react';
import './MobileBottomNav.css';

const MobileBottomNav = ({ activeView, onViewChange, onAddStudent, onToggleMenu }) => {
  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`bottom-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
        onClick={() => onViewChange('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Tableau</span>
      </button>

      <button
        className={`bottom-nav-item ${activeView === 'archives' ? 'active' : ''}`}
        onClick={() => onViewChange('archives')}
      >
        <Archive size={20} />
        <span>Archives</span>
      </button>

      <button
        className="bottom-nav-action-btn"
        onClick={onAddStudent}
        title="Ajouter un étudiant"
        aria-label="Ajouter un étudiant"
      >
        <div className="action-circle">
          <Plus size={22} strokeWidth={2.5} />
        </div>
      </button>

      <button
        className={`bottom-nav-item ${activeView === 'finances' ? 'active' : ''}`}
        onClick={() => onViewChange('finances')}
      >
        <CircleDollarSign size={20} />
        <span>Finances</span>
      </button>

      <button
        className="bottom-nav-item"
        onClick={onToggleMenu}
        aria-label="Menu"
      >
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
