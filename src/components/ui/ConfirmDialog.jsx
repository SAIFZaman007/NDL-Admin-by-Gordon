import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

function ConfirmDialog({ title = 'Are you sure?', description, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-sm">
      <div className="space-y-5">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed pt-1.5">{description}</p>
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="btn-danger text-sm">
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
