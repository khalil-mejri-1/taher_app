import React from 'react';
import { LayoutDashboard, Archive, CircleDollarSign, LogOut, Users, Calendar } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard Principal' },
    { id: 'archives', icon: <Archive size={20} />, label: 'Archives' },
    { id: 'finances', icon: <CircleDollarSign size={20} />, label: 'Finances & Rapports' },
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <Calendar size={28} color="white" />
        </div>
        <div className="logo-text">
          <h1>a7la taher kif ya sfax</h1>
          <p>A9WA MOLA CHARIKA</p>
        </div>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="logout-btn">
          <LogOut size={20} color="#ff6b6b" />
          <span>Quitter la session</span>
        </div>

        <div className="profile-card">
          <div className="profile-icon">
            <Users size={24} color="white" />
          </div>
          <div className="profile-info">
            <h4>Admin Principal</h4>
            <div className="status">
              <span className="status-dot"></span>
              <span>Statut: Actif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
