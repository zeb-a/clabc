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
  BookOpen,
  Trash2,
  HelpCircle,
  X,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import DailyTemplate from './DailyTemplate';
import WeeklyTemplate from './WeeklyTemplate';
import MonthlyTemplate from './MonthlyTemplate';
import YearlyTemplate from './YearlyTemplate';
import HelpGuide from './HelpGuide';
import api from '../../services/api';
import { exportLessonPlanToPDF, exportLessonPlanToDOCX } from '../../utils/lessonPlanExport';
import { parseTableText, matchAndApplyToPlanData, parseTableMatrix } from '../../utils/lessonPlanImport';
import {
  DAILY_STAGES,
  WEEKLY_DAY_LABELS,
  MONTHLY_PHASE_LABELS,
  YEARLY_SECTION_LABELS
} from '../../templates/lessonTemplates';

// In-page Alert Component
function InPageAlert({ message, type = 'info', onDismiss }) {
  const colors = {
    info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: Info },
    success: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', icon: CheckCircle },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: AlertTriangle }
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

function formatPlanDate(dateStr, period, data) {
  if (period === 'weekly' && data?.weeklyDates) {
    const from = new Date(data.weeklyDates.from);
    const to = new Date(data.weeklyDates.to);
    return `${from.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${to.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  if (period === 'monthly' && data?.monthlyDate) {
    const [year, month] = data.monthlyDate.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  if (period === 'yearly' && data?.yearlyDate) {
    return data.yearlyDate;
  }
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

const RawTableView = ({ rawTable }) => (
  <div style={{ overflowX: 'auto', padding: 12 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f3f4f6' }}>
          {(rawTable.headers || rawTable.matrix[0] || []).map((h, i) => (
            <th key={i} style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>{h || `Column ${i + 1}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(rawTable.matrix || []).map((row, ri) => (
          <tr key={ri}>
            {Array.from({ length: Math.max((rawTable.headers || []).length, row.length) }).map((_, ci) => (
              <td key={ci} style={{ padding: 8, border: '1px solid #e5e7eb', verticalAlign: 'top' }}>{(row[ci] || '').toString()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function LessonPlannerPage({ user, classes, onBack }) {
  const [classId, setClassId] = useState('');
  const [period, setPeriod] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weeklyFromDate, setWeeklyFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weeklyToDate, setWeeklyToDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [monthlyDate, setMonthlyDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 7);
  });
  const [yearlyDate, setYearlyDate] = useState(() => {
    return String(new Date().getFullYear());
  });
  const [title, setTitle] = useState('');
  const [data, setData] = useState({});
  const [planId, setPlanId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [pastePanelOpen, setPastePanelOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState(null);
  const [showAllForPeriod, setShowAllForPeriod] = useState({ daily: false, weekly: false, monthly: false, yearly: false });
  const [confirmDeletePlanId, setConfirmDeletePlanId] = useState(null);
  // file import removed: prefer paste-based imports and raw-table save
  const [collapsedPeriods, setCollapsedPeriods] = useState({ daily: false, weekly: false, monthly: false, yearly: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportToClass, setShowExportToClass] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [pageAlert, setPageAlert] = useState(null);

  const selectedClass = classes?.find((c) => c.id === classId);
  const className = selectedClass?.name || '';

  const showAlert = (message, type = 'info', autoDismiss = false) => {
    setPageAlert({ message, type });
    if (autoDismiss) {
      setTimeout(() => setPageAlert(null), 3000);
    }
  };

  const classPlans = allPlans.filter((p) => String(p.class_id) === String(classId));

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
    if (p === 'weekly') {
      setWeeklyFromDate(new Date().toISOString().slice(0, 10));
      const d = new Date();
      d.setDate(d.getDate() + 6);
      setWeeklyToDate(d.toISOString().slice(0, 10));
    } else if (p === 'monthly') {
      setMonthlyDate(new Date().toISOString().slice(0, 7));
    } else if (p === 'yearly') {
      setYearlyDate(String(new Date().getFullYear()));
    }
  };

  const loadPlan = (plan) => {
    setPlanId(plan.id);
    setPeriod(plan.period);
    setTitle(plan.title || '');
    setDate(plan.date ? String(plan.date).slice(0, 10) : new Date().toISOString().slice(0, 10));
    if (plan.period === 'weekly' && plan.data?.weeklyDates) {
      setWeeklyFromDate(plan.data.weeklyDates.from || new Date().toISOString().slice(0, 10));
      setWeeklyToDate(plan.data.weeklyDates.to || new Date().toISOString().slice(0, 10));
    } else if (plan.period === 'monthly' && plan.data?.monthlyDate) {
      setMonthlyDate(plan.data.monthlyDate);
    } else if (plan.period === 'yearly' && plan.data?.yearlyDate) {
      setYearlyDate(plan.data.yearlyDate);
    }
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
      const enhancedData = { ...data };
      if (period === 'weekly') {
        enhancedData.weeklyDates = { from: weeklyFromDate, to: weeklyToDate };
      } else if (period === 'monthly') {
        enhancedData.monthlyDate = monthlyDate;
      } else if (period === 'yearly') {
        enhancedData.yearlyDate = yearlyDate;
      }
      const payload = {
        teacher: user.email,
        class_id: classId,
        period,
        title: title || `${period} plan`,
        date: period === 'daily' ? date : null,
        data: enhancedData
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
      showAlert('Lesson plan saved successfully!', 'success', true);
    } catch (err) {
      console.error('Save failed:', err);
      showAlert(err?.message || 'Failed to save lesson plan.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save disabled — saves occur only when the user clicks the Save button.

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
      showAlert('Plan copied to class successfully!', 'success', true);
    } catch (err) {
      showAlert(err?.message || 'Failed to copy plan.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  // Import-from-class removed: copying between classes handled via Export/Copy workflows.

  // Save the currently-imported raw table (matrix) as a monthly plan
  const handleSaveRawTable = async () => {
    if (!data || !data.rawTable || !data.rawTable.matrix) {
      showAlert('No raw table to save.', 'warning');
      return;
    }
    if (!user?.email || !classId) {
      showAlert('Please select a class before saving the table.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const matrix = data.rawTable.matrix;
      // Map matrix rows to monthly rows: first column -> phase, next columns -> focus/languageTarget/assessment
      const rows = matrix.map((r, i) => {
        const cells = r.map(c => (c || '').toString().trim());
        const phase = cells[0] || `Row ${i + 1}`;
        const focus = cells[1] || '';
        const languageTarget = cells[2] || '';
        const assessment = cells.slice(3).filter(Boolean).join(' ');
        return { phase, focus, languageTarget, assessment };
      });

      const payload = {
        teacher: user.email,
        class_id: classId,
        period: 'monthly',
        title: title || `Imported table ${new Date().toLocaleString()}`,
        date: null,
        data: { rows, monthlyDate }
      };

      const created = await api.createLessonPlan(payload);
      setPlanId(created.id);
      setPeriod('monthly');
      setData(payload.data);
      loadAllPlans();
      showAlert('Raw table saved as monthly plan.', 'success', true);
    } catch (err) {
      console.error('Save raw table failed:', err);
      showAlert(err?.message || 'Failed to save raw table.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planIdToDelete, e) => {
    e.stopPropagation();
    // Show in-page confirm modal instead of blocking window.confirm
    setConfirmDeletePlanId(planIdToDelete);
  };

  const confirmDelete = async () => {
    const planIdToDelete = confirmDeletePlanId;
    if (!planIdToDelete) return;
    try {
      await api.deleteLessonPlan(planIdToDelete);
      if (planId === planIdToDelete) {
        startNewPlan();
      }
      loadAllPlans();
      showAlert('Lesson plan deleted successfully!', 'success', true);
    } catch (err) {
      console.error('Delete failed:', err);
      showAlert(err?.message || 'Failed to delete lesson plan.', 'warning');
    } finally {
      setConfirmDeletePlanId(null);
    }
  };

  const cancelDelete = () => setConfirmDeletePlanId(null);

  const processImportedTable = (text) => {
    try {
      const { headers, rows } = parseTableText(text);
      console.log('Import parse result:', { headers, sampleRows: rows.slice(0, 6) });
      if (!headers.length || !rows.length) {
        setPasteError('No table data found.');
        return;
      }
      const { matched, data: newData } = matchAndApplyToPlanData(period || 'weekly', data, headers, rows);
      if (matched) {
        setData(newData);
        showAlert('Imported and merged into current plan.', 'success', true);
      } else {
        // If mapping produced empty template rows, fall back to a raw table preview
        const allEmpty = Array.isArray(newData.rows) && newData.rows.every(r => {
          return Object.values(r).every(v => (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')));
        });
        if (allEmpty) {
          const { headers: matrixHeaders, matrix } = parseTableMatrix(text);
          setPeriod('raw');
          setData({ rawTable: { headers: matrixHeaders, matrix } });
          showAlert('Table imported as raw table. Please review and save.', 'info', true);
          return;
        }
        setData(newData);
        showAlert('Imported table mapped to plan template.', 'success', true);
      }
      setPasteError(null);
    } catch (err) {
      setPasteError('Failed to parse table: ' + (err?.message || err));
    }
  };

  // Renders the appropriate template or raw table view
  const renderTemplate = () => {
    if (!period) return null;
    // If a raw extracted table is present, show a preview table
    if (data && data.rawTable) {
      return <RawTableView rawTable={data.rawTable} />;
    }
    const common = { data, onChange: setData };
    switch (period) {
      case 'daily':
        return <DailyTemplate {...common} />;
      case 'weekly':
        return <WeeklyTemplate {...common} weeklyDates={{ from: weeklyFromDate, to: weeklyToDate }} />;
      case 'monthly':
        return <MonthlyTemplate {...common} monthlyDate={monthlyDate} />;
      case 'yearly':
        return <YearlyTemplate {...common} yearlyDate={yearlyDate} />;
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
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, flex: 1 }}>Lesson Plans</h1>
        <button
          onClick={() => setShowHelpGuide(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
          title="How to use Lesson Planner"
        >
          <HelpCircle size={18} /> Help
        </button>
      </nav>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {pageAlert && (
          <div style={{
            position: 'fixed',
            top: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: '600px',
            width: '90%'
          }}>
            <InPageAlert
              message={pageAlert.message}
              type={pageAlert.type}
              onDismiss={() => setPageAlert(null)}
            />
          </div>
        )}
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
                  Object.entries(groupedPlans).map(([periodKey, plans]) => {
                    if (!plans || plans.length === 0) return null;
                    return (
                      <div key={periodKey} style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingLeft: 4 }}>
                          <button
                            onClick={() => setCollapsedPeriods((s) => ({ ...s, [periodKey]: !s[periodKey] }))}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            {periodKey} · {plans.length}
                          </button>
                          {plans.length > 8 && (
                            <button
                              onClick={() => setShowAllForPeriod((s) => ({ ...s, [periodKey]: !s[periodKey] }))}
                              style={{ fontSize: 12, color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              {showAllForPeriod[periodKey] ? 'Show less' : `Show all (${plans.length})`}
                            </button>
                          )}
                        </div>
                        {!collapsedPeriods[periodKey] && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {(showAllForPeriod[periodKey] ? plans : plans.slice(0, 8)).map((p) => {
                              return (
                                <div key={p.id} style={{ position: 'relative' }}>
                                  <button
                                    onClick={() => loadPlan(p)}
                                    style={{
                                      width: '100%',
                                      padding: '10px 40px 10px 12px',
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
                                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.title || `${p.period} plan`}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatPlanDate(p.date, p.period, p.data)}</div>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeletePlan(p.id, e)}
                                    style={{
                                      position: 'absolute',
                                      right: 8,
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      padding: '4px 6px',
                                      borderRadius: 4,
                                      border: 'none',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      color: '#ef4444',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title="Delete plan"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8 }}>
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
                {period === 'weekly' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#475569' }}>
                        From
                      </label>
                      <input
                        type="date"
                        value={weeklyFromDate}
                        onChange={(e) => setWeeklyFromDate(e.target.value)}
                        style={selectStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#475569' }}>
                        To
                      </label>
                      <input
                        type="date"
                        value={weeklyToDate}
                        onChange={(e) => setWeeklyToDate(e.target.value)}
                        style={selectStyle}
                      />
                    </div>
                  </>
                )}
                {period === 'monthly' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#475569' }}>
                      Month
                    </label>
                    <input
                      type="month"
                      value={monthlyDate}
                      onChange={(e) => setMonthlyDate(e.target.value)}
                      style={selectStyle}
                    />
                  </div>
                )}
                {period === 'yearly' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#475569' }}>
                      Year
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={yearlyDate}
                      onChange={(e) => setYearlyDate(e.target.value)}
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
                  <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setPastePanelOpen((s) => !s)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Paste table
                    </button>
                  </div>

                  {pastePanelOpen && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button
                          onClick={async () => {
                            try {
                              const txt = await navigator.clipboard.readText();
                              setPasteText(txt);
                              setPasteError(null);
                            } catch (err) {
                              setPasteError('Unable to read clipboard. Paste manually.');
                            }
                          }}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600 }}
                        >
                          Paste from clipboard
                        </button>
                        <button
                          onClick={() => {
                            setPasteText('');
                            setPasteError(null);
                          }}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600 }}
                        >
                          Clear
                        </button>
                      </div>
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder={'Paste table text here (first row should be headers).'}
                        style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                      />
                      {pasteError && <div style={{ color: '#b91c1c', marginTop: 8 }}>{pasteError}</div>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => processImportedTable(pasteText)}
                          style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700 }}
                        >
                          Import
                        </button>
                        <button
                          onClick={() => {
                            setPasteText('');
                            setPastePanelOpen(false);
                            setPasteError(null);
                          }}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

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

      {/* Import-from-class removed per request */}

      {/* Confirm delete modal (in-page) */}
      {confirmDeletePlanId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}
          onClick={() => setConfirmDeletePlanId(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: 20, width: 420, maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>Delete lesson plan</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b' }}>Are you sure you want to delete this lesson plan? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={cancelDelete} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#ef4444', color: 'white', fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showHelpGuide && <HelpGuide onClose={() => setShowHelpGuide(false)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
