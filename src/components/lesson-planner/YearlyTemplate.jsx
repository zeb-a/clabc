import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, X, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { YEARLY_SECTION_LABELS, PLACEHOLDERS } from '../../templates/lessonTemplates';

// In-page Alert Component
function InPageAlert({ message, type = 'info', onDismiss }) {
  const colors = {
    info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: Info },
    success: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', icon: CheckCircle },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: AlertCircle }
  };

  const style = colors[type] || colors.info;
  const Icon = style.icon;

  return (
    <div style={{
      backgroundColor: style.bg,
      border: `1px solid ${style.border}`,
      color: style.text,
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: 16,
      fontSize: '14px'
    }}>
      <Icon size={18} />
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            opacity: 0.7
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.7'}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  fontSize: 13,
  fontFamily: 'inherit',
  boxSizing: 'border-box'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13
};

const labelStyle = { fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 };

const buttonStyle = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  background: '#fff',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  color: '#475569',
  display: 'flex',
  alignItems: 'center',
  gap: 6
};

const resizeHandleStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '8px',
  height: '100%',
  cursor: 'col-resize',
  background: 'transparent',
  zIndex: 10,
  userSelect: 'none'
};

const rowResizeHandleStyle = {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '100%',
  height: '8px',
  cursor: 'row-resize',
  background: 'transparent',
  zIndex: 10,
  userSelect: 'none'
};

const PREDEFINED_COLUMNS = [
  { key: 'vocabularies', label: 'Vocabularies', placeholder: 'List key vocabulary' },
  { key: 'questions', label: 'Questions', placeholder: 'Comprehension questions' },
  { key: 'speaking', label: 'Speaking', placeholder: 'Speaking activities' },
  { key: 'listening', label: 'Listening', placeholder: 'Listening tasks' },
  { key: 'writing', label: 'Writing', placeholder: 'Writing exercises' }
];

