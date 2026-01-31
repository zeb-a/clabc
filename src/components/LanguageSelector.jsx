import React from 'react';
import { useTranslation } from '../i18n';
import useWindowSize from '../hooks/useWindowSize';

export default function LanguageSelector() {
  const { lang, setLang } = useTranslation();
  const isMobile = useWindowSize(768);
  const [isOpen, setIsOpen] = React.useState(false);

  if (isMobile) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '9px 15px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: '#F1F5F9',
            color: '#64748B',
            fontWeight: '600',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {lang === 'en' ? 'EN' : '中文'}
          <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
        </button>
        {isOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setIsOpen(false)} />
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
              overflow: 'hidden',
              minWidth: '140px'
            }}>
              <button
                onClick={() => { setLang('en'); setIsOpen(false); }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: 'none',
                  background: lang === 'en' ? '#EEF2FF' : 'transparent',
                  color: lang === 'en' ? '#4F46E5' : '#64748B',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '20px',
                  textAlign: 'left'
                }}
              >
                EN
              </button>
              <button
                onClick={() => { setLang('zh'); setIsOpen(false); }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: 'none',
                  background: lang === 'zh' ? '#FEF3F2' : 'transparent',
                  color: lang === 'zh' ? '#B91C1C' : '#64748B',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '20px',
                  textAlign: 'left'
                }}
              >
                中文
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={() => setLang('en')}
        style={{
          padding: '3px 4px', borderRadius: 4, border: 'none', cursor: 'pointer',
          background: lang === 'en' ? '#EEF2FF' : 'transparent', color: lang === 'en' ? '#4F46E5' : '#64748B', fontWeight: 700, fontSize: '11px'
        }}
        title="English"
      >EN</button>
      <button
        onClick={() => setLang('zh')}
        style={{
          padding: '3px 4px', borderRadius: 4, border: 'none', cursor: 'pointer',
          background: lang === 'zh' ? '#FEF3F2' : 'transparent', color: lang === 'zh' ? '#B91C1C' : '#64748B', fontWeight: 700, fontSize: '11px'
        }}
        title="中文"
      >中文</button>
    </div>
  );
}
