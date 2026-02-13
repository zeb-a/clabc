import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  Save,
  FileText,
  FileDown,
  Check,
  Loader2,
  Search,
  Plus,
  Download,
  Upload,
  Calendar,
  BookOpen
} from 'lucide-react';
import DailyTemplate from './DailyTemplate';
import WeeklyTemplate from './WeeklyTemplate';
import MonthlyTemplate from './MonthlyTemplate';
import YearlyTemplate from './YearlyTemplate';
import api from '../../services/api';
import { exportLessonPlanToPDF, exportLessonPlanToDOCX } from '../../utils/lessonPlanExport';
import {
  DAILY_STAGES,
  WEEKLY_DAY_LABELS,
  MONTHLY_PHASE_LABELS,
  YEARLY_SECTION_LABELS
} from '../../templates/lessonTemplates';

const PERIODS = [
  { value: 'yearly', label: 'Yearly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' }
];

const selectStyle = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #E5E7EB',
  fontSize: 14,
  fontFamily: 'inherit',
  minWidth: 140
};

function formatPlanDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function groupPlansByPeriod(plans) {
  const byPeriod = { daily: [], weekly: [], monthly: [], yearly: [] };
  (plans || []).forEach((p) => {
    if (byPeriod[p.period]) byPeriod[p.period].push(p);
  });
  ['daily', 'weekly', 'monthly', 'yearly'].forEach((period) => {
    byPeriod[period].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
  });
  return byPeriod;
}

