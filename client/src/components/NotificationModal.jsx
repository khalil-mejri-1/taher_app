import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, X } from 'lucide-react';
import './NotificationModal.css';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'alert', // 'alert', 'confirm', 'prompt'
  onConfirm, 
  inputValue = '',
  placeholder = 'Entrez une valeur...'
}) => {
  const [value, setValue] = useState(inputValue);

  useEffect(() => {
    if (isOpen) {
      setValue(inputValue);
    }
  }, [isOpen, inputValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'prompt') {
      onConfirm(value);
    } else {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'confirm': return <HelpCircle size={48} className="modal-icon confirm" />;
      case 'prompt': return <AlertCircle size={48} className="modal-icon prompt" />;
      default: return <CheckCircle size={48} className="modal-icon alert" />;
    }
  };

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-body">
          {getIcon()}
          <h3>{title}</h3>
          <p>{message}</p>
          
          {type === 'prompt' && (
            <input 
              type="text" 
              className="modal-input" 
              value={value} 
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          )}
        </div>

        <div className="modal-footer">
          {type !== 'alert' && (
            <button className="btn-cancel" onClick={onClose}>Annuler</button>
          )}
          <button className="btn-confirm" onClick={handleConfirm}>
            {type === 'confirm' || type === 'prompt' ? 'Confirmer' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
