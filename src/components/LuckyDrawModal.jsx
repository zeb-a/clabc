/* eslint-disable react-hooks/refs */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Users, Star, Check } from 'lucide-react';
import { useModalKeyboard } from '../hooks/useKeyboardShortcuts';
import SafeAvatar from './SafeAvatar';
import { boringAvatar } from '../utils/avatar';

export default function LuckyDrawModal({ students, onClose, onWinner, onRequestAddStudents }) {
  const safeStudents = useMemo(() => Array.isArray(students) ? students : [], [students]);
  const [step, setStep] = useState('count_selection');
  const [studentCount, setStudentCount] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [targetWinners, setTargetWinners] = useState([]);
  const [pointsToGive, setPointsToGive] = useState(1);
  const audioRef = useRef(null);

  // Initialize audio only after component mounts (avoid audio context warning)
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    if (audioRef.current) {
      audioRef.current.loop = true;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle keyboard shortcuts (Escape to close)
  useModalKeyboard(null, onClose, true);

  const handleStartDraw = (count) => {
    // Validate students first
    if (!safeStudents || safeStudents.length < 2) {
      // Show a short message and offer to add students
      setStep('needs_students');
      return;
    }

    if (count > safeStudents.length) {
      // If user selected more winners than available, show a friendly message
      setStep('too_many_selected');
      setStudentCount(count);
      return;
    }

    setStudentCount(count);
    // Shuffle and pick unique students (No duplicates)
    const shuffled = [...safeStudents].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, safeStudents.length));

    setTargetWinners(selected);
    setStep('drawing');
    setRolling(true);

    audioRef.current.play().catch(() => { });
    // Smooth slowing animation handled inside RollingCard via requestAnimationFrame
    setTimeout(() => {
      setRolling(false);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }, 3000);
  };


  return (
    <div style={modalStyles.overlay} className="modal-overlay-in">
      {step === 'count_selection' ? (
        <div style={modalStyles.glassCard} className="animated-modal-content modal-animate-center">
          <X onClick={onClose} style={modalStyles.closeIcon} />
          <div style={modalStyles.headerIcon}><Users size={32} color="#fff" /></div>
          <h2 style={modalStyles.title}>Draw Group</h2>
          <p style={modalStyles.subtitle}>Select number of Students ({safeStudents.length} available)</p>
          <div style={modalStyles.numberGrid}>
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleStartDraw(num)}
                style={{
                  ...modalStyles.numberBtn,
                  opacity: safeStudents.length < 2 || num > safeStudents.length ? 0.5 : 1,
                  cursor: safeStudents.length < 2 || num > safeStudents.length ? 'not-allowed' : 'pointer'
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      ) : step === 'needs_students' ? (
        <div style={modalStyles.glassCard} className="animated-modal-content modal-animate-center">
          <X onClick={onClose} style={modalStyles.closeIcon} />
          <div style={modalStyles.headerIcon}><Users size={32} color="#fff" /></div>
          <h2 style={modalStyles.title}>Not enough students</h2>
          <p style={modalStyles.subtitle}>Add at least 2 students before running a Lucky Draw (currently {safeStudents.length} student{safeStudents.length !== 1 ? 's' : ''}).</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button data-enter-submit onClick={() => { onClose(); onRequestAddStudents && onRequestAddStudents(); }} style={modalStyles.saveBtn}>Add Students</button>
            <button onClick={onClose} style={{ ...modalStyles.numberBtn, padding: '12px 20px' }}>Cancel</button>
          </div>
        </div>
      ) : step === 'too_many_selected' ? (
        <div style={modalStyles.glassCard} className="animated-modal-content modal-animate-center">
          <X onClick={onClose} style={modalStyles.closeIcon} />
          <div style={modalStyles.headerIcon}><Users size={32} color="#fff" /></div>
          <h2 style={modalStyles.title}>Not enough students</h2>
          <p style={modalStyles.subtitle}>You chose {studentCount} winners but there are only {safeStudents.length} students.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button data-enter-submit onClick={() => setStep('count_selection')} style={modalStyles.saveBtn}>Choose a smaller number</button>
            <button onClick={() => { onClose(); onRequestAddStudents && onRequestAddStudents(); }} style={{ ...modalStyles.numberBtn, padding: '12px 20px' }}>Add Students</button>
          </div>
        </div>
      ) : (
        <div style={{
          ...modalStyles.drawContainer,
          width: studentCount === 1 ? '450px' : '90%',
          maxHeight: '90vh' // Prevents button from going off-screen
        }}>
          <X onClick={onClose} style={modalStyles.closeIcon} />
          <div style={modalStyles.headerLabel}>{rolling ? "Selecting..." : "Selections!"}</div>

          <div style={{
            ...modalStyles.cardsWrapper,
            flexWrap: studentCount > 2 ? 'wrap' : 'nowrap', // Wraps cards if they are too many
            overflowY: 'auto'
          }}>
            {targetWinners.map((winner, i) => (
              <RollingCard
                key={winner.id || i}
                rolling={rolling}
                students={safeStudents}
                finalStudent={winner}
                count={studentCount}
              />
            ))}
          </div>

          {!rolling && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Point Value Selector */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPointsToGive(val)} // You'll need: const [pointsToGive, setPointsToGive] = useState(1); at the top
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      border: pointsToGive === val ? 'none' : '1px solid #ddd',
                      background: pointsToGive === val ? '#4CAF50' : 'white',
                      color: pointsToGive === val ? 'white' : '#333',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    +{val}
                  </button>
                ))}
              </div>

              <button
                data-enter-submit
                onClick={() => onWinner(studentCount === 1 ? targetWinners[0] : targetWinners, pointsToGive)}
                style={modalStyles.saveBtn}
              >
                Award {pointsToGive * targetWinners.length} Points Total
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RollingCard({ rolling, students, finalStudent, count }) {
  const [displayIndex, setDisplayIndex] = useState(0);

  // Generate avatar URLs with fallbacks for all students
  const studentsWithAvatars = useMemo(() => {
    return students.map(student => ({
      ...student,
      avatar: student.avatar || boringAvatar(student.name || 'Student', 'boy')
    }));
  }, [students]);

  useEffect(() => {
    if (!rolling) return;
    let raf = null;
    let lastChange = 0;
    const start = performance.now();

    const loop = (now) => {
      const elapsed = now - start;
      const duration = 3000; // total roll time in ms (match parent timeout)
      const t = Math.min(1, elapsed / duration);
      // ease out cubic so speed slows toward the end
      const eased = 1 - Math.pow(1 - t, 3);
      // frequency goes from high (fast) to low (slow)
      const fps = Math.round(40 - eased * 36); // from ~40fps down to ~4fps
      const interval = 1000 / Math.max(4, fps);

      if (now - lastChange >= interval) {
        setDisplayIndex(Math.floor(Math.random() * Math.max(1, studentsWithAvatars.length)));
        lastChange = now;
      }

      if (t < 1) raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => raf && cancelAnimationFrame(raf);
  }, [rolling, studentsWithAvatars]);

  const current = rolling ? studentsWithAvatars[displayIndex] : { ...finalStudent, avatar: finalStudent?.avatar || boringAvatar(finalStudent?.name || 'Student', 'boy') };

  // Dynamic sizing based on student count
  const cardWidth = count === 1 ? '100%' : count === 2 ? '45%' : '22%';

  return (
    <div style={{ ...modalStyles.luckyCard, width: cardWidth, minWidth: '200px' }}>
      <div style={modalStyles.avatarContainer}>
        <SafeAvatar
          src={current?.avatar}
          name={current?.name}
          alt="avatar"
          style={{
            width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover',
            filter: rolling ? 'blur(2px)' : 'none'
          }}
        />
      </div>
      <h3 style={modalStyles.nameLabel}>{current?.name}</h3>
      {!rolling && <div style={modalStyles.pointBadge}>Selected</div>}
    </div>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 },
  glassCard: { background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '40px', borderRadius: '40px', width: '400px', textAlign: 'center', position: 'relative' },
  drawContainer: { background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '40px 20px', borderRadius: '40px', textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' },
  headerLabel: { color: '#fff', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px', opacity: 0.6 },
  closeIcon: { position: 'absolute', right: 20, top: 20, cursor: 'pointer', color: '#fff', zIndex: 10 },
  headerIcon: { width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  title: { fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 10px 0' },
  subtitle: { color: 'rgba(255,255,255,0.6)', marginBottom: '30px' },
  numberGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  numberBtn: { padding: '20px 0', fontSize: '22px', fontWeight: 900, borderRadius: '15px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: '#fff' },
  cardsWrapper: { display: 'flex', gap: '10px', justifyContent: 'center', width: '100%', marginBottom: '30px', padding: '10px' },
  luckyCard: { background: 'rgba(255, 255, 255, 0.05)', padding: '20px 10px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  avatarContainer: { width: '75%', aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden' },
  nameLabel: { margin: '15px 0 5px 0', fontWeight: 800, color: '#fff', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '90%' },
  pointBadge: { background: '#4CAF50', color: '#fff', padding: '2px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800 },
  footer: { width: '100%', maxWidth: '350px', marginTop: 'auto' },
  saveBtn: { width: '100%', padding: '18px', background: '#fff', color: '#000', border: 'none', borderRadius: '18px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
};