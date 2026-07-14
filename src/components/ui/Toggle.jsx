import React from 'react';

function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="field-label !mb-0">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`toggle-track ${checked ? 'on' : ''}`}
        aria-pressed={checked}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  );
}

export default Toggle;
