import { useState, useEffect } from 'react';
import { boringAvatar } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import { Edit2, Trash2 } from 'lucide-react';
import useIsTouchDevice from '../hooks/useIsTouchDevice';

const StudentCard = ({ student, onClick, onEdit, onDelete, animating = false, animationType = 'small', isCompact = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (animating) {
      setIsAnimating(true);
      // duration per animationType
      const dmap = { small: 800, medium: 1200, large: 1600, confetti: 2200 };
      const t = setTimeout(() => setIsAnimating(false), dmap[animationType] || 900);
      return () => clearTimeout(t);
    } else {
      setIsAnimating(false);
    }
  }, [animating, animationType]);
  const displayAvatar = student.avatar || boringAvatar(student.name, student.gender);

  return (
    <div
      className="student-card"
      data-student-id={student.id}
      onClick={(e) => {
        if (!e.target.closest('[data-action-btn]')) {
          const rect = e.currentTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2 + window.scrollX;
          const centerY = rect.top + rect.height / 2 + window.scrollY;
          if (onClick) onClick(student, { x: centerX, y: centerY });
        }
      }}
      style={{
          backgroundColor: 'white',
          borderRadius: isCompact ? '50%' : '24px',
          padding: isCompact ? '12px' : '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isAnimating ? (animationType === 'confetti' ? '0 30px 60px rgba(255, 192, 203, 0.3), 0 10px 30px rgba(99,102,241,0.12)' : '0 20px 40px rgba(76,175,80,0.18)') : '0 8px 16px rgba(0,0,0,0.05)',
          cursor: 'pointer',
          transition: isAnimating ? 'transform 200ms cubic-bezier(.2,.9,.2,1), box-shadow 200ms' : 'transform 0.2s',
          transform: isAnimating ? (animationType === 'small' ? 'scale(1.06)' : animationType === 'medium' ? 'scale(1.1) rotate(-1deg)' : animationType === 'large' ? 'scale(1.14)' : 'scale(1.16)') : undefined,
          position: 'relative',
          aspectRatio: '1 / 1'
        }}
      onPointerEnter={(e) => {
        // Ignore touch pointers to avoid accidental scaling on mobile
        if (e.pointerType === 'touch') return;
        setIsHovered(true);
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'touch') return;
        setIsHovered(false);
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {!isCompact && (isHovered || isTouchDevice) && (onEdit || onDelete) && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          display: 'flex', gap: '8px', zIndex: 10
        }}>
          {onEdit && (
            <button
              data-action-btn
              onClick={(e) => {
                e.stopPropagation();
                onEdit(student);
              }}
              style={{
                background: 'white', border: '1px solid #ddd',
                borderRadius: '8px', padding: '8px', cursor: 'pointer',
                color: '#4CAF50', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E8F5E9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              data-action-btn
              onClick={(e) => {
                e.stopPropagation();
                onDelete(student);
              }}
              style={{
                background: 'white', border: '1px solid #ddd',
                borderRadius: '8px', padding: '8px', cursor: 'pointer',
                color: '#FF6B6B', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFEBEE'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

      {isCompact ? (
        <div style={{
          position: 'absolute', top: '8px', left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(227, 242, 253, 0.95)',
          color: '#2196F3',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2
        }}>
          {student.score}
        </div>
      ) : (
        <div style={{
          position: 'absolute', top: '12px', left: '12px',
          background: '#E3F2FD', color: '#2196F3',
          width: 'clamp(36px, 12%, 56px)',
          height: 'clamp(36px, 12%, 56px)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: 'clamp(0.9rem, 3vw, 1.3rem)'
        }}>
          {student.score}
        </div>
      )}

      <SafeAvatar
        src={displayAvatar}
        name={student.name}
        alt={student.name}
        loading="lazy"
        style={{
          width: isCompact ? '75%' : '70%',
          height: isCompact ? '75%' : '70%',
          borderRadius: '50%',
          objectFit: 'cover',
          border: isCompact ? '3px solid white' : 'clamp(3px, 1.5%, 6px) solid white',
          boxShadow: isAnimating ? (animationType === 'confetti' ? '0 12px 36px rgba(255, 105, 180, 0.25)' : '0 10px 30px rgba(76,175,80,0.18)') : '0 4px 10px rgba(0,0,0,0.1)',
          backgroundColor: '#FFEAA7',
          transition: 'transform 220ms ease, box-shadow 220ms ease'
        }}
      />

      {isCompact ? (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          paddingTop: '8px'
        }}>
          <svg
            viewBox="0 0 100 100"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'visible'
            }}
          >
            <defs>
              <path id="namePath" d="M 10,50 A 40,40 0 0,0 90,50" />
            </defs>
            <text
              style={{
                fontSize: '10px',
                fontWeight: '800',
                fill: '#2D3436',
                textShadow: '0 1px 3px rgba(255,255,255,0.8)'
              }}
            >
              <textPath
                href="#namePath"
                startOffset="50%"
                textAnchor="middle"
              >
                {student.name}
              </textPath>
            </text>
          </svg>
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          bottom: '14px',
          fontWeight: '800',
          fontSize: 'clamp(0.9rem, 4%, 1.2rem)',
          color: '#2D3436',
          textAlign: 'center',
          maxWidth: '85%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {student.name}
        </div>
      )}
      {isAnimating && animationType === 'confetti' && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', pointerEvents: 'none' }}>
          <span style={{ fontSize: 22 }}>🎉</span>
        </div>
      )}
    </div>
  );
};


export default StudentCard;