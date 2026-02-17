import React from 'react';
import { DAILY_STAGES, PLACEHOLDERS } from '../../templates/lessonTemplates';
import { Plus, Trash2 } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

const headerInputStyle = {
  ...inputStyle,
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  border: '1px solid rgba(255,255,255,0.4)',
  color: '#fff',
  fontWeight: 600
};

const labelStyle = { fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 };

const DEFAULT_COLUMN_LABELS = {
  stage: 'Stage',
  method: 'Method',
  teacherActions: 'Teacher Actions',
  studentActions: 'Student Actions',
  assessment: 'Assessment'
};

const DATA_COLUMNS = ['teacherActions', 'studentActions', 'assessment'];

export default function DailyTemplate({ data = {}, onChange, highlightEmpty = {} }) {
  const d = data || {};
  const stages = (d.stages && d.stages.length > 0)
    ? d.stages
    : DAILY_STAGES.map((s) => ({
        stage: s.stage,
        method: s.method,
        teacherActions: '',
        studentActions: '',
        assessment: ''
      }));
  const columnLabels = d.columnLabels || { ...DEFAULT_COLUMN_LABELS };
  const customColumns = d.customColumns || [];

  const allColumns = React.useMemo(() => {
    const keys = new Set([...DATA_COLUMNS]);
    stages.forEach(s => Object.keys(s).filter(k => !['stage', 'method'].includes(k)).forEach(k => keys.add(k)));
    customColumns.forEach(c => keys.add(c.key));
    return Array.from(keys);
  }, [stages, customColumns]);

  const updateStage = (index, field, value) => {
    const next = [...stages];
    if (!next[index]) next[index] = { ...DAILY_STAGES[index] || {}, stage: '', method: '', teacherActions: '', studentActions: '', assessment: '' };
    next[index] = { ...next[index], [field]: value };
    onChange({ ...d, stages: next });
  };

  const updateColumnLabel = (colKey, label) => {
    onChange({ ...d, columnLabels: { ...columnLabels, [colKey]: label } });
  };

  const addRow = () => {
    const newStage = { stage: `Stage ${stages.length + 1}`, method: '', teacherActions: '', studentActions: '', assessment: '' };
    allColumns.filter(c => !['stage', 'method', ...DATA_COLUMNS].includes(c)).forEach(c => { newStage[c] = ''; });
    onChange({ ...d, stages: [...stages, newStage] });
  };

  const addColumn = () => {
    const n = allColumns.filter(k => k.startsWith('custom_')).length;
    const newKey = `custom_${n}`;
    const newStages = stages.map(s => ({ ...s, [newKey]: s[newKey] ?? '' }));
    onChange({
      ...d,
      stages: newStages,
      columnLabels: { ...columnLabels, [newKey]: `Column ${n + 1}` },
      customColumns: [...customColumns, { key: newKey }]
    });
  };

  const deleteRow = (index) => {
    if (stages.length <= 1) return;
    const next = stages.filter((_, i) => i !== index);
    onChange({ ...d, stages: next });
  };

  const deleteColumn = (colKey) => {
    if (allColumns.length <= 1) return;
    const nextStages = stages.map(s => {
      const copy = { ...s };
      delete copy[colKey];
      return copy;
    });
    const nextLabels = { ...columnLabels };
    delete nextLabels[colKey];
    const nextCustom = customColumns.filter(c => c.key !== colKey);
    onChange({ ...d, stages: nextStages, columnLabels: nextLabels, customColumns: nextCustom });
  };

  const getLabel = (col) => columnLabels[col] ?? DEFAULT_COLUMN_LABELS[col] ?? (col.charAt(0).toUpperCase() + col.slice(1));

  const ph = PLACEHOLDERS.daily;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>Objective</label>
        <textarea
          rows={2}
          style={{ ...inputStyle, minHeight: 60, minWidth: 200, resize: 'both' }}
          placeholder={ph.objective}
          value={d.objective ?? ''}
          onChange={(e) => onChange({ ...d, objective: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>Materials</label>
        <input
          type="text"
          style={inputStyle}
          placeholder={ph.materials}
          value={d.materials ?? ''}
          onChange={(e) => onChange({ ...d, materials: e.target.value })}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: '#fff', borderBottom: '2px solid #0ea5e9' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: 100 }}>
                <input
                  type="text"
                  value={getLabel('stage')}
                  onChange={(e) => updateColumnLabel('stage', e.target.value)}
                  style={{ ...headerInputStyle, background: 'rgba(255,255,255,0.15)', width: '100%' }}
                />
              </th>
              <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: 100 }}>
                <input
                  type="text"
                  value={getLabel('method')}
                  onChange={(e) => updateColumnLabel('method', e.target.value)}
                  style={{ ...headerInputStyle, background: 'rgba(255,255,255,0.15)', width: '100%' }}
                />
              </th>
              {allColumns.map((col) => (
                <th key={col} style={{ padding: '8px 12px', textAlign: 'left', minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="text"
                      value={getLabel(col)}
                      onChange={(e) => updateColumnLabel(col, e.target.value)}
                      style={{ ...headerInputStyle, background: 'rgba(255,255,255,0.15)', flex: 1, minWidth: 0 }}
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
            {stages.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E5E7EB', background: i % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                <td style={{ padding: 10, verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="text"
                      value={(s.stage ?? '').toString()}
                      onChange={(e) => updateStage(i, 'stage', e.target.value)}
                      style={{
                        ...inputStyle,
                        flex: 1,
                        minWidth: 0,
                        fontWeight: 600,
                        margin: 0,
                        borderColor: highlightEmpty[`${i}-stage`] ? '#ef4444' : undefined,
                        boxShadow: highlightEmpty[`${i}-stage`] ? '0 0 0 2px rgba(239,68,68,0.3)' : undefined
                      }}
                      placeholder="Stage"
                    />
                    {i >= DAILY_STAGES.length && (
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
                <td style={{ padding: 10, verticalAlign: 'top' }}>
                  <input
                    type="text"
                    value={(s.method ?? '').toString()}
                    onChange={(e) => updateStage(i, 'method', e.target.value)}
                    style={{
                      ...inputStyle,
                      margin: 0,
                      borderColor: highlightEmpty[`${i}-method`] ? '#ef4444' : undefined,
                      boxShadow: highlightEmpty[`${i}-method`] ? '0 0 0 2px rgba(239,68,68,0.3)' : undefined
                    }}
                    placeholder="Method"
                  />
                </td>
                {allColumns.map((col) => {
                  const cellKey = `${i}-${col}`;
                  const isEmpty = highlightEmpty[cellKey];
                  return (
                    <td key={col} style={{ padding: 10, verticalAlign: 'top' }}>
                      <textarea
                        rows={2}
                        style={{
                          ...inputStyle,
                          minHeight: 50,
                          minWidth: 100,
                          margin: 0,
                          resize: 'both',
                          borderColor: isEmpty ? '#ef4444' : undefined,
                          boxShadow: isEmpty ? '0 0 0 2px rgba(239,68,68,0.3)' : undefined
                        }}
                        placeholder={DAILY_STAGES[i]?.[`${col}Placeholder`] || getLabel(col)}
                        value={(s[col] ?? '').toString()}
                        onChange={(e) => updateStage(i, col, e.target.value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
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
      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          rows={2}
          style={{ ...inputStyle, minHeight: 60, minWidth: 200, resize: 'both' }}
          placeholder={ph.notes}
          value={d.notes ?? ''}
          onChange={(e) => onChange({ ...d, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
