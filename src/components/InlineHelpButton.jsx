import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import InlineHelpModal from './InlineHelpModal';
import { useTranslation } from '../i18n';

export default function InlineHelpButton({ pageId, size = 18 }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);

  const baseStyle = {
    background: hover ? '#EEF2FF' : '#F8FAFF',
    border: '1px solid rgba(79,70,229,0.12)',
    cursor: 'pointer',
    padding: 8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease',
    transform: hover ? 'scale(1.06)' : 'scale(1)',
    boxShadow: hover ? '0 6px 14px rgba(79,70,229,0.08)' : 'none'
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        title={t('nav.help')}
        aria-label={`${t('nav.help')} — ${pageId}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={baseStyle}
      >
        <HelpCircle size={size} color="#4F46E5" />
      </button>
      <div style={{ marginLeft: 8, minWidth: 0 }}>
        {open && <InlineHelpModal pageId={pageId} onClose={() => setOpen(false)} />}
      </div>
    </div>
  );
}
