import React from 'react';
import { useTranslation } from '../i18n';
import { Languages, ChevronDown } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const LANGUAGES = [
  { code: 'en', flag: '🇺🇸', name: 'English', short: 'EN' },
  { code: 'zh', flag: '🇨🇳', name: '中文', short: '中文' },
  { code: 'es', flag: '🇪🇸', name: 'Español', short: 'ES' },
  { code: 'fr', flag: '🇫🇷', name: 'Français', short: 'FR' },
];

export default function LanguageSelector() {
  const { lang, setLang, t } = useTranslation();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const getActiveBg = (code) => {
    if (code === 'en') return isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF';
    if (code === 'zh') return isDark ? 'rgba(185, 28, 28, 0.2)' : '#FEF3F2';
    if (code === 'es') return isDark ? 'rgba(5, 150, 105, 0.2)' : '#D1FAE5';
    return isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7';
  };

  const getActiveColor = (code) => {
    if (code === 'en') return isDark ? '#818CF8' : '#4F46E5';
    if (code === 'zh') return isDark ? '#FCA5A5' : '#B91C1C';
    if (code === 'es') return isDark ? '#34D399' : '#059669';
    return isDark ? '#FBBF24' : '#D97706';
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 14px',
          borderRadius: '10px',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0'}`,
          cursor: 'pointer',
          background: isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFC',
          color: isDark ? '#e5e5e5' : '#64748B',
          fontWeight: '600',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : '#F1F5F9'}
        onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#F8FAFC'}
        title={t('ui.change_language')}
      >
        <Languages size={14} />
        <span>{currentLang.short}</span>
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>
      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: isDark ? '#1F1F23' : '#fff',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            zIndex: 100,
            overflow: 'hidden',
            minWidth: '180px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
            padding: '6px'
          }}>
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => { setLang(language.code); setIsOpen(false); }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: lang === language.code ? getActiveBg(language.code) : 'transparent',
                  color: lang === language.code ? getActiveColor(language.code) : (isDark ? '#e5e5e5' : '#64748B'),
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = lang === language.code ? getActiveBg(language.code) : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9')}
                onMouseLeave={(e) => e.currentTarget.style.background = lang === language.code ? getActiveBg(language.code) : 'transparent'}
              >
                <span style={{ fontSize: '16px' }}>{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
