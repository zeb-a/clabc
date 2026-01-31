import React from 'react';
import { createPortal } from 'react-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';
import HELP_GUIDES from '../help_guides';
import { useTranslation } from '../i18n';
import { useModalKeyboard } from '../hooks/useKeyboardShortcuts';

export default function InlineHelpModal({ pageId, onClose }) {
  const { lang } = useTranslation();
  // Fallback: if 'inbox' not found, use 'Messages & Grading' (legacy key)
  let entry = (HELP_GUIDES && HELP_GUIDES[lang] && HELP_GUIDES[lang][pageId]) || (HELP_GUIDES && HELP_GUIDES['en'] && HELP_GUIDES['en'][pageId]);
  if (!entry && pageId === 'inbox') {
    entry = (HELP_GUIDES && HELP_GUIDES[lang] && HELP_GUIDES[lang]['Messages & Grading']) || (HELP_GUIDES && HELP_GUIDES['en'] && HELP_GUIDES['en']['Messages & Grading']);
  }
  if (!entry) entry = { title: 'Help', body: 'No help available for this page.' };

  // Handle keyboard shortcuts (Escape to close)
  useModalKeyboard(null, onClose, true);

  const node = (
    <div style={styles.overlay} onClick={onClose} className="modal-overlay-in">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="animated-modal-content modal-animate-center">
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>Help</div>
            <h2 style={styles.title}>{entry.title}</h2>
          </div>
          <button onClick={onClose} style={styles.close}><X size={18} /></button>
        </div>
        <div style={styles.content}>
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => <table style={styles.table}>{children}</table>,
              thead: ({ children }) => <thead style={styles.tableHeader}>{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr style={styles.tableRow}>{children}</tr>,
              th: ({ children }) => <th style={{...styles.tableCell, padding: '12px'}}>{children}</th>,
              td: ({ children, node }) => {
                // Check if this is the first column (icon column)
                const isFirstColumn = node?.parent?.parent?.children?.[0] === node;
                return <td style={isFirstColumn ? {...styles.tableCell, textAlign: 'center'} : styles.tableCell}>{children}</td>;
              },
              h1: ({ children }) => <h1 style={{margin: '16px 0 8px', fontSize: 18, fontWeight: 700, color: '#0F172A'}}>{children}</h1>,
              h2: ({ children }) => <h2 style={{margin: '14px 0 8px', fontSize: 16, fontWeight: 700, color: '#1E293B'}}>{children}</h2>,
              h3: ({ children }) => <h3 style={{margin: '12px 0 6px', fontSize: 15, fontWeight: 700, color: '#334155'}}>{children}</h3>,
              p: ({ children }) => <p style={{margin: '8px 0'}}>{children}</p>,
              ul: ({ children }) => <ul style={{margin: '8px 0', paddingLeft: 20}}>{children}</ul>,
              ol: ({ children }) => <ol style={{margin: '8px 0', paddingLeft: 20}}>{children}</ol>,
              li: ({ children }) => <li style={{margin: '4px 0'}}>{children}</li>,
              strong: ({ children }) => <strong style={{fontWeight: 700, color: '#1E293B'}}>{children}</strong>,
              hr: () => <hr style={{border: 'none', borderTop: '2px solid #E2E8F0', margin: '16px 0'}} />
            }}
          >
            {entry.body}
          </Markdown>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') return createPortal(node, document.body);
  return node;
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 24 },
  modal: { width: '640px', maxWidth: '96%', background: '#ffffff', borderRadius: 20, padding: 22, boxShadow: '0 30px 80px rgba(2,6,23,0.35)', border: '1px solid rgba(15,23,42,0.04)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  badge: { background: '#EEF2FF', color: '#4F46E5', padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 800, marginBottom: 6 },
  title: { margin: 0, fontSize: 20, color: '#0F172A' },
  close: { border: 'none', background: '#F1F5F9', padding: 8, borderRadius: 10, cursor: 'pointer', boxShadow: '0 6px 18px rgba(2,6,23,0.06)' },
  content: { maxHeight: '60vh', overflowY: 'auto', color: '#475569', lineHeight: 1.65, fontSize: 15 },
  // Table styles
  table: { width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontSize: 14, background: '#FAFAFA', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { background: '#EEF2FF', color: '#1E293B', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableRow: { borderBottom: '1px solid #E2E8F0' },
  tableCell: { padding: '10px 12px', textAlign: 'left' },
  tableCellIcon: { padding: '10px 12px', textAlign: 'center', fontSize: 16 }
};
