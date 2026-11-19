import React, { useState } from 'react';
import { LayoutDashboard, Archive, CircleDollarSign, LogOut, Users, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView, onViewChange, isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard Principal' },
    { id: 'archives', icon: <Archive size={18} />, label: 'Archives' },
    { id: 'finances', icon: <CircleDollarSign size={18} />, label: 'Finances & Rapports' },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-collapse-toggle" 
          onClick={toggleCollapse} 
          title={isCollapsed ? "Agrandir le menu" : "Réduire le menu (صغر العرض)"}
          aria-label={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <div className="logo-container">
          <div className="logo-icon">
            <Calendar size={20} color="white" />
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <h1>2C Paton</h1>
              <p>Atelier de couture & formation</p>
            </div>
          )}
          {onClose && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Fermer le menu">
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="nav-menu">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => {
                onViewChange(item.id);
                if (onClose) onClose();
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="icon">{item.icon}</span>
              {!isCollapsed && <span className="label">{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="logout-btn" title={isCollapsed ? "Quitter la session" : undefined}>
            <LogOut size={18} color="#ff6b6b" />
            {!isCollapsed && <span>Quitter la session</span>}
          </div>

          <div className="profile-card" title={isCollapsed ? "Admin Principal (Statut: Actif)" : undefined}>
            <div className="profile-icon">
              <Users size={18} color="white" />
            </div>
            {!isCollapsed && (
              <div className="profile-info">
                <h4>Admin Principal</h4>
                <div className="status">
                  <span className="status-dot"></span>
                  <span>Statut: Actif</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
