import React from 'react';
import { Loader2 } from 'lucide-react';

function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-24 space-x-2.5 text-slate-500">
      <Loader2 className="h-4 w-4 spinner" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default PageLoader;
