import React from 'react';
import { useTranslation } from '../i18n';
import useWindowSize from '../hooks/useWindowSize';
import { Languages } from 'lucide-react';

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
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            background: '#F8FAFC',
            color: '#64748B',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Languages size={14} />
          {lang === 'en' ? 'EN' : '中文'}
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 100,
              overflow: 'hidden',
              minWidth: '150px',
              border: '1px solid #E2E8F0'
            }}>
              <button
                onClick={() => { setLang('en'); setIsOpen(false); }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: 'none',
                  background: lang === 'en' ? '#EEF2FF' : 'transparent',
                  color: lang === 'en' ? '#4F46E5' : '#64748B',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '15px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = lang === 'en' ? '#EEF2FF' : '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = lang === 'en' ? '#EEF2FF' : 'transparent'}
              >
                <span>🇺🇸</span>
                English
              </button>
              <button
                onClick={() => { setLang('zh'); setIsOpen(false); }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  border: 'none',
                  background: lang === 'zh' ? '#FEF3F2' : 'transparent',
                  color: lang === 'zh' ? '#B91C1C' : '#64748B',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '15px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = lang === 'zh' ? '#FEF3F2' : '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = lang === 'zh' ? '#FEF3F2' : 'transparent'}
              >
                <span>🇨🇳</span>
                中文
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={() => setLang('en')}
        style={{
          padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: lang === 'en' ? '#EEF2FF' : 'transparent',
          color: lang === 'en' ? '#4F46E5' : '#64748B',
          fontWeight: 600, fontSize: '13px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title="English"
      >
        🇺🇸 EN
      </button>
      <button
        onClick={() => setLang('zh')}
        style={{
          padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: lang === 'zh' ? '#FEF3F2' : 'transparent',
          color: lang === 'zh' ? '#B91C1C' : '#64748B',
          fontWeight: 600, fontSize: '13px',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
        title="中文"
      >
        🇨🇳 中文
      </button>
    </div>
  );
}
