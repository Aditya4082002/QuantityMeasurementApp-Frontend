import { useState, useEffect } from 'react';
import '../styles/toast.css';

let toastQueue = [];
let setToastsFunc = null;

export const showToast = (message, type = 'info', duration = 3500) => {
  const id = Date.now();
  const toast = { id, message, type, duration };
  
  if (setToastsFunc) {
    setToastsFunc(prev => [...prev, toast]);
  } else {
    toastQueue.push(toast);
  }
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastsFunc = setToasts;
    
    // Process queued toasts
    if (toastQueue.length > 0) {
      setToasts(toastQueue);
      toastQueue = [];
    }

    return () => {
      setToastsFunc = null;
    };
  }, []);

  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);

      return () => clearTimeout(timer);
    });
  }, [toasts]);

  const getIcon = (type) => {
    const icons = {
      error: 'ph-warning-circle',
      success: 'ph-check-circle',
      info: 'ph-info',
      warn: 'ph-warning'
    };
    return icons[type] || 'ph-info';
  };

  return (
    <div className="toast-container" id="toastContainer">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <i className={`ph-fill ${getIcon(toast.type)}`}></i>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
