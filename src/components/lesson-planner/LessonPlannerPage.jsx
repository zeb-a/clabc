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
  PanelLeftClose,
  PanelLeft,
  Trash2,
  GripVertical
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
  minWidth: 140,
  color: '#1e293b',
  background: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23475569\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  paddingRight: '32px'
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

/** Returns { isEmpty: boolean, emptyCells: Record<string, true> } - empty table or cells with no content */
function getTableValidation(data, period) {
  const emptyCells = {};
  const isStrEmpty = (v) => v == null || String(v).trim() === '';

  if (period === 'daily') {
    const stages = data.stages || [];
    stages.forEach((s, i) => {
      if (!s) return;
      Object.keys(s).forEach((f) => {
        if (isStrEmpty(s[f])) emptyCells[`${i}-${f}`] = true;
      });
    });
    const isEmpty = stages.length === 0 || !stages.some(s => Object.values(s || {}).some(v => !isStrEmpty(v)));
    return { isEmpty, emptyCells };
  }

  if (['weekly', 'monthly', 'yearly'].includes(period)) {
    const rows = data.rows || [];
    rows.forEach((r, i) => {
      if (!r) return;
      Object.keys(r).forEach((col) => {
        if (isStrEmpty(r[col])) emptyCells[`${i}-${col}`] = true;
      });
    });
    const isEmpty = rows.length === 0 || !rows.some(r => Object.values(r || {}).some(v => !isStrEmpty(v)));
    return { isEmpty, emptyCells };
  }

  return { isEmpty: true, emptyCells };
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
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [monthYear, setMonthYear] = useState(() => new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [expandedInputs, setExpandedInputs] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [emptyCellsHighlight, setEmptyCellsHighlight] = useState({});
  const [planOrder, setPlanOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('lessonPlanner_planOrder');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [draggingPlanId, setDraggingPlanId] = useState(null);
  const [dragOverPlanId, setDragOverPlanId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, plan: null });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, visible: true });
  }, []);

  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 4000);
    return () => clearTimeout(t);
  }, [toast.visible, toast.message]);

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

  const handleDeletePlanClick = (e, plan) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, plan });
  };

  const handleDeleteConfirm = async () => {
    const plan = deleteConfirm.plan;
    setDeleteConfirm({ show: false, plan: null });
    if (!plan) return;
    try {
      await api.deleteLessonPlan(plan.id);
      if (planId === plan.id) {
        setPlanId(null);
        setPeriod('');
        setTitle('');
        setData({});
      }
      loadAllPlans();
      showToast('Lesson plan deleted.', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to delete lesson plan.', 'error');
    }
  };

  const persistPlanOrder = useCallback((next) => {
    setPlanOrder(next);
    try {
      localStorage.setItem('lessonPlanner_planOrder', JSON.stringify(next));
    } catch {}
  }, []);

  const getOrderedPlansForPeriod = useCallback((period, plans) => {
    const order = planOrder[classId]?.[period];
    if (!order?.length) return plans;
    const byId = Object.fromEntries(plans.map(p => [p.id, p]));
    const ordered = [];
    order.forEach(id => {
      if (byId[id]) { ordered.push(byId[id]); delete byId[id]; }
    });
    Object.values(byId).forEach(p => ordered.push(p));
    return ordered;
  }, [planOrder, classId]);

  const handleDragStart = (e, plan, period) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ planId: plan.id, period }));
    e.dataTransfer.setData('application/json', JSON.stringify({ planId: plan.id, period }));
    setDraggingPlanId(plan.id);
  };

  const handleDragOver = (e, plan) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPlanId(plan.id);
  };

  const handleDragLeave = () => setDragOverPlanId(null);

  const handleDrop = (e, targetPlan, period) => {
    e.preventDefault();
    setDraggingPlanId(null);
    setDragOverPlanId(null);
    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain'));
    } catch {
      return;
    }
    const { planId: sourceId } = data;
    if (!sourceId || sourceId === targetPlan.id) return;
    const plans = groupedPlans[period] || [];
    const sourceIdx = plans.findIndex(p => p.id === sourceId);
    const targetIdx = plans.findIndex(p => p.id === targetPlan.id);
    if (sourceIdx < 0 || targetIdx < 0) return;
    const reordered = [...plans];
    const [removed] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, removed);
    const newOrder = reordered.map(p => p.id);
    const next = { ...planOrder };
    if (!next[classId]) next[classId] = {};
    next[classId] = { ...next[classId], [period]: newOrder };
    persistPlanOrder(next);
  };

  const handleDragEnd = () => {
    setDraggingPlanId(null);
    setDragOverPlanId(null);
  };

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

  const performSave = async () => {
    if (!user?.email || !period || !classId) return;
    setSaving(true);
    setShowSaveConfirmModal(false);
    setEmptyCellsHighlight({});
    try {
      const dateValue = 
        period === 'daily' ? date :
        period === 'weekly' ? `${dateFrom},${dateTo}` :
        period === 'monthly' ? monthYear :
        period === 'yearly' ? year : null;
      const payload = {
        teacher: user.email,
        class_id: classId,
        period,
        title: title || `${period} plan`,
        date: dateValue,
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
      showToast(err?.message || 'Failed to save lesson plan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user?.email || !period || !classId) return;
    const { isEmpty, emptyCells } = getTableValidation(data, period);
    if (isEmpty) {
      showToast('Cannot save: the lesson plan table is empty. Add content to at least one cell before saving.', 'warning');
      return;
    }
    const emptyCount = Object.keys(emptyCells).length;
    if (emptyCount > 0) {
      setEmptyCellsHighlight(emptyCells);
      setShowSaveConfirmModal(true);
      return;
    }
    await performSave();
  };

  const handleExportPDF = async () => {
    const dateInfo = 
      period === 'daily' ? date :
      period === 'weekly' ? `${dateFrom} to ${dateTo}` :
      period === 'monthly' ? monthYear :
      period === 'yearly' ? year : '';
    const plan = { id: planId, period, title, date: dateInfo, data };
    setExporting('pdf');
    try {
      await exportLessonPlanToPDF(plan, className);
    } finally {
      setExporting(null);
    }
  };

  const handleExportDOCX = async () => {
    const dateInfo = 
      period === 'daily' ? date :
      period === 'weekly' ? `${dateFrom} to ${dateTo}` :
      period === 'monthly' ? monthYear :
      period === 'yearly' ? year : '';
    const plan = { id: planId, period, title, date: dateInfo, data };
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
      showToast(err?.message || 'Failed to copy plan.', 'error');
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

  const handlePasteTable = () => {
    if (!pastedContent.trim() || !period) {
      showToast('Please select a period first and paste table data.', 'warning');
      return;
    }

    try {
      // Parse tab-separated or comma-separated data
      const lines = pastedContent.trim().split('\n');
      const parsedRows = lines.map(line => {
        const cells = line.split(/\t|,/).map(cell => cell.trim());
        return cells;
      }).filter(row => row.some(cell => cell)); // Filter empty rows

      if (parsedRows.length === 0) {
        showToast('No valid data found to paste.', 'warning');
        return;
      }

      // Update data based on period
      const updatedData = { ...data };

      if (period === 'weekly' || period === 'monthly' || period === 'yearly') {
        // For table-based periods, update rows
        const rowKey = 'rows';
        if (!updatedData[rowKey]) {
          updatedData[rowKey] = [];
        }

        // Map pasted data to existing row structure
        parsedRows.forEach((row, idx) => {
          if (updatedData[rowKey][idx]) {
            const keys = Object.keys(updatedData[rowKey][idx]).filter(k => k !== 'day' && k !== 'phase' && k !== 'section');
            keys.forEach((key, cellIdx) => {
              if (cellIdx < row.length) {
                updatedData[rowKey][idx][key] = row[cellIdx];
              }
            });
          }
        });
      }

      setData(updatedData);
      setPastedContent('');
      setShowPasteModal(false);
      showToast('Table data pasted successfully!', 'success');
    } catch (err) {
      console.error('Paste error:', err);
      showToast('Error parsing pasted data. Make sure it\'s tab or comma-separated.', 'error');
    }
  };

  const renderTemplate = () => {
    if (!period) return null;
    const highlightEmpty = showSaveConfirmModal ? emptyCellsHighlight : {};
    const common = { data, onChange: setData, highlightEmpty };
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

  const emptyCount = Object.keys(emptyCellsHighlight).length;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <nav
        className="safe-area-top"
        style={{
          padding: '12px 20px',
          background: '#fff',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderBottom: '1px solid #E5E7EB'
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
            border: '1px solid #E5E7EB',
            background: '#fff',
            color: '#374151',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b', flex: 1 }}>Lesson Plans</h1>
        <button
          onClick={() => setSidebarVisible(!sidebarVisible)}
          title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 8,
            border: '1px solid #E5E7EB',
            background: '#fff',
            color: '#374151',
            cursor: 'pointer'
          }}
        >
          {sidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>
      </nav>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sidebarVisible && (
        <aside
          style={{
            width: 300,
            minWidth: 280,
            background: '#fff',
            borderRight: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: 16, borderBottom: '1px solid #E5E7EB' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#374151' }}>
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
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
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
                      padding: '10px 14px 10px 36px',
                      borderRadius: 10,
                      border: '1px solid #E5E7EB',
                      fontSize: 14,
                      fontFamily: 'inherit'
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
                    ([periodKey, plans]) => {
                      const orderedPlans = getOrderedPlansForPeriod(periodKey, plans);
                      return orderedPlans.length > 0 && (
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
                            {orderedPlans.map((p) => (
                              <div
                                key={p.id}
                                onDragOver={(e) => handleDragOver(e, p)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, p, periodKey)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '6px 8px',
                                  borderRadius: 8,
                                  background: planId === p.id ? '#e0f2fe' : '#f8fafc',
                                  borderLeft: planId === p.id ? '3px solid #0ea5e9' : '3px solid transparent',
                                  opacity: draggingPlanId === p.id ? 0.5 : 1,
                                  outline: dragOverPlanId === p.id ? '2px dashed #0ea5e9' : 'none'
                                }}
                              >
                                <div
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, p, periodKey)}
                                  onDragEnd={handleDragEnd}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#94a3b8',
                                    cursor: 'grab',
                                    flexShrink: 0,
                                    padding: 2
                                  }}
                                  title="Drag to reorder"
                                >
                                  <GripVertical size={14} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => loadPlan(p)}
                                  style={{
                                    flex: 1,
                                    padding: '4px 4px',
                                    border: 'none',
                                    background: 'transparent',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: planId === p.id ? '#0369a1' : '#334155',
                                    minWidth: 0
                                  }}
                                >
                                  <div style={{ fontWeight: 600, marginBottom: 2 }}>
                                    {p.title || `${p.period} plan`}
                                  </div>
                                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                    {formatPlanDate(p.date)}
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeletePlanClick(e, p)}
                                  title="Delete plan"
                                  style={{
                                    padding: 4,
                                    borderRadius: 6,
                                    border: 'none',
                                    background: 'rgba(239,68,68,0.15)',
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
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
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
                    border: '1px solid #E5E7EB',
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
                    border: '1px solid #E5E7EB',
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
        )}

        {/* MAIN CONTENT - Create/Edit */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', minWidth: 0, transition: 'padding 0.3s ease' }}>
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
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
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
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
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
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
                        From
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={selectStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
                        To
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={selectStyle}
                      />
                    </div>
                  </>
                )}
                {period === 'monthly' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
                      Month & Year
                    </label>
                    <input
                      type="month"
                      value={monthYear}
                      onChange={(e) => setMonthYear(e.target.value)}
                      style={selectStyle}
                    />
                  </div>
                )}
                {period === 'yearly' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
                      Year
                    </label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={{ ...selectStyle, width: '120px' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#374151' }}>
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
                      border: '1px solid #E5E7EB'
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
                      onClick={() => setShowPasteModal(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 20px',
                        borderRadius: 10,
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={18} />
                      Paste Table
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
                        border: '1px solid #E5E7EB',
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
                        border: '1px solid #E5E7EB',
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
                    border: '1px solid #E5E7EB',
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
                border: '1px solid #E5E7EB',
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
                      border: '1px solid #E5E7EB',
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
                border: '1px solid #E5E7EB',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPasteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowPasteModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              width: '90%',
              maxWidth: 500,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              cursor: 'default'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 8px 0', fontSize: 20, color: '#1e293b' }}>Paste Table Data</h2>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#64748b' }}>
              Paste tab or comma-separated values. First row will be used as headers.
            </p>
            
            <textarea
              value={pastedContent}
              onChange={e => setPastedContent(e.target.value)}
              placeholder="Paste your table data here (tab or comma-separated)&#10;&#10;Example:&#10;Monday	Introduction	30 min&#10;Tuesday	Practice	45 min"
              style={{
                width: '100%',
                minHeight: 180,
                padding: 12,
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontFamily: 'monospace',
                fontSize: 12,
                resize: 'vertical',
                boxSizing: 'border-box',
                color: '#1e293b'
              }}
            />
            
            <div
              style={{
                marginTop: 20,
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setPastedContent('');
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#64748b'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pastedContent.trim()) {
                    handlePasteTable();
                    setShowPasteModal(false);
                    setPastedContent('');
                  }
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#0ea5e9',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save confirmation modal - empty cells warning */}
      {showSaveConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}
          onClick={() => { setShowSaveConfirmModal(false); setEmptyCellsHighlight({}); }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 24,
              padding: 32,
              width: 420,
              maxWidth: '92vw',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: '#1e293b' }}>
              Are you sure you want to save?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 15, color: '#64748b', lineHeight: 1.5 }}>
              {emptyCount} empty cell{emptyCount !== 1 ? 's' : ''} {emptyCount !== 1 ? 'are' : 'is'} highlighted in red. You can save anyway or go back and fill them in.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setShowSaveConfirmModal(false); setEmptyCellsHighlight({}); }}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                No, go back
              </button>
              <button
                onClick={performSave}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#0ea5e9',
                  color: 'white',
                  fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                Yes, save anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm.show && deleteConfirm.plan && (
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
          onClick={() => setDeleteConfirm({ show: false, plan: null })}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              width: 380,
              maxWidth: '92vw',
              boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
              border: '1px solid #E5E7EB'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
              Delete lesson plan?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
              &ldquo;{deleteConfirm.plan.title || deleteConfirm.plan.period + ' plan'}&rdquo; will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, plan: null })}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  background: '#f8fafc',
                  color: '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast.visible && toast.message && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            maxWidth: 'calc(100vw - 48px)',
            padding: '14px 20px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.06)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            ...(toast.type === 'error' && {
              background: '#fef2f2',
              color: '#b91c1c',
              borderColor: '#fecaca'
            }),
            ...(toast.type === 'success' && {
              background: '#f0fdf4',
              color: '#15803d',
              borderColor: '#bbf7d0'
            }),
            ...(toast.type === 'warning' && {
              background: '#fffbeb',
              color: '#b45309',
              borderColor: '#fde68a'
            }),
            ...(toast.type === 'info' && {
              background: '#f0f9ff',
              color: '#0369a1',
              borderColor: '#bae6fd'
            })
          }}
        >
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        select {
          outline: none;
        }
        
        select:hover {
          border-color: #94a3b8;
          background-color: #f8fafc;
        }
        
        select:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
          outline: none;
        }
        
        select:disabled {
          background-color: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
