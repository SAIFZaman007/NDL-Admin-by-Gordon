import React from 'react';

function StatCard({ icon: Icon, label, value, accent = '#3B82F6' }) {
  return (
    <div className="glass-card-static rounded-2xl p-5 space-y-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${accent}1A`, border: `1px solid ${accent}33` }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color: accent }} />
      </div>
      <div>
        <div className="stat-number">{value}</div>
        <p className="text-slate-500 text-xs font-medium mt-1">{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
