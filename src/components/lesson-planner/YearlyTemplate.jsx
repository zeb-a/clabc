import React from 'react';
import { useTranslation } from '../../i18n';
import { YEARLY_SECTION_LABELS, PLACEHOLDERS } from '../../templates/lessonTemplates';

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 13,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)',
  transition: 'all 0.2s ease'
};

const highlightedInputStyle = {
  border: '3px solid #DC2626',
  background: '#FFEBEE',
  boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.3)'
};

const labelStyle = { fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 };

export default function YearlyTemplate({ data = {}, onChange, highlightedCells = [], clearHighlight }) {
  const { t } = useTranslation();
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
    clearHighlight?.();
  };

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
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, letterSpacing: '0.5px' }}>{t('lesson_planner.section')}</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, letterSpacing: '0.5px' }}>{t('lesson_planner.focus')}</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, letterSpacing: '0.5px' }}>{t('lesson_planner.language_target')}</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, letterSpacing: '0.5px' }}>{t('lesson_planner.assessment')}</th>
            </tr>
          </thead>
          <tbody>
            {YEARLY_SECTION_LABELS.map((section, i) => (
              <tr key={section} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(14, 165, 233, 0.02) 100%)' : 'linear-gradient(90deg, rgba(248,250,252,1) 0%, rgba(14, 165, 233, 0.03) 100%)', transition: 'background 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(90deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.06) 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(14, 165, 233, 0.02) 100%)' : 'linear-gradient(90deg, rgba(248,250,252,1) 0%, rgba(14, 165, 233, 0.03) 100%)'}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0ea5e9', minWidth: 140, fontSize: 12, letterSpacing: '0.3px' }}>{section}</td>
                <td style={{ padding: '8px 12px' }}>
                  <textarea
                    rows={2}
                    style={{
                      ...inputStyle,
                      minHeight: 60,
                      padding: '10px 12px',
                      resize: 'vertical',
                      ...(isHighlighted(i, 'focus') ? highlightedInputStyle : {})
                    }}
                    placeholder={t('lesson_planner.focus_placeholder')}
                    value={(rows[i] && rows[i].focus) ?? ''}
                    onChange={(e) => updateRow(i, 'focus', e.target.value)}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <textarea
                    rows={2}
                    style={{
                      ...inputStyle,
                      minHeight: 60,
                      padding: '10px 12px',
                      resize: 'vertical',
                      ...(isHighlighted(i, 'languageTarget') ? highlightedInputStyle : {})
                    }}
                    placeholder={t('lesson_planner.language_target_placeholder')}
                    value={(rows[i] && rows[i].languageTarget) ?? ''}
                    onChange={(e) => updateRow(i, 'languageTarget', e.target.value)}
                  />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <textarea
                    rows={2}
                    style={{
                      ...inputStyle,
                      minHeight: 60,
                      padding: '10px 12px',
                      resize: 'vertical',
                      ...(isHighlighted(i, 'assessment') ? highlightedInputStyle : {})
                    }}
                    placeholder={t('lesson_planner.assessment_placeholder')}
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
        <label style={labelStyle}>{t('lesson_planner.notes')}</label>
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
