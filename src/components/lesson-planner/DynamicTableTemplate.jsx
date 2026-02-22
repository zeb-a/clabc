import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff'
};

const highlightedInputStyle = {
  border: '3px solid #DC2626',
  backgroundColor: '#FFEBEE',
  boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.2)'
};

const headerInputStyle = {
  ...inputStyle,
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  border: '1px solid rgba(255,255,255,0.4)',
  color: '#fff',
  fontWeight: 600
};

const labelStyle = { fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 };

const defaultColumnLabels = { focus: 'Focus', languageTarget: 'Language Target', assessment: 'Assessment' };

/**
 * Dynamic Table Template Component
 * Supports editable headers, add/delete rows & columns for Weekly, Monthly, Yearly periods
 */
export default function DynamicTableTemplate({ data = {}, onChange, labelKey = 'phase', defaultLabels = [], highlightedCells = [], clearHighlight }) {
  const d = data || {};
  const customColumns = d.customColumns || [];
  const rows = (d.rows && d.rows.length > 0)
    ? d.rows
    : defaultLabels.map((label) => ({
        [labelKey]: label,
        focus: '',
        languageTarget: '',
        assessment: ''
      }));
  const columnLabels = d.columnLabels || { ...defaultColumnLabels };
  const rowLabelHeader = d.rowLabelHeader ?? (labelKey.charAt(0).toUpperCase() + labelKey.slice(1));

  // Get all column keys from existing rows and custom columns
  const allColumns = React.useMemo(() => {
    const keys = new Set();
    rows.forEach(r => Object.keys(r).filter(k => k !== labelKey).forEach(k => keys.add(k)));
    customColumns.forEach(col => keys.add(col.key));
    const base = ['focus', 'languageTarget', 'assessment'];
    base.forEach(k => keys.add(k));
    return Array.from(keys);
  }, [rows, customColumns, labelKey]);

  const updateRow = (index, field, value) => {
    const next = [...rows];
    if (!next[index]) {
      next[index] = { [labelKey]: defaultLabels[index] || `Row ${index + 1}` };
      allColumns.forEach(col => {
        next[index][col] = next[index][col] ?? '';
      });
    }
    next[index] = { ...next[index], [field]: value };
    onChange({ ...d, rows: next });
    clearHighlight?.();
  };

  const updateColumnLabel = (colKey, label) => {
    onChange({ ...d, columnLabels: { ...columnLabels, [colKey]: label } });
  };

  const updateRowLabelHeader = (value) => {
    onChange({ ...d, rowLabelHeader: value });
  };

  const addRow = () => {
    const newLabel = `Row ${rows.length + 1}`;
    const newRow = { [labelKey]: newLabel };
    allColumns.forEach(col => { newRow[col] = ''; });
    onChange({ ...d, rows: [...rows, newRow] });
  };

  const addColumn = () => {
    const n = allColumns.filter(k => k.startsWith('custom_')).length;
    const newKey = `custom_${n}`;
    const newRows = rows.map(r => ({ ...r, [newKey]: r[newKey] ?? '' }));
    onChange({
      ...d,
      rows: newRows,
      columnLabels: { ...columnLabels, [newKey]: `Column ${n + 1}` },
      customColumns: [...(d.customColumns || []), { key: newKey }]
    });
  };

  const deleteRow = (index) => {
    if (rows.length <= 1) return;
    const next = rows.filter((_, i) => i !== index);
    onChange({ ...d, rows: next });
  };

  const deleteColumn = (colKey) => {
    if (allColumns.length <= 1) return;
    const nextCols = allColumns.filter(k => k !== colKey);
    const nextRows = rows.map(r => {
      const copy = { ...r };
      delete copy[colKey];
      return copy;
    });
    const nextLabels = { ...columnLabels };
    delete nextLabels[colKey];
    const nextCustom = (d.customColumns || []).filter(c => c.key !== colKey);
    onChange({ ...d, rows: nextRows, columnLabels: nextLabels, customColumns: nextCustom });
  };

  const getLabelForColumn = (col) => {
    return columnLabels[col] ?? defaultColumnLabels[col] ?? (col.charAt(0).toUpperCase() + col.slice(1));
  };

  const displayRows = rows;

  const isHighlighted = (index, field) => {
    if (!highlightedCells || highlightedCells.length === 0) return false;
    return highlightedCells.some(c => c.type === 'row' && c.index === index && c.field === field);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: '#fff', borderBottom: '2px solid #0ea5e9' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: 100 }}>
                <input
                  type="text"
                  value={rowLabelHeader}
                  onChange={(e) => updateRowLabelHeader(e.target.value)}
                  style={{ ...headerInputStyle, width: '100%' }}
                  placeholder={labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}
                />
              </th>
              {allColumns.map((col) => (
                <th key={col} style={{ padding: '8px 12px', textAlign: 'left', minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="text"
                      value={getLabelForColumn(col)}
                      onChange={(e) => updateColumnLabel(col, e.target.value)}
                      style={{ ...headerInputStyle, background: 'rgba(255,255,255,0.15)', flex: 1, minWidth: 0 }}
                      placeholder={col}
                    />
                    {col.startsWith('custom_') && (
                      <button
                        type="button"
                        onClick={() => deleteColumn(col)}
                        title="Delete column"
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: 'none',
                          background: 'rgba(239,68,68,0.2)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => {
              const displayLabel = row[labelKey] ?? defaultLabels[i] ?? `Row ${i + 1}`;
              return (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid #E5E7EB',
                    background: i % 2 === 0 ? '#fff' : '#F9FAFB'
                  }}
                >
                  <td style={{ padding: 10, verticalAlign: 'top', minWidth: 100 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="text"
                        value={displayLabel}
                        onChange={(e) => updateRow(i, labelKey, e.target.value)}
                        style={{
                          ...inputStyle,
                          flex: 1,
                          minWidth: 0,
                          fontWeight: 600,
                          margin: 0,
                          ...(isHighlighted(i, labelKey) ? highlightedInputStyle : {})
                        }}
                        placeholder={`${labelKey} label`}
                      />
                      {i >= defaultLabels.length && (
                        <button
                          type="button"
                          onClick={() => deleteRow(i)}
                          title="Delete row"
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: 'none',
                            background: 'rgba(239,68,68,0.2)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  {allColumns.map((col) => {
                    return (
                      <td key={col} style={{ padding: 10, verticalAlign: 'top' }}>
                    <textarea
                        rows={2}
                        style={{
                          ...inputStyle,
                          minHeight: 50,
                          minWidth: 100,
                          margin: 0,
                          padding: '10px 14px',
                          resize: 'both',
                          ...(isHighlighted(i, col) ? highlightedInputStyle : {})
                        }}
                        placeholder={getLabelForColumn(col)}
                        value={(row[col] ?? '').toString()}
                        onChange={(e) => updateRow(i, col, e.target.value)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={addRow}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px dashed #0ea5e9',
            background: 'rgba(14, 165, 233, 0.06)',
            color: '#0ea5e9',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={16} /> Add Row
        </button>
        <button
          type="button"
          onClick={addColumn}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px dashed #0ea5e9',
            background: 'rgba(14, 165, 233, 0.06)',
            color: '#0ea5e9',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={16} /> Add Column
        </button>
      </div>
      {d.notes !== undefined && (
        <div>
          <label style={labelStyle}>Notes</label>
          <textarea
            rows={2}
            style={{ ...inputStyle, minHeight: 60, minWidth: 200, margin: 0, resize: 'both' }}
            placeholder="Notes for this plan"
            value={d.notes ?? ''}
            onChange={(e) => onChange({ ...d, notes: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
