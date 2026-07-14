import React from 'react';

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="glass-card-static rounded-2xl py-16 px-6 text-center space-y-3">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
      )}
      <h3 className="text-white font-semibold text-sm">{title}</h3>
      {description && <p className="text-slate-500 text-xs max-w-sm mx-auto">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
