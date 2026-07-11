import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => onClose && onClose(), 4000);
    return () => clearTimeout(id);
  }, [message]);

  if (!message) return null;

  const colors = {
    info: '#0ea5e9',
    success: '#10b981',
    error: '#ef4444',
    warn: '#f59e0b',
  };

  return (
    <div style={{ position: 'fixed', right: 20, top: 20, zIndex: 9999 }}>
      <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: '12px 16px', borderRadius: 8, minWidth: 260, boxShadow: '0 6px 18px rgba(0,0,0,0.3)', borderLeft: `4px solid ${colors[type] || colors.info}` }}>
        <div style={{ fontSize: 14 }}>{message}</div>
      </div>
    </div>
  );
}