function ResizableCell({ children, style, onResize, direction = 'column', as = 'td', ...props }) {
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(0);
  const startHeight = useRef(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    startY.current = e.clientY;

    const rect = e.target.parentElement.getBoundingClientRect();
    startWidth.current = rect.width;
    startHeight.current = rect.height;

    const handleMouseMove = (e) => {
      if (direction === 'column') {
        const newWidth = Math.max(150, startWidth.current + (e.clientX - startX.current));
        onResize?.({ width: newWidth });
      } else {
        const newHeight = Math.max(40, startHeight.current + (e.clientY - startY.current));
        onResize?.({ height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const Cell = as;
  const ResizeHandle = ({ as: HandleAs = 'div', ...handleProps }) => (
    <HandleAs
      style={direction === 'column' ? resizeHandleStyle : rowResizeHandleStyle}
      onMouseDown={handleMouseDown}
      onMouseEnter={(e) => e.target.style.background = isResizing ? '#0ea5e9' : ''}
      onMouseLeave={(e) => e.target.style.background = 'transparent'}
      {...handleProps}
    />
  );

  if (as === 'tr') {
    return (
      <Cell {...props} style={{ position: 'relative', ...style }}>
        {children}
        <ResizeHandle as="td" style={{ position: 'relative', padding: 0, border: 'none' }}>
          <div style={direction === 'column' ? resizeHandleStyle : rowResizeHandleStyle} />
        </ResizeHandle>
      </Cell>
    );
  }

  return (
    <Cell {...props} style={{ position: 'relative', ...style }}>
      {children}
      <ResizeHandle />
    </Cell>
  );
}

export default function YearlyTemplate({ data = {}, onChange }) {
  const d = data || {};
  const rows = d.rows || YEARLY_SECTION_LABELS.map((section) => ({
    section,
    focus: '',
    languageTarget: '',
    assessment: ''
  }));
  const ph = PLACEHOLDERS.yearly;
  const customColumns = d.customColumns || [];
  const columnLabels = d.columnLabels || {
    focus: 'Focus',
    languageTarget: 'Language Target',
    assessment: 'Assessment'
  };
  const columnWidths = d.columnWidths || { section: 150, focus: 200, languageTarget: 200, assessment: 150 };
  const rowHeights = d.rowHeights || {};
  
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showRemoveColumn, setShowRemoveColumn] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info', autoDismiss = false) => {
    setAlert({ message, type });
    if (autoDismiss) {
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const updateRow = (index, field, value) => {
    const next = [...rows];
    if (!next[index]) next[index] = { section: YEARLY_SECTION_LABELS[index] || `Section ${index + 1}`, focus: '', languageTarget: '', assessment: '' };
    next[index] = { ...next[index], [field]: value };
    onChange({ ...d, rows: next });
  };

  const addRow = () => {
    const next = [...rows];
    next.push({
      section: `Section ${rows.length + 1}`,
      focus: '',
      languageTarget: '',
      assessment: ''
    });
    onChange({ ...d, rows: next });
  };

  const removeRow = (index) => {
    if (index < YEARLY_SECTION_LABELS.length) {
      showAlert('Cannot remove default rows', 'warning');
      return;
    }
    const next = rows.filter((_, i) => i !== index);
    onChange({ ...d, rows: next });
  };

  const addColumn = (column) => {
    const next = [...customColumns];
    if (!next.find(c => c.key === column.key)) {
      next.push({ ...column });
      onChange({ ...d, customColumns: next });
    }
    setShowAddColumn(false);
  };

  const addCustomColumn = () => {
    const key = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const column = {
      key,
      label: '',
      placeholder: 'Enter column name...'
    };
    const next = [...customColumns, column];
    onChange({ ...d, customColumns: next });
  };

  const removeColumn = (columnKey) => {
    const next = customColumns.filter(c => c.key !== columnKey);
    const newWidths = { ...columnWidths };
    delete newWidths[columnKey];
    onChange({ ...d, customColumns: next, columnWidths: newWidths });
    setShowRemoveColumn(false);
  };

  const updateColumnLabel = (key, label) => {
    const newLabels = { ...columnLabels, [key]: label };
    onChange({ ...d, columnLabels: newLabels });
  };

  const updateColumnWidth = (key, width) => {
    onChange({ ...d, columnWidths: { ...columnWidths, [key]: width } });
  };

  const updateRowHeight = (index, height) => {
    onChange({ ...d, rowHeights: { ...rowHeights, [index]: height } });
  };

  
  // File import removed; centralized paste-only import retained in LessonPlannerPage.

  const allColumns = [...customColumns];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {alert && (
        <InPageAlert
          message={alert.message}
          type={alert.type}
          onDismiss={() => setAlert(null)}
        />
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setShowAddColumn(!showAddColumn)} style={buttonStyle}>
          <Plus size={16} /> Add Column
        </button>
        {customColumns.length > 0 && (
          <button onClick={() => setShowRemoveColumn(!showRemoveColumn)} style={buttonStyle}>
            <Minus size={16} /> Remove Column
          </button>
        )}
        {/* Import/paste controls removed — centralized in LessonPlannerPage */}
      </div>

      {showAddColumn && (
        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: '#475569' }}>Add a column:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {PREDEFINED_COLUMNS.map(col => (
              <button
                key={col.key}
                onClick={() => addColumn(col)}
                disabled={customColumns.find(c => c.key === col.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: customColumns.find(c => c.key === col.key) ? '1px solid #cbd5e1' : '1px solid #0ea5e9',
                  background: customColumns.find(c => c.key === col.key) ? '#f1f5f9' : '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: customColumns.find(c => c.key === col.key) ? 'not-allowed' : 'pointer',
                  color: customColumns.find(c => c.key === col.key) ? '#94a3b8' : '#0ea5e9'
                }}
              >
                {col.label}
              </button>
            ))}
            <button
              onClick={addCustomColumn}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #0ea5e9',
                background: '#fff',
                color: '#0ea5e9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                minHeight: '32px'
              }}
              title="Add custom column"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}

      {showRemoveColumn && customColumns.length > 0 && (
        <div style={{ padding: 16, background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: '#dc2626' }}>Remove a column:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {customColumns.map(col => (
              <button
                key={col.key}
                onClick={() => removeColumn(col.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #dc2626',
                  background: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#dc2626'
                }}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
              <ResizableCell
                as="th"
                style={{ padding: 8, textAlign: 'left', width: columnWidths.section || 150, minWidth: 80 }}
                onResize={({ width }) => updateColumnWidth('section', width)}
              >
                <input
                  type="text"
                  value={columnLabels.section || 'Section'}
                  onChange={(e) => updateColumnLabel('section', e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    width: '100%'
                  }}
                />
              </ResizableCell>
              <ResizableCell
                as="th"
                style={{ padding: 8, textAlign: 'left', width: columnWidths.focus || 200, minWidth: 100 }}
                onResize={({ width }) => updateColumnWidth('focus', width)}
              >
                <input
                  type="text"
                  value={columnLabels.focus || 'Focus'}
                  onChange={(e) => updateColumnLabel('focus', e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    width: '100%'
                  }}
                />
              </ResizableCell>
              <ResizableCell
                as="th"
                style={{ padding: 8, textAlign: 'left', width: columnWidths.languageTarget || 200, minWidth: 100 }}
                onResize={({ width }) => updateColumnWidth('languageTarget', width)}
              >
                <input
                  type="text"
                  value={columnLabels.languageTarget || 'Language Target'}
                  onChange={(e) => updateColumnLabel('languageTarget', e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    width: '100%'
                  }}
                />
              </ResizableCell>
              <ResizableCell
                as="th"
                style={{ padding: 8, textAlign: 'left', width: columnWidths.assessment || 150, minWidth: 80 }}
                onResize={({ width }) => updateColumnWidth('assessment', width)}
              >
                <input
                  type="text"
                  value={columnLabels.assessment || 'Assessment'}
                  onChange={(e) => updateColumnLabel('assessment', e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: 13,
                    width: '100%'
                  }}
                />
              </ResizableCell>
              {allColumns.map(col => (
                <ResizableCell
                  as="th"
                  key={col.key}
                  style={{ padding: 8, textAlign: 'left', width: columnWidths[col.key] || 200, minWidth: 100 }}
                  onResize={({ width }) => updateColumnWidth(col.key, width)}
                >
                  <input
                    type="text"
                    value={columnLabels[col.key] || col.label || ''}
                    onChange={(e) => updateColumnLabel(col.key, e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      width: '100%'
                    }}
                  />
                </ResizableCell>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <ResizableCell
                key={i}
                as="tr"
                style={{ borderBottom: '1px solid #E5E7EB', height: rowHeights[i] || 'auto', minHeight: 50 }}
                onResize={({ height }) => updateRowHeight(i, height)}
              >
                <td style={{ padding: 10, fontWeight: 600, verticalAlign: 'top', border: '1px solid #e2e8f0' }}>
                  <input
                    type="text"
                    style={inputStyle}
                    value={row.section || YEARLY_SECTION_LABELS[i] || `Section ${i + 1}`}
                    onChange={(e) => updateRow(i, 'section', e.target.value)}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: 'top', border: '1px solid #e2e8f0' }}>
                  <textarea
                    rows={2}
                    style={{ ...inputStyle, minHeight: 50, margin: 0 }}
                    placeholder={ph.focus}
                    value={row.focus ?? ''}
                    onChange={(e) => updateRow(i, 'focus', e.target.value)}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: 'top', border: '1px solid #e2e8f0' }}>
                  <textarea
                    rows={2}
                    style={{ ...inputStyle, minHeight: 50, margin: 0 }}
                    placeholder={ph.languageTarget}
                    value={row.languageTarget ?? ''}
                    onChange={(e) => updateRow(i, 'languageTarget', e.target.value)}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: 'top', border: '1px solid #e2e8f0' }}>
                  <textarea
                    rows={2}
                    style={{ ...inputStyle, minHeight: 50, margin: 0 }}
                    placeholder={ph.assessment}
                    value={row.assessment ?? ''}
                    onChange={(e) => updateRow(i, 'assessment', e.target.value)}
                  />
                </td>
                {allColumns.map(col => (
                  <td key={col.key} style={{ padding: 10, verticalAlign: 'top', border: '1px solid #e2e8f0' }}>
                    <textarea
                      rows={2}
                      style={{ ...inputStyle, minHeight: 50, margin: 0 }}
                      value={row[col.key] ?? ''}
                      onChange={(e) => updateRow(i, col.key, e.target.value)}
                    />
                  </td>
                ))}
              </ResizableCell>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow} style={{ ...buttonStyle, width: 'fit-content' }}>
        <Plus size={16} /> Add Row
      </button>

      <div>
        <label style={labelStyle}>Notes</label>
        <textarea
          rows={2}
          style={{ ...inputStyle, minHeight: 60, padding: '10px 14px' }}
          placeholder={ph.notes}
          value={d.notes ?? ''}
          onChange={(e) => onChange({ ...d, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
