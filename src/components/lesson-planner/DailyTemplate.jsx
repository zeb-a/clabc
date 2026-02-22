import React from 'react';
import { useTranslation } from '../../i18n';
import { DAILY_STAGES, PLACEHOLDERS } from '../../templates/lessonTemplates';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  fontSize: 14,
  fontFamily: 'inherit',
  backgroundColor: '#ffffff'
};

const highlightedInputStyle = {
  border: '3px solid #DC2626',
  backgroundColor: '#FFEBEE',
  boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.2)'
};

const labelStyle = { fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 };

export default function DailyTemplate({ data = {}, onChange, highlightedCells = [], clearHighlight }) {
  const { t } = useTranslation();
  const d = data || {};
  const stages = d.stages || DAILY_STAGES.map((s) => ({
    stage: s.stage,
    method: s.method,
    teacherActions: '',
    studentActions: '',
    assessment: ''
  }));

  const updateStage = (index, field, value) => {
    const next = [...stages];
    if (!next[index]) next[index] = { ...DAILY_STAGES[index], teacherActions: '', studentActions: '', assessment: '' };
    next[index] = { ...next[index], [field]: value };
    onChange({ ...d, stages: next });
    clearHighlight?.();
  };

  const isHighlighted = (type, index = null, field = null) => {
    if (!highlightedCells || highlightedCells.length === 0) return false;
    if (type === 'objective') {
      return highlightedCells.some(c => c.type === 'objective');
    }
    if (type === 'materials') {
      return highlightedCells.some(c => c.type === 'materials');
    }
    if (type === 'stage') {
      return highlightedCells.some(c => c.type === 'stage' && c.index === index && c.field === field);
    }
    return false;
  };

  const ph = PLACEHOLDERS.daily;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>{t('lesson_planner.objective')}</label>
        <textarea
          rows={2}
          style={{
            ...inputStyle,
            minHeight: 60,
            ...(isHighlighted('objective') ? highlightedInputStyle : {})
          }}
          placeholder={ph.objective}
          value={d.objective ?? ''}
          onChange={(e) => { onChange({ ...d, objective: e.target.value }); clearHighlight?.(); }}
        />
      </div>
      <div>
        <label style={labelStyle}>{t('lesson_planner.materials')}</label>
        <input
          type="text"
          style={{
            ...inputStyle,
            ...(isHighlighted('materials') ? highlightedInputStyle : {})
          }}
          placeholder={ph.materials}
          value={d.materials ?? ''}
          onChange={(e) => { onChange({ ...d, materials: e.target.value }); clearHighlight?.(); }}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F3F4F6', borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>{t('lesson_planner.stage')}</th>
              <th style={{ padding: 10, textAlign: 'left' }}>{t('lesson_planner.method')}</th>
              <th style={{ padding: 10, textAlign: 'left' }}>{t('lesson_planner.teacher_actions')}</th>
              <th style={{ padding: 10, textAlign: 'left' }}>{t('lesson_planner.student_actions')}</th>
              <th style={{ padding: 10, textAlign: 'left' }}>{t('lesson_planner.assessment')}</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_STAGES.map((s, i) => (
              <tr key={s.stage} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: 10, fontWeight: 600, verticalAlign: 'top' }}>{s.stage}</td>
                <td style={{ padding: 10, color: '#6B7280', verticalAlign: 'top' }}>{s.method}</td>
                <td style={{ padding: 10, verticalAlign: 'top' }}>
                  <textarea
                    rows={2}
                    style={{
                      ...inputStyle,
                      minHeight: 50,
                      margin: 0,
                      ...(isHighlighted('stage', i, 'teacherActions') ? highlightedInputStyle : {})
                    }}
                    placeholder={s.teacherActionsPlaceholder}
                    value={(stages[i] && stages[i].teacherActions) ?? ''}
                    onChange={(e) => updateStage(i, 'teacherActions', e.target.value)}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: 'top' }}>
                  <textarea
                    rows={2}
                    style={{
                      ...inputStyle,
                      minHeight: 50,
                      margin: 0,
                      ...(isHighlighted('stage', i, 'studentActions') ? highlightedInputStyle : {})
                    }}
                    placeholder={s.studentActionsPlaceholder}
                    value={(stages[i] && stages[i].studentActions) ?? ''}
                    onChange={(e) => updateStage(i, 'studentActions', e.target.value)}
                  />
                </td>
                <td style={{ padding: 10, verticalAlign: 'top' }}>
                  <textarea
                    rows={2}
                    style={{
                      ...inputStyle,
                      minHeight: 50,
                      margin: 0,
                      ...(isHighlighted('stage', i, 'assessment') ? highlightedInputStyle : {})
                    }}
                    placeholder={s.assessmentPlaceholder}
                    value={(stages[i] && stages[i].assessment) ?? ''}
                    onChange={(e) => updateStage(i, 'assessment', e.target.value)}
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
          style={{ ...inputStyle, minHeight: 60 }}
          placeholder={ph.notes}
          value={d.notes ?? ''}
          onChange={(e) => onChange({ ...d, notes: e.target.value })}
        />
      </div>
    </div>
  );
}
