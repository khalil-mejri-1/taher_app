import React from 'react';
import { Search, RotateCcw, Trash2, Plus } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAddStudent }) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1>Vue d'ensemble</h1>
        <p>Suivez la progression et les règlements en temps réel.</p>
      </div>

      <div className="navbar-right">
        <div className="search-container">
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Rechercher par nom..." />
        </div>

        <button className="btn btn-orange">
          <RotateCcw size={18} />
          <span>تعطيل الحصص</span>
        </button>


        <button className="btn btn-brown" onClick={onAddStudent}>
          <Plus size={18} />
          <span>Ajouter Étudiant</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