export default function LessonPlannerPage({ user, classes, onBack }) {
  const [classId, setClassId] = useState('');
  const [period, setPeriod] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState('');
  const [data, setData] = useState({});
  const [planId, setPlanId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportToClass, setShowExportToClass] = useState(false);
  const [showImportFromClass, setShowImportFromClass] = useState(false);
  const autoSaveRef = useRef(null);

  const selectedClass = classes?.find((c) => c.id === classId);
  const className = selectedClass?.name || '';

  const classPlans = allPlans.filter((p) => p.class_id === classId);
  const filteredPlans = searchQuery
    ? classPlans.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.date || '').toString().includes(searchQuery) ||
          (p.period || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : classPlans;
  const groupedPlans = groupPlansByPeriod(filteredPlans);

  const getInitialDataForPeriod = useCallback((p) => {
    switch (p) {
      case 'daily':
        return {
          objective: '',
          materials: '',
          notes: '',
          stages: DAILY_STAGES.map((s) => ({
            stage: s.stage,
            method: s.method,
            teacherActions: '',
            studentActions: '',
            assessment: ''
          }))
        };
      case 'weekly':
        return {
          rows: WEEKLY_DAY_LABELS.map((day) => ({ day, focus: '', languageTarget: '', assessment: '' })),
          notes: ''
        };
      case 'monthly':
        return {
          rows: MONTHLY_PHASE_LABELS.map((phase) => ({ phase, focus: '', languageTarget: '', assessment: '' })),
          notes: ''
        };
      case 'yearly':
        return {
          rows: YEARLY_SECTION_LABELS.map((section) => ({ section, focus: '', languageTarget: '', assessment: '' })),
          notes: ''
        };
      default:
        return {};
    }
  }, []);

  const loadAllPlans = useCallback(() => {
    if (!user?.email) return;
    setLoadingPlans(true);
    api
      .getLessonPlans(user.email)
      .then((list) => setAllPlans(list || []))
      .catch(() => setAllPlans([]))
      .finally(() => setLoadingPlans(false));
  }, [user?.email]);

  useEffect(() => {
    loadAllPlans();
  }, [loadAllPlans]);

  const handleClassChange = (cid) => {
    setClassId(cid);
    setPlanId(null);
  };

  const handlePeriodChange = (p) => {
    setPeriod(p);
    setPlanId(null);
    setData(getInitialDataForPeriod(p));
  };

  const loadPlan = (plan) => {
    setPlanId(plan.id);
    setPeriod(plan.period);
    setTitle(plan.title || '');
    setDate(plan.date ? String(plan.date).slice(0, 10) : new Date().toISOString().slice(0, 10));
    setData(plan.data || getInitialDataForPeriod(plan.period));
  };

  const startNewPlan = () => {
    setPlanId(null);
    setPeriod('');
    setTitle('');
    setDate(new Date().toISOString().slice(0, 10));
    setData({});
  };

  const handleSave = async () => {
    if (!user?.email || !period || !classId) return;
    setSaving(true);
    try {
      const payload = {
        teacher: user.email,
        class_id: classId,
        period,
        title: title || `${period} plan`,
        date: period === 'daily' ? date : null,
        data
      };
      if (planId) {
        await api.updateLessonPlan(planId, {
          title: payload.title,
          date: payload.date,
          data: payload.data
        });
      } else {
        const created = await api.createLessonPlan(payload);
        setPlanId(created.id);
      }
      setSavedAt(Date.now());
      loadAllPlans();
    } catch (err) {
      console.error('Save failed:', err);
      alert(err?.message || 'Failed to save lesson plan.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!period || !classId || !user?.email) return;
    const id = setInterval(async () => {
      try {
        const payload = {
          teacher: user.email,
          class_id: classId,
          period,
          title: title || `${period} plan`,
          date: period === 'daily' ? date : null,
          data
        };
        if (planId) {
          await api.updateLessonPlan(planId, { title: payload.title, date: payload.date, data: payload.data });
        } else {
          const created = await api.createLessonPlan(payload);
          setPlanId(created.id);
        }
        setSavedAt(Date.now());
        loadAllPlans();
      } catch (e) {
        console.warn('Auto-save failed:', e);
      }
    }, 30000);
    return () => clearInterval(id);
  }, [period, classId, user?.email, data, title, date, planId, loadAllPlans]);

  const handleExportPDF = async () => {
    const plan = { id: planId, period, title, date, data };
    setExporting('pdf');
    try {
      await exportLessonPlanToPDF(plan, className);
    } finally {
      setExporting(null);
    }
  };

  const handleExportDOCX = async () => {
    const plan = { id: planId, period, title, date, data };
    setExporting('docx');
    try {
      await exportLessonPlanToDOCX(plan, className);
    } finally {
      setExporting(null);
    }
  };

  const handleExportToClass = async (targetClassId) => {
    if (!user?.email || !period || !targetClassId) return;
    setSaving(true);
    try {
      await api.createLessonPlan({
        teacher: user.email,
        class_id: targetClassId,
        period,
        title: title || `${period} plan`,
        date: period === 'daily' ? date : null,
        data: { ...data }
      });
      setShowExportToClass(false);
      loadAllPlans();
    } catch (err) {
      alert(err?.message || 'Failed to copy plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleImportFromClass = (sourcePlan, targetClassId) => {
    if (!targetClassId) return;
    setClassId(targetClassId);
    setPeriod(sourcePlan.period);
    setTitle((sourcePlan.title || '') + ' (copy)');
    setDate(sourcePlan.date ? String(sourcePlan.date).slice(0, 10) : new Date().toISOString().slice(0, 10));
    setData(sourcePlan.data || getInitialDataForPeriod(sourcePlan.period));
    setPlanId(null);
    setShowImportFromClass(false);
  };

  const renderTemplate = () => {
    if (!period) return null;
    const common = { data, onChange: setData };
    switch (period) {
      case 'daily':
        return <DailyTemplate {...common} />;
      case 'weekly':
        return <WeeklyTemplate {...common} />;
      case 'monthly':
        return <MonthlyTemplate {...common} />;
      case 'yearly':
        return <YearlyTemplate {...common} />;
      default:
        return null;
    }
  };

  const otherClasses = (classes || []).filter((c) => c.id !== classId);
  const plansFromOtherClasses = allPlans.filter((p) => p.class_id !== classId);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <nav
        className="safe-area-top"
        style={{
          padding: '12px 20px',
          background: '#0f172a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Lesson Plans</h1>
      </nav>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT SIDEBAR - Plan storage */}
        <aside
          style={{
            width: 300,
            minWidth: 280,
            background: '#fff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 8, color: '#475569' }}>
              Class
            </label>
            <select
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
              style={{ ...selectStyle, width: '100%' }}
            >
              <option value="">Select class</option>
              {(classes || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {classId && (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="text"
                    placeholder="Search plans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                <button
                  onClick={startNewPlan}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '2px dashed #94a3b8',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: 12
                  }}
                >
                  <Plus size={18} /> New Plan
                </button>

                {loadingPlans ? (
                  <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : filteredPlans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>
                    No plans yet. Create one.
                  </div>
                ) : (
                  Object.entries(groupedPlans).map(
                    ([periodKey, plans]) =>
                      plans.length > 0 && (
                        <div key={periodKey} style={{ marginBottom: 20 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginBottom: 8,
                              paddingLeft: 4
                            }}
                          >
                            {periodKey}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {plans.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => loadPlan(p)}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: planId === p.id ? '#e0f2fe' : '#f8fafc',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: 13,
                                  color: planId === p.id ? '#0369a1' : '#334155',
                                  borderLeft: planId === p.id ? '3px solid #0ea5e9' : '3px solid transparent'
                                }}
                              >
                                <div style={{ fontWeight: 600, marginBottom: 2 }}>
                                  {p.title || `${p.period} plan`}
                                </div>
                                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                  {formatPlanDate(p.date)}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                  )
                )}
              </div>

              <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowImportFromClass(true)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  <Download size={14} /> Import
                </button>
                <button
                  onClick={() => setShowExportToClass(true)}
                  disabled={!planId && !period}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: planId || period ? 'pointer' : 'not-allowed',
                    color: planId || period ? '#475569' : '#94a3b8'
                  }}
                >
                  <Upload size={14} /> Export
                </button>
              </div>
            </>
          )}
        </aside>

        {/* MAIN CONTENT - Create/Edit */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {!classId ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                color: '#64748b',
                textAlign: 'center'
              }}
            >
              <BookOpen size={48} style={{ marginBottom: 16, opacity: 0.6 }} />
              <p style={{ fontSize: 16 }}>Select a class from the sidebar to view and manage lesson plans.</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  marginBottom: 24,
                  alignItems: 'flex-end'
                }}
              >
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#475569' }}>
                    Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select period</option>
                    {PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                {period === 'daily' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#475569' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={selectStyle}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#475569' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Lesson plan title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ ...selectStyle, width: '100%' }}
                  />
                </div>
              </div>

              {period && (
                <>
                  <div
                    style={{
                      background: 'white',
                      borderRadius: 16,
                      padding: 28,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      marginBottom: 24,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {renderTemplate()}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#0ea5e9',
                        color: 'white',
                        fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                      Save
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={!!exporting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        fontWeight: 600,
                        cursor: exporting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {exporting === 'pdf' ? (
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <FileText size={18} />
                      )}
                      PDF
                    </button>
                    <button
                      onClick={handleExportDOCX}
                      disabled={!!exporting}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        fontWeight: 600,
                        cursor: exporting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {exporting === 'docx' ? (
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <FileDown size={18} />
                      )}
                      DOCX
                    </button>
                    {savedAt && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 14, fontWeight: 500 }}>
                        <Check size={16} /> Saved
                      </span>
                    )}
                  </div>
                </>
              )}

              {classId && !period && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 60,
                    color: '#64748b',
                    fontSize: 15
                  }}
                >
                  <Calendar size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p>Select a period to create or edit a lesson plan.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Export to class modal */}
      {showExportToClass && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowExportToClass(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              width: 360,
              maxWidth: '90vw'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Copy plan to class</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Duplicate this plan into another class.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {otherClasses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleExportToClass(c.id)}
                  disabled={saving}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    textAlign: 'left',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {c.name}
                </button>
              ))}
              {otherClasses.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No other classes to copy to.</p>
              )}
            </div>
            <button
              onClick={() => setShowExportToClass(false)}
              style={{
                marginTop: 16,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Import from class modal */}
      {showImportFromClass && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowImportFromClass(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              width: 480,
              maxWidth: '90vw',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Import plan from another class</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Copy a plan from another class into this one.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plansFromOtherClasses.map((p) => {
                const sourceClass = classes?.find((c) => c.id === p.class_id);
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.title || `${p.period} plan`}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {sourceClass?.name} · {p.period} · {formatPlanDate(p.date)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleImportFromClass(p, classId)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#0ea5e9',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Import
                    </button>
                  </div>
                );
              })}
              {plansFromOtherClasses.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: 13 }}>No plans in other classes to import.</p>
              )}
            </div>
            <button
              onClick={() => setShowImportFromClass(false)}
              style={{
                marginTop: 16,
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
