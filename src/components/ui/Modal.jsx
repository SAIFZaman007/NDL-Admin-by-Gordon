import React from 'react';
import { X } from 'lucide-react';

function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`glass-card w-full ${maxWidth} rounded-2xl border border-white/10 max-h-[88vh] flex flex-col`} style={{ background: '#12141C' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <h2 className="font-display font-bold text-white text-lg">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
