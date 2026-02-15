import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Upload, X, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { WEEKLY_DAY_LABELS, PLACEHOLDERS } from '../../templates/lessonTemplates';

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
  return (
    <Cell {...props} style={{ position: 'relative', ...style }}>
      {children}
      <div
        style={direction === 'column' ? resizeHandleStyle : rowResizeHandleStyle}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => e.target.style.background = isResizing ? '#0ea5e9' : ''}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      />
    </Cell>
  );
}

export default function WeeklyTemplate({ data = {}, onChange }) {
  const d = data || {};
  const rows = d.rows || WEEKLY_DAY_LABELS.map((day) => ({
    day,
    focus: '',
    languageTarget: '',
    assessment: ''
  }));
  const ph = PLACEHOLDERS.weekly;
  const customColumns = d.customColumns || [];
  const columnLabels = d.columnLabels || {
    focus: 'Focus',
    languageTarget: 'Language Target',
    assessment: 'Assessment'
  };
  const columnWidths = d.columnWidths || { day: 150, focus: 200, languageTarget: 200, assessment: 150 };
  const rowHeights = d.rowHeights || {};
  
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [showRemoveColumn, setShowRemoveColumn] = useState(false);
  const [importing, setImporting] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info', autoDismiss = false) => {
    setAlert({ message, type });
    if (autoDismiss) {
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const updateRow = (index, field, value) => {
    const next = [...rows];
    if (!next[index]) next[index] = { day: WEEKLY_DAY_LABELS[index] || `Day ${index + 1}`, focus: '', languageTarget: '', assessment: '' };
    next[index] = { ...next[index], [field]: value };
    onChange({ ...d, rows: next });
  };

  const addRow = () => {
    const next = [...rows];
    next.push({
      day: `Day ${rows.length + 1}`,
      focus: '',
      languageTarget: '',
      assessment: ''
    });
    onChange({ ...d, rows: next });
  };

  const removeRow = (index) => {
    if (index < WEEKLY_DAY_LABELS.length) {
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

  const handlePasteImport = async () => {
    const pastedText = await navigator.clipboard.readText();
    if (!pastedText.trim()) {
      return;
    }

    setImporting(true);
    try {
      const text = cleanExtractedText(pastedText);

      if (detectTableStructure(text)) {
        const tableData = parseTableFromText(text);

        // Silent import - no confirm dialogs
        const newColumnLabels = { ...columnLabels };
        const allExistingKeys = ['focus', 'languagetarget', 'assessment', 'day', ...customColumns.map(c => c.key)];
        const newColumnWidths = { ...columnWidths };

        // Find matching columns by label (case-insensitive)
        const headerToKeyMap = {};
        tableData.headers.forEach((header, index) => {
          const headerLower = header.toLowerCase().trim();
          const key = header.toLowerCase().replace(/\s+/g, '');

          // Check if column already exists by key or label
          let existingKey = allExistingKeys.find(k => k.toLowerCase() === key);
          if (!existingKey) {
            existingKey = Object.keys(columnLabels).find(k => columnLabels[k].toLowerCase().trim() === headerLower);
          }

          if (existingKey) {
            headerToKeyMap[header] = existingKey;
          } else if (key !== 'day') {
            newColumnLabels[key] = header;
            newColumnWidths[key] = 250;
            headerToKeyMap[header] = key;
          }
        });

        const newCustomColumns = tableData.headers
          .filter((header) => {
            const key = header.toLowerCase().replace(/\s+/g, '');
            const headerLower = header.toLowerCase().trim();
            const columnExists = allExistingKeys.includes(key) ||
                               Object.keys(columnLabels).some(k => columnLabels[k].toLowerCase().trim() === headerLower);
            return key !== 'day' && !columnExists;
          })
          .map((header) => ({
            key: header.toLowerCase().replace(/\s+/g, ''),
            label: header,
            placeholder: ''
          }));

        // Process rows - find matching rows by day and replace if found
        const updatedRows = [...rows];
        tableData.rows.forEach((dataRow) => {
          const dayCell = dataRow[0] || '';
          const dayLower = dayCell.toLowerCase().trim();
          const existingRowIndex = updatedRows.findIndex(r => (r.day || '').toLowerCase().trim() === dayLower);

          if (existingRowIndex >= 0) {
            // Update existing row
            tableData.headers.forEach((header, index) => {
              const key = headerToKeyMap[header];
              if (key) {
                updatedRows[existingRowIndex][key] = dataRow[index] || '';
              }
            });
          } else {
            // Add new row
            const newRow = { day: dayCell };
            tableData.headers.forEach((header, index) => {
              const key = headerToKeyMap[header];
              if (key && key !== 'day') {
                newRow[key] = dataRow[index] || '';
              }
            });
            updatedRows.push(newRow);
          }
        });

        onChange({
          ...d,
          rows: updatedRows,
          customColumns: [...customColumns, ...newCustomColumns],
          columnLabels: newColumnLabels,
          columnWidths: newColumnWidths
        });

        showAlert('Table imported successfully!', 'success', true);
      }
    } catch (error) {
      console.error('Failed to import pasted data:', error.message);
      showAlert('Failed to import content', 'warning');
    } finally {
      setImporting(false);
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = cleanExtractedText(await extractTextFromFile(file));

      console.log('Extracted text preview:', text.substring(0, 200));
      console.log('Is table structure?', detectTableStructure(text));

      if (detectTableStructure(text)) {
        const tableData = parseTableFromText(text);

        const confirmImport = confirm(
          `Import table with ${tableData.headers.length} columns and ${tableData.rows.length} rows?\n\n` +
          `Columns: ${tableData.headers.join(', ')}\n\n` +
          'This will replace the current table structure entirely.'
        );

        if (confirmImport) {
          const newRows = tableData.rows.map((row) => {
            const newRow = {};
            tableData.headers.forEach((header, index) => {
              const key = header.toLowerCase().replace(/\s+/g, '');
              newRow[key] = row[index] || '';
            });
            return newRow;
          });

          const newCustomColumns = tableData.headers.slice(1).map((header) => ({
            key: header.toLowerCase().replace(/\s+/g, ''),
            label: header,
            placeholder: ''
          }));

          onChange({
            ...d,
            rows: newRows,
            customColumns: newCustomColumns
          });
        }
      } else {
        const segments = parseTextForRows(text, rows.length);
        
        const targetColumn = prompt('Which column should we populate?\n\nOptions: focus, languageTarget, assessment, ' + 
          customColumns.map(c => c.key).join(', '));
        
        if (targetColumn && segments.length > 0) {
          const next = rows.map((row, i) => ({
            ...row,
            [targetColumn]: segments[i] || ''
          }));
          onChange({ ...d, rows: next });
        }
      }
    } catch (error) {
      showAlert('Failed to import file: ' + error.message, 'warning');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

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
        <button onClick={() => setShowAddColumn(!showAddColumn)} style={buttonStyle} disabled={importing}>
          <Plus size={16} /> Add Column
        </button>
        {customColumns.length > 0 && (
          <button onClick={() => setShowRemoveColumn(!showRemoveColumn)} style={buttonStyle} disabled={importing}>
            <Minus size={16} /> Remove Column
          </button>
        )}
      </div>

      {showAddColumn && (
        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 12, color: '#475569' }}>Add a column:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
                style={{ padding: 8, textAlign: 'left', width: columnWidths.day || 150, minWidth: 80 }}
                onResize={({ width }) => updateColumnWidth('day', width)}
              >
                <input
                  type="text"
                  value={columnLabels.day || 'Day'}
                  onChange={(e) => updateColumnLabel('day', e.target.value)}
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
                  {col.label}
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
                    value={row.day || WEEKLY_DAY_LABELS[i] || `Day ${i + 1}`}
                    onChange={(e) => updateRow(i, 'day', e.target.value)}
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
                      placeholder={col.placeholder}
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
