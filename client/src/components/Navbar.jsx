import React from 'react';
import { Search, RotateCcw, Trash2, Plus } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAddStudent, onResetSessions }) => {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1>Vue d'ensemble</h1>
        <p>Suivez la progression et les règlements en temps réel.</p>
      </div>

      <div className="navbar-right">


        {/* <button className="btn btn-orange" onClick={onResetSessions}>
          <RotateCcw size={18} />
          <span>تصفير الحصص</span>
        </button> */}


        <button className="btn btn-brown" onClick={onAddStudent}>
          <Plus size={18} />
          <span>Ajouter Étudiant</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
