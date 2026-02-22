import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MessageCircle, X, Send, HelpCircle,
  Layout, ClipboardList, MessageSquare, Settings, QrCode, Presentation,
  BarChart3, Clock, Siren, Home, BookOpen, Heart, Calendar, Gamepad2
} from 'lucide-react';
import HELP_GUIDES, { parseSections, getMatchingSection, normalizeHelpBody } from '../help_guides';
import { useTranslation } from '../i18n';
import { useTheme } from '../ThemeContext';
import { usePageHelp } from '../PageHelpContext';

const PAGE_ICONS = {
  'landing': Home,
  'teacher-portal': Home,
  'class-dashboard': Layout,
  'assignments': ClipboardList,
  'inbox': MessageSquare,
  'Messages & Grading': MessageSquare,
  'settings': Settings,
  'settings-cards': Settings,
  'access-codes': QrCode,
  'whiteboard': Presentation,
  'parent-portal': Heart,
  'student-portal': BookOpen,
  'reports': BarChart3,
  'timer': Clock,
  'buzzer': Siren,
  'lesson-planner': Calendar,
  'games': Gamepad2,
  'games-config': Settings
};

function getPageIcon(pageId) {
  return PAGE_ICONS[pageId] || HelpCircle;
}

export default function HelpChatBubble() {
  const { pageId } = usePageHelp();
  const { lang } = useTranslation();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState(null);
  const [suggestionFocus, setSuggestionFocus] = useState(-1);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const prevPageIdRef = useRef(pageId);
  const panelRef = useRef(null);

  const entry = useMemo(() => {
    if (!pageId) return null;
    return HELP_GUIDES[lang]?.[pageId] || null;
  }, [pageId, lang]);

  // Get all sections from all guides when on landing page or no pageId
  const allSections = useMemo(() => {
    if (!pageId || pageId === 'landing') {
      // Get all sections from all help guides
      const allGuides = HELP_GUIDES[lang] || {};
      let combinedSections = [];
      for (const guide of Object.values(allGuides)) {
        const sections = parseSections(guide);
        combinedSections = combinedSections.concat(sections);
      }
      return combinedSections;
    }
    return entry ? parseSections(entry) : [];
  }, [pageId, lang, entry]);

  const sections = useMemo(() => {
    if (!pageId || pageId === 'landing') {
      return allSections;
    }
    return entry ? parseSections(entry) : [];
  }, [pageId, lang, entry, allSections]);

  const suggestions = useMemo(() => sections.map(s => s.title).slice(0, 12), [sections]);

  const filteredSuggestions = useMemo(() => {
    if (!input.trim()) return suggestions;
    const q = input.toLowerCase();
    return suggestions.filter(s => s.toLowerCase().includes(q));
  }, [suggestions, input]);

  // Show "I can Help!" message for 2 seconds when pageId changes
  useEffect(() => {
    if (pageId && pageId !== prevPageIdRef.current) {
      setShowHelpMessage(true);
      const timer = setTimeout(() => {
        setShowHelpMessage(false);
      }, 2000);
      prevPageIdRef.current = pageId;
      return () => clearTimeout(timer);
    }
  }, [pageId]);

  useEffect(() => {
    if (open) setAnswer(null);
  }, [open]);

  useEffect(() => {
    if (suggestionFocus >= 0 && listRef.current) {
      const el = listRef.current.children[suggestionFocus];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [suggestionFocus, filteredSuggestions.length]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Always show when on landing page or when pageId is set
  if (!pageId && !allSections.length) return null;

  const showSection = (section) => {
    setAnswer(section);
    setInput('');
    setSuggestionFocus(-1);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const q = (input || '').trim().toLowerCase();
    if (!q) return;
    setInput('');
    setSuggestionFocus(-1);

    // Enhanced direct answer system with precise matching
    let match = null;

    // When on landing page or no pageId, search across all sections
    const searchSections = (!pageId || pageId === 'landing') ? allSections : sections;

    if (searchSections.length > 0) {
      // First try exact section title matching
      const exactMatch = searchSections.find(s =>
        s.title.toLowerCase() === q ||
        q.includes(s.title.toLowerCase())
      );

      if (exactMatch) {
        match = exactMatch;
      } else {
        // Try semantic matching for common button questions
        match = findSemanticMatch(q, searchSections);

        // Fallback to matching across all sections
        if (!match) {
          // Create a temporary entry with all sections for matching
          const tempEntry = { body: searchSections.map(s => `### ${s.title}\n${s.body}`).join('\n\n---\n\n') };
          match = getMatchingSection(tempEntry, q);
        }
      }
    }

    setAnswer(match || entry);
    if (inputRef.current) inputRef.current.focus();
  };

  // Semantic matching for common button/functionality questions
  const findSemanticMatch = (query, sections) => {
    const q = query.toLowerCase();
    const keywords = q.split(/\s+/).filter(w => w.length > 2);

    // Keywords to section mapping
    const keywordMap = {
      // Landing page related
      'login': ['How to Create a Teacher Account', 'Teacher Login', 'Forgot Password', 'Student Login', 'Parent Login'],
      'sign': ['How to Create a Teacher Account', 'Teacher Login'],
      'create': ['How to Create a Teacher Account'],
      'account': ['How to Create a Teacher Account'],
      'register': ['How to Create a Teacher Account'],
      'forgot': ['Forgot Password'],
      'password': ['Forgot Password'],
      'reset': ['Forgot Password'],
      'parent': ['Parent Login', 'What Parents Can See'],
      'features': ['Features Overview'],
      'help': ['Getting Help', 'Common Questions'],
      'common_questions': ['Getting Help', 'Common Questions'],
      'free': ['Common Questions', 'Features Overview'],
      'secure': ['Common Questions'],
      'data': ['Common Questions', 'What Parents Can See'],
      'offline': ['Common Questions'],
      'device': ['Common Questions', 'Classroom Tools'],
      'download': ['Common Questions', 'Classroom Tools'],
      // Class dashboard
      'sort': ['Sort Students'],
      'student': ['Sort Students', 'Add a Student', 'Edit a Student'],
      'name': ['Sort Students'],
      'point': ['Sort Students', 'Giving Points to Students'],
      'display': ['Display Options'],
      'size': ['Display Options', 'Change Grid Size'],
      'grid': ['Display Options', 'Change Grid Size'],
      'compact': ['Change Grid Size'],
      'regular': ['Change Grid Size'],
      'spacious': ['Change Grid Size'],
      'fullscreen': ['Fullscreen Mode'],
      'expand': ['Fullscreen Mode'],
      'attendance': ['Attendance', 'Student Management'],
      'absent': ['Attendance', 'Student Management'],
      'present': ['Attendance', 'Student Management'],
      'lucky': ['Lucky Draw'],
      'draw': ['Lucky Draw'],
      'random': ['Lucky Draw'],
      'winner': ['Lucky Draw'],
      'timer': ['Timer'],
      'countdown': ['Timer'],
      'buzzer': ['Attention Buzzer'],
      'attention': ['Attention Buzzer'],
      'whiteboard': ['Whiteboard'],
      'whiteboard_draw': ['Whiteboard'],
      'settings': ['Settings', 'Point Cards'],
      'card': ['Point Cards', 'Add a Card', 'Edit a Card', 'Delete a Card'],
      'emoji': ['Point Cards', 'Add a Card', 'Edit a Card'],
      'assign': ['Assignments', 'Assign & Publish'],
      'worksheet': ['Assignments'],
      'questions': ['Question Types', 'Add Questions'],
      'grade': ['Grade a Submission'],
      'inbox': ['Inbox — Review Submissions', 'View Submissions'],
      'message': ['Inbox — Review Submissions', 'Messages & Grading'],
      'submission': ['Inbox — Review Submissions', 'View Submissions'],
      'code': ['Access Codes', 'Generated Codes', 'Student Login', 'Parent Login'],
      'report': ['Reports', 'Time Periods', 'Report Card Contents', 'Edit Feedback', 'Export Options', 'What Parents Can See'],
      'analytics': ['Reports', 'Report Card Contents', 'Behavior Distribution Chart'],
      'progress': ['Reports', 'Report Card Contents', 'Student Info', 'Parent Login'],
      'chart': ['Reports', 'Report Card Contents', 'Behavior Distribution Chart', 'Behavior Ratio'],
      'feedback': ['Reports', 'AI Teacher Feedback', 'Edit Feedback'],
      'pdf': ['Reports', 'Export Options', 'Download PDF'],
      'print': ['Reports', 'Export Options', 'Print'],
      'report_export': ['Reports', 'Export Options'],
      'time': ['Reports', 'Time Periods'],
      'period': ['Reports', 'Time Periods'],
      'week': ['Reports', 'Time Periods'],
      'month': ['Reports', 'Time Periods'],
      'year': ['Reports', 'Time Periods'],
      'road': ['Progress Road'],
      'milestone': ['Progress Road'],
      'avatar': ['Student Management', 'Edit a Student']
    };

    // Find matching sections based on keywords
    const matchingSections = new Set();
    for (const keyword of keywords) {
      for (const [key, sectionTitles] of Object.entries(keywordMap)) {
        if (keyword.includes(key) || key.includes(keyword)) {
          sectionTitles.forEach(title => matchingSections.add(title));
        }
      }
    }

    // Find the first matching section
    if (matchingSections.size > 0) {
      for (const section of sections) {
        if (matchingSections.has(section.title)) {
          return section;
        }
      }
    }

    return null;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setSuggestionFocus(-1);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionFocus(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionFocus(prev => (prev <= 0 ? filteredSuggestions.length - 1 : prev - 1));
      return;
    }
    if (e.key === 'Enter' && suggestionFocus >= 0 && filteredSuggestions[suggestionFocus]) {
      e.preventDefault();
      const title = filteredSuggestions[suggestionFocus];
      const section = sections.find(s => s.title === title);
      if (section) showSection(section);
      setSuggestionFocus(-1);
      return;
    }
  };

  const Icon = getPageIcon(pageId);

  // Cute futuristic palette: glass, soft glow, cyan–violet
  const bubbleBg = isDark
    ? 'linear-gradient(145deg, rgba(139, 92, 246, 0.9) 0%, rgba(34, 211, 238, 0.85) 100%)'
    : 'linear-gradient(145deg, rgba(139, 92, 246, 0.95) 0%, rgba(34, 211, 238, 0.9) 100%)';
  const panelBg = isDark
    ? 'rgba(15, 23, 42, 0.85)'
    : 'rgba(255, 255, 255, 0.88)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.6)';
  const glow = '0 0 40px rgba(139, 92, 246, 0.35), 0 0 80px rgba(34, 211, 238, 0.2)';

  const bubbleContent = (
    <>
      <motion.button
        aria-label="Help"
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9998,
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: `2px solid ${glassBorder}`,
          background: bubbleBg,
          color: '#fff',
          boxShadow: glow,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 2.2, duration: 0.5, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <MessageCircle size={30} strokeWidth={2} />
        </motion.span>
      </motion.button>

      {!open && showHelpMessage && (
      <motion.div
        style={{
          position: 'fixed',
          bottom: 100,
          right: 28,
          zIndex: 9998,
          background: panelBg,
          color: isDark ? '#f4f4f5' : '#1E293B',
          padding: '12px 18px',
          borderRadius: 20,
          boxShadow: glow,
          border: `1px solid ${glassBorder}`,
          fontSize: 14,
          fontWeight: 700,
          maxWidth: 220,
          pointerEvents: 'none',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        ✨ I can help!
      </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              zIndex: 9999,
              width: 'min(420px, calc(100vw - 48px))',
              maxHeight: 'min(75vh, 560px)',
              background: panelBg,
              borderRadius: 28,
              boxShadow: glow,
              border: `1px solid ${glassBorder}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div style={{
              padding: '18px 20px',
              borderBottom: `1px solid ${glassBorder}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.08)'
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.4) 0%, rgba(34, 211, 238, 0.35) 100%)',
                border: `1px solid ${glassBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Icon size={24} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? '#a5b4fc' : '#6366f1', fontWeight: 700 }}>
                  Help for this page
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#fff' : '#1E293B' }}>
                  {answer?.title || entry?.title || 'Help'}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: 10,
                  borderRadius: 14,
                  border: `1px solid ${glassBorder}`,
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.7)',
                  color: isDark ? '#f4f4f5' : '#64748B',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              {!answer ? (
                <>
                  <p style={{
                    fontSize: 13,
                    color: isDark ? '#a1a1aa' : '#64748B',
                    margin: 0
                  }}>
                    Ask something or pick a topic:
                  </p>
                  {filteredSuggestions.length > 0 && (
                    <div ref={listRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {filteredSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const section = sections.find(sec => sec.title === s);
                            if (section) showSection(section);
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 14,
                            border: `1px solid ${suggestionFocus === i ? (isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.4)') : glassBorder}`,
                            background: suggestionFocus === i
                              ? (isDark ? 'rgba(139, 92, 246, 0.35)' : 'rgba(139, 92, 246, 0.12)')
                              : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)'),
                            color: isDark ? '#f4f4f5' : '#334155',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            maxWidth: '100%',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="help-chat-markdown"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: isDark ? '#d4d4d8' : '#475569'
                  }}
                >
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 style={{ margin: '12px 0 8px', fontSize: 16, fontWeight: 800, color: isDark ? '#fff' : '#1E293B' }}>{children}</h1>,
                      h2: ({ children }) => <h2 style={{ margin: '12px 0 6px', fontSize: 15, fontWeight: 700, color: isDark ? '#f4f4f5' : '#334155' }}>{children}</h2>,
                      h3: ({ children }) => <h3 style={{ margin: '10px 0 4px', fontSize: 14, fontWeight: 700, color: isDark ? '#e5e5e5' : '#475569' }}>{children}</h3>,
                      h4: ({ children }) => <h4 style={{ margin: '10px 0 4px', fontSize: 14, fontWeight: 700, color: isDark ? '#e5e5e5' : '#475569' }}>{children}</h4>,
                      p: ({ children }) => <p style={{ margin: '6px 0' }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ margin: '6px 0', paddingLeft: 20 }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ margin: '6px 0', paddingLeft: 20 }}>{children}</ol>,
                      li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ fontWeight: 700, color: isDark ? '#f4f4f5' : '#1E293B' }}>{children}</strong>,
                      table: ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '8px 0' }}>{children}</table>,
                      th: ({ children }) => <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}` }}>{children}</th>,
                      td: ({ children }) => <td style={{ padding: '8px 10px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0' }}>{children}</td>,
                      hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, margin: '12px 0' }} />
                    }}
                  >
                    {normalizeHelpBody(answer.body)}
                  </Markdown>
                  <button
                    type="button"
                    onClick={() => setAnswer(null)}
                    style={{
                      marginTop: 14,
                      padding: '10px 16px',
                      borderRadius: 14,
                      border: `1px solid ${glassBorder}`,
                      background: isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.1)',
                      color: isDark ? '#c4b5fd' : '#6366f1',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Ask another question
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{
              padding: 14,
              borderTop: `1px solid ${glassBorder}`,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(248,250,252,0.8)'
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this page..."
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  borderRadius: 16,
                  border: `1px solid ${glassBorder}`,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                  color: isDark ? '#f4f4f5' : '#1A1A1A',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: `1px solid ${glassBorder}`,
                  background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.9) 0%, rgba(34, 211, 238, 0.85) 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)'
                }}
              >
                <Send size={18} strokeWidth={2} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(bubbleContent, document.body) : null;
}
