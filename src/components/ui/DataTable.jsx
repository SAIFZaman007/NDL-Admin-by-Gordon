import React from 'react';

// columns: [{ key, label, render?: (row) => node }]
// rows: array of objects, each identified by row[keyField]
// actions: optional (row) => node, rendered right-aligned in its own column
function DataTable({ columns, rows, actions, keyField = 'id', emptyMessage = 'No records yet.' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="glass-card-static rounded-2xl py-16 text-center text-slate-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="glass-card-static rounded-2xl overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
            {actions && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row[keyField]}>
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
              {actions && <td className="text-right whitespace-nowrap">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
