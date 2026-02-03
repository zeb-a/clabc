import React, { useState, useMemo } from 'react';
import { Clock, Trophy, X, Trash2, User, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import SafeAvatar from './SafeAvatar';
import { boringAvatar } from '../utils/avatar';
import { useTranslation } from '../i18n';
import api from '../services/api';

const PointsHistoryView = ({ activeClass, onClose, refreshClasses }) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('all'); // 'all', 'wow', 'nono', 'lucky'
  const [filterStudent, setFilterStudent] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'week', 'month'
  const [clearing, setClearing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Collect all point events from all students
  const allEvents = useMemo(() => {
    const events = [];

    (activeClass.students || []).forEach(student => {
      if (student.history && Array.isArray(student.history)) {
        student.history.forEach(event => {
          events.push({
            ...event,
            studentId: student.id,
            studentName: student.name,
            studentAvatar: student.avatar,
            studentGender: student.gender
          });
        });
      }
    });

    // Sort by timestamp (newest first)
    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [activeClass.students]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = [...allEvents];

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'lucky') {
        filtered = filtered.filter(e => e.label === 'Lucky Draw Winner');
      } else {
        filtered = filtered.filter(e => e.type === filterType);
      }
    }

    // Filter by student
    if (filterStudent !== 'all') {
      filtered = filtered.filter(e => e.studentId === filterStudent);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(e => {
        const eventDate = new Date(e.timestamp);

        switch (dateRange) {
          case 'today':
            return eventDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return eventDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return eventDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [allEvents, filterType, filterStudent, dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    let totalWow = 0;
    let totalNono = 0;
    let totalLucky = 0;

    allEvents.forEach(event => {
      if (event.pts > 0) {
        if (event.label === 'Lucky Draw Winner') {
          totalLucky += event.pts;
        } else {
          totalWow += event.pts;
        }
      } else {
        totalNono += event.pts;
      }
    });

    return { totalWow, totalNono, totalLucky };
  }, [allEvents]);

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Clear all history
  const handleClearHistory = async () => {
    setShowConfirmModal(true);
  };

  // Confirm and clear history
  const confirmClearHistory = async () => {
    setShowConfirmModal(false);
    setClearing(true);
    try {
      await api.pbRequest(`/collections/classes/records/${activeClass.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          students: (activeClass.students || []).map(s => ({
            ...s,
            history: [],
            score: 0
          }))
        })
      });

      await refreshClasses();
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert(t('points_history.clear_failed'));
    } finally {
      setClearing(false);
    }
  };

  // Refresh classes
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshClasses();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header(isMobile)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock size={isMobile ? 20 : 24} color="#636E72" />
            <h2 style={styles.title(isMobile)}>{t('points_history.title')}</h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{ ...styles.iconBtn(isMobile), cursor: refreshing ? 'wait' : 'pointer' }}
              title={t('points_history.refresh')}
            >
              <RefreshCw size={20} color="#636E72" />
            </button>
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              style={{
                ...styles.iconBtn(isMobile),
                background: '#FEF2F2',
                cursor: clearing ? 'wait' : 'pointer'
              }}
              title={t('points_history.clear_all')}
            >
              <Trash2 size={20} color="#DC2626" />
            </button>
            <button
              onClick={onClose}
              style={styles.iconBtn(isMobile)}
              title={t('general.close')}
            >
              <X size={20} color="#636E72" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsContainer(isMobile)}>
          <div style={styles.statCard(isMobile)}>
            <div style={{ ...styles.statIconWrapper(isMobile), background: '#E8F5E9' }}>
              <Trophy size={isMobile ? 20 : 24} color="#4CAF50" />
            </div>
            <div>
              <div style={styles.statValue(isMobile)}>+{stats.totalWow}</div>
              <div style={styles.statLabel(isMobile)}>{t('points_history.wow_points')}</div>
            </div>
          </div>
          <div style={styles.statCard(isMobile)}>
            <div style={{ ...styles.statIconWrapper(isMobile), background: '#FFEBEE' }}>
              <Trophy size={isMobile ? 20 : 24} color="#F44336" />
            </div>
            <div>
              <div style={styles.statValue(isMobile)}>{stats.totalNono}</div>
              <div style={styles.statLabel(isMobile)}>{t('points_history.nono_points')}</div>
            </div>
          </div>
          <div style={styles.statCard(isMobile)}>
            <div style={{ ...styles.statIconWrapper(isMobile), background: '#FFF9C4' }}>
              <Trophy size={isMobile ? 20 : 24} color="#F9A825" />
            </div>
            <div>
              <div style={styles.statValue(isMobile)}>+{stats.totalLucky}</div>
              <div style={styles.statLabel(isMobile)}>{t('points_history.lucky_draws')}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filtersContainer(isMobile)}>
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.filterSelect(isMobile)}
            title={t('general.filter')}
          >
            <option value="all">{t('points_history.all_types')}</option>
            <option value="wow">{t('points_history.wow_cards')}</option>
            <option value="nono">{t('points_history.nono_cards')}</option>
            <option value="lucky">{t('points_history.lucky_draw_filter')}</option>
          </select>

          {/* Student Filter */}
          <select
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            style={styles.filterSelect(isMobile)}
            title={t('points_history.all_students')}
          >
            <option value="all">{t('points_history.all_students')}</option>
            {(activeClass.students || []).map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={styles.filterSelect(isMobile)}
            title={t('points_history.all_time')}
          >
            <option value="all">{t('points_history.all_time')}</option>
            <option value="today">{t('points_history.today')}</option>
            <option value="week">{t('points_history.this_week')}</option>
            <option value="month">{t('points_history.this_month')}</option>
          </select>
        </div>

        {/* Events List */}
        <div style={styles.contentScroll(isMobile)}>
          {filteredEvents.length === 0 ? (
            <div style={styles.emptyState(isMobile)}>
              <Clock size={isMobile ? 48 : 64} color="#CBD5E1" style={{ marginBottom: '16px' }} />
              <p style={styles.emptyText}>{t('points_history.no_history')}</p>
              {filterType !== 'all' || filterStudent !== 'all' || dateRange !== 'all' ? (
                <p style={{ ...styles.emptyText, fontSize: '14px', marginTop: '8px' }}>
                  {t('points_history.try_filters')}
                </p>
              ) : null}
            </div>
          ) : (
            <div style={styles.eventsList}>
              {filteredEvents.map((event, index) => {
                const isPositive = event.pts > 0;
                const isLucky = event.label === 'Lucky Draw Winner';

                return (
                  <div
                    key={`${event.studentId}-${index}`}
                    style={{
                      ...styles.eventItem(isMobile),
                      borderLeft: isLucky ? '4px solid #F9A825' : (isPositive ? '4px solid #4CAF50' : '4px solid #F44336')
                    }}
                  >
                    <SafeAvatar
                      src={event.studentAvatar || boringAvatar(event.studentName, event.studentGender)}
                      name={event.studentName}
                      alt={event.studentName}
                      style={styles.eventAvatar(isMobile)}
                    />
                    <div style={styles.eventContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div>
                          <div style={styles.eventStudentName(isMobile)}>{event.studentName}</div>
                          <div style={styles.eventLabel(isMobile)}>{event.label}</div>
                        </div>
                        <div style={{
                          ...styles.eventPoints(isMobile),
                          color: isLucky ? '#F9A825' : (isPositive ? '#4CAF50' : '#F44336')
                        }}>
                          {isPositive ? '+' : ''}{event.pts}
                        </div>
                      </div>
                      <div style={styles.eventDate}>
                        <Clock size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                        {formatDate(event.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with count */}
        <div style={styles.footer(isMobile)}>
          <span style={{ color: '#64748B', fontSize: isMobile ? '12px' : '14px', fontWeight: 600 }}>
            {t('points_history.showing_filtered')} {filteredEvents.length} {t('points_history.showing_of')} {allEvents.length} {t('points_history.showing_events')}
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={styles.confirmOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={styles.confirmModal(isMobile)} onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIconWrapper}>
              <AlertTriangle size={isMobile ? 40 : 48} color="#DC2626" />
            </div>
            <h3 style={styles.confirmTitle(isMobile)}>{t('points_history.clear_all')}</h3>
            <p style={styles.confirmMessage(isMobile)}>{t('points_history.confirm_clear')}</p>
            <div style={styles.confirmButtons}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={styles.confirmCancelButton(isMobile)}
                disabled={clearing}
              >
                {t('general.cancel')}
              </button>
              <button
                onClick={confirmClearHistory}
                disabled={clearing}
                style={{
                  ...styles.confirmDeleteButton(isMobile),
                  opacity: clearing ? 0.6 : 1,
                  cursor: clearing ? 'wait' : 'pointer'
                }}
              >
                {clearing ? t('general.loading') || 'Clearing...' : t('general.delete') || 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000
  },
  modal: {
    background: '#FFFFFF',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: '40px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)'
  },
  header: (isMobile) => ({
    padding: isMobile ? '16px' : '20px 24px',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  title: (isMobile) => ({
    margin: 0,
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: 800,
    color: '#2D3436'
  }),
  iconBtn: (isMobile) => ({
    width: isMobile ? '36px' : '40px',
    height: isMobile ? '36px' : '40px',
    borderRadius: '10px',
    border: 'none',
    background: '#F8FAFC',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
  }),
  statsContainer: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: isMobile ? '10px' : '16px',
    padding: isMobile ? '16px' : '20px 24px',
    borderBottom: '1px solid #F0F0F0'
  }),
  statCard: (isMobile) => ({
    background: '#F8FAFC',
    borderRadius: '16px',
    padding: isMobile ? '10px 8px' : '16px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '12px',
    minWidth: 0
  }),
  statIconWrapper: (isMobile) => ({
    width: isMobile ? '32px' : '48px',
    height: isMobile ? '32px' : '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }),
  statValue: (isMobile) => ({
    fontSize: isMobile ? '16px' : '24px',
    fontWeight: 900,
    color: '#2D3436',
    lineHeight: 1.2
  }),
  statLabel: (isMobile) => ({
    fontSize: isMobile ? '10px' : '12px',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }),
  filtersContainer: (isMobile) => ({
    display: 'flex',
    gap: isMobile ? '8px' : '12px',
    padding: isMobile ? '12px 16px' : '16px 24px',
    borderBottom: '1px solid #F0F0F0',
    flexWrap: 'wrap'
  }),
  filterSelect: (isMobile) => ({
    flex: '1 1 200px',
    minWidth: isMobile ? '100px' : '120px',
    padding: isMobile ? '8px 12px' : '10px 14px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    background: '#fff',
    fontSize: isMobile ? '13px' : '14px',
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer'
  }),
  contentScroll: (isMobile) => ({
    flex: 1,
    overflowY: 'auto',
    padding: isMobile ? '12px 16px' : '16px 24px'
  }),
  eventsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  eventItem: (isMobile) => ({
    background: '#fff',
    borderRadius: '16px',
    padding: isMobile ? '12px' : '16px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    gap: isMobile ? '10px' : '14px',
    transition: 'all 0.2s'
  }),
  eventAvatar: (isMobile) => ({
    width: isMobile ? '42px' : '50px',
    height: isMobile ? '42px' : '50px',
    borderRadius: '50%',
    border: '3px solid #F8FAFC',
    flexShrink: 0
  }),
  eventContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  eventStudentName: (isMobile) => ({
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 800,
    color: '#2D3436'
  }),
  eventLabel: (isMobile) => ({
    fontSize: isMobile ? '13px' : '14px',
    color: '#64748B',
    fontWeight: 600
  }),
  eventPoints: (isMobile) => ({
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: 900
  }),
  eventDate: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    color: '#94A3B8',
    fontWeight: 600
  },
  emptyState: (isMobile) => ({
    textAlign: 'center',
    padding: isMobile ? '40px 20px' : '60px 20px'
  }),
  emptyText: {
    margin: 0,
    fontSize: '16px',
    color: '#64748B',
    fontWeight: 700
  },
  footer: (isMobile) => ({
    padding: isMobile ? '12px 16px' : '16px 24px',
    borderTop: '1px solid #F0F0F0',
    textAlign: 'center'
  }),
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6000
  },
  confirmModal: (isMobile) => ({
    background: '#FFFFFF',
    width: '90%',
    maxWidth: isMobile ? '340px' : '400px',
    borderRadius: '24px',
    padding: isMobile ? '24px 20px' : '32px 28px',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  }),
  confirmIconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#FEF2F2',
    marginBottom: '20px'
  },
  confirmTitle: (isMobile) => ({
    margin: '0 0 12px 0',
    fontSize: isMobile ? '20px' : '22px',
    fontWeight: 800,
    color: '#1F2937'
  }),
  confirmMessage: (isMobile) => ({
    margin: '0 0 24px 0',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: 500,
    color: '#6B7280',
    lineHeight: 1.6
  }),
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  confirmCancelButton: (isMobile) => ({
    flex: 1,
    padding: isMobile ? '12px 20px' : '14px 24px',
    borderRadius: '12px',
    border: '2px solid #E5E7EB',
    background: '#FFFFFF',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: 700,
    color: '#374151',
    cursor: 'pointer'
  }),
  confirmDeleteButton: (isMobile) => ({
    flex: 1,
    padding: isMobile ? '12px 20px' : '14px 24px',
    borderRadius: '12px',
    border: 'none',
    background: '#DC2626',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: 700,
    color: '#FFFFFF',
    cursor: 'pointer'
  })
};

export default PointsHistoryView;
