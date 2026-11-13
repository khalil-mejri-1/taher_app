import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, X, Loader2 } from 'lucide-react';
import './NotificationModal.css';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'alert', // 'alert', 'confirm', 'prompt'
  onConfirm, 
  inputValue = '',
  placeholder = 'Entrez une valeur...',
  inputType = 'text'
}) => {
  const [value, setValue] = useState(inputValue);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue(inputValue);
      setIsConfirming(false);
    }
  }, [isOpen, inputValue]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      if (type === 'prompt') {
        await onConfirm(value);
      } else {
        await onConfirm();
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirming(false);
    }
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
              type={inputType} 
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
            <button className="btn-cancel" onClick={onClose} disabled={isConfirming}>Annuler</button>
          )}
          <button 
            className={`btn-confirm ${isConfirming ? 'btn-is-loading' : ''}`} 
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <span className="btn-loading-flex">
                <Loader2 size={16} className="spin-loader" />
                <span>Patientez...</span>
              </span>
            ) : (
              type === 'confirm' || type === 'prompt' ? 'Confirmer' : 'OK'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
