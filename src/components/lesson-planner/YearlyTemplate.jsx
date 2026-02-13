import React from 'react';
import { YEARLY_SECTION_LABELS, PLACEHOLDERS } from '../../templates/lessonTemplates';

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  fontSize: 13,
  fontFamily: 'inherit'
};

const labelStyle = { fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 };

export default function YearlyTemplate({ data = {}, onChange }) {
  const d = data || {};
  const rows = d.rows || YEARLY_SECTION_LABELS.map((section) => ({
    section,
    focus: '',
    languageTarget: '',
    assessment: ''
  }));
  const ph = PLACEHOLDERS.yearly;

  const updateRow = (index, field, value) => {
    const next = [...rows];
    if (!next[index]) next[index] = { section: YEARLY_SECTION_LABELS[index], focus: '', languageTarget: '', assessment: '' };
    next[index] = { ...next[index], [field]: value };
    onChange({ ...d, rows: next });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#fff', borderBottom: '2px solid #334155' }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Section</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Focus</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Language Target</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600 }}>Assessment</th>
            </tr>
          </thead>
          <tbody>
            {YEARLY_SECTION_LABELS.map((section, i) => (
              <tr key={section} style={{ borderBottom: '1px solid #E5E7EB', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#475569', minWidth: 140 }}>{section}</td>
                <td style={{ padding: '8px 12px' }}>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="Focus for this section"
                    value={(rows[i] && rows[i].focus) ?? ''}
                    onChange={(e) => updateRow(i, 'focus', e.target.value)}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="Language target"
                    value={(rows[i] && rows[i].languageTarget) ?? ''}
                    onChange={(e) => updateRow(i, 'languageTarget', e.target.value)}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="Assessment plan"
                    value={(rows[i] && rows[i].assessment) ?? ''}
                    onChange={(e) => updateRow(i, 'assessment', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
