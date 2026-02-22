import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../ThemeContext';

const StudentWorksheetSolver = ({ worksheet, onClose, studentName, studentId, classId, onCompletion, lang }) => {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isDark } = useTheme();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debug: Log the worksheet object on mount
  useEffect(() => {
 
  }, [worksheet]);
  
  const handleAnswerChange = (questionId, value, questionType) => {
    if (questionType === 'blank') {
      const blanks = worksheet.questions.find(q => q.id === questionId)?.question.match(/\[blank\]/gi);
      if (blanks) {
        const currentAnswers = Array.isArray(answers[questionId]) ? [...answers[questionId]] : [];
        currentAnswers[value.index] = value.answer;
        setAnswers(prev => ({ ...prev, [questionId]: currentAnswers }));
      }
    } else if (questionType === 'match') {
      const currentMatches = answers[questionId] || {};
      setAnswers(prev => ({ ...prev, [questionId]: { ...currentMatches, [value.key]: value.value } }));
    } else if (questionType === 'ordering') {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    } else if (questionType === 'sorting') {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmit = async () => {

    if (!classId) {
      alert("Error: Class ID is missing. Please refresh and try again.");
      return;
    }

    // Make sure we have a valid worksheet ID - use worksheet.id as the primary source
    // This matches the asm.id from StudentPortal's studentAssignments array
    let worksheetId = worksheet.id;

    // Fallback: check for assignment_id if worksheet.id is missing
    if (!worksheetId) {
      worksheetId = worksheet.assignment_id;
    }

    // Last resort: check for _id
    if (!worksheetId) {
      worksheetId = worksheet._id;
    }

    // If still no ID, generate one using the same logic as StudentPortal
    if (!worksheetId) {
      console.warn('WARNING: No worksheet ID found. Generating ID from title and date.');
      if (worksheet.title) {
        // Use the same format as StudentPortal: title_date format
        const baseTitle = worksheet.title.replace(/\s+/g, '_').toLowerCase();
        const dateStr = worksheet.date ? new Date(worksheet.date).getTime() : Date.now();
        worksheetId = `${baseTitle}_${dateStr}`;
      } else {
        worksheetId = Date.now().toString();
      }
    }

    setIsSubmitting(true);

    // Check if already submitted
    try {
      const filterQuery = `student_id='${String(studentId)}' && assignment_id='${String(worksheetId)}'`;

      const existingSubmission = await api.pbRequest(
        `/collections/submissions/records?filter=${encodeURIComponent(filterQuery)}`
      );


      if (existingSubmission.items && existingSubmission.items.length > 0) {
        alert("You have already submitted this worksheet.");
        setIsSubmitting(false);
        // Reload completed assignments from backend to get the correct IDs
        if (onCompletion) {
          await onCompletion();
        }
        return;
      }
    } catch (error) {
      console.error('Error checking existing submission:', error);
      // Don't block submission if check fails - let the POST handle duplicates
    }

    const submissionData = {
      class_id: String(classId),
      assignment_id: String(worksheetId),
      assignment_title: worksheet.title || 'N/A',
      student_id: String(studentId),
      student_name: studentName,
      answers: answers,
      status: 'submitted',
      grade_data: {},
      grade: "0"
    };
    try {
      await api.pbRequest('/collections/submissions/records', {
        method: 'POST',
        body: JSON.stringify(submissionData)
      });

      if (onCompletion) {
        await onCompletion();
      }

      // We stop loading and trigger the success UI state
      setIsSubmitting(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Submission Error:', error);
      // Check for duplicate submission error
      if (error.message && error.message.includes('duplicate')) {
        alert("You have already submitted this worksheet.");
      } else {
        alert(`Error: ${error.message}`);
      }
      setIsSubmitting(false);
    }
  };

  // --- 1. THE SUCCESS VIEW (MOVED OUTSIDE HANDLESUBMIT) ---
  if (showSuccess) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', textAlign: 'center', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '50px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' }}>
          <div style={{ background: '#DCFCE7', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
            <CheckCircle2 size={50} color="#16A34A" />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px', color: '#1E293B' }}>Great Job!</h2>
          <p style={{ color: '#64748B', fontSize: '18px', marginBottom: '40px', lineHeight: 1.5 }}>
            Your worksheet "<strong>{worksheet.title}</strong>" has been submitted to your teacher.
          </p>
          <button
            onClick={onClose}
            style={{ width: '100%', background: '#2D2D30', color: '#fff', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            Back to Dashboard <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'choice':
        return (
          <div style={{ display: 'grid', gap: '10px' }}>
            {question.options.map((opt, oIdx) => (
              <button
                key={oIdx}
                onClick={() => handleAnswerChange(question.id, opt, question.type)}
                style={{
                  padding: '15px', borderRadius: '12px', textAlign: 'left', border: '2px solid ' + (answers[question.id] === opt ? (isDark ? '#4a4a4a' : '#6366F1') : (isDark ? '#4a4a4a' : '#E2E8F0')),
                  background: answers[question.id] === opt ? (isDark ? '#1e3d20' : '#EEF2FF') : (isDark ? '#252525' : '#fff'),
                  color: answers[question.id] === opt ? (isDark ? '#ffffff' : '#6366F1') : (isDark ? '#9ca3af' : '#64748B'),
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      
      case 'blank':
        { const parts = question.question.split('[blank]');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              {parts.map((part, index) => (
                <React.Fragment key={index}>
                  <span style={{ marginRight: '5px', color: isDark ? '#f0f0f0' : 'inherit' }}>{part}</span>
                  {index < parts.length - 1 && (
                    <input
                      style={{ width: '80px', padding: '8px', margin: '0 5px', borderRadius: '8px', border: '2px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'), background: isDark ? '#252525' : '#fff', color: isDark ? '#f0f0f0' : 'inherit', fontSize: '16px' }}
                      placeholder="Answer"
                      onChange={(e) => handleAnswerChange(question.id, { index, answer: e.target.value }, question.type)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ); }

      case 'match':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {question.pairs.map((pair, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, padding: '10px', background: '#F1F5F9', borderRadius: '8px' }}>
                  {pair.left}
                </div>
                <div style={{ width: '30px', textAlign: 'center' }}>→</div>
                <input
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #E2E8F0', fontSize: '16px' }}
                  placeholder={`Match for "${pair.left}"`}
                  onChange={(e) => handleAnswerChange(question.id, { key: pair.left, value: e.target.value }, question.type)}
                />
              </div>
            ))}
          </div>
        );

      case 'comprehension':
        return (
          <textarea
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'), background: isDark ? '#252525' : '#fff', color: isDark ? '#f0f0f0' : 'inherit', fontSize: '16px', minHeight: '120px', resize: 'vertical' }}
            placeholder="Type your answer here..."
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );

      case 'truefalse':
        return (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleAnswerChange(question.id, 'true', question.type)}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid ' + (answers[question.id] === 'true' ? (isDark ? '#4a4a4a' : '#4CAF50') : (isDark ? '#4a4a4a' : '#E2E8F0')),
                background: answers[question.id] === 'true' ? (isDark ? '#1e3d20' : '#E8F5E9') : (isDark ? '#252525' : '#fff'),
                color: answers[question.id] === 'true' ? (isDark ? '#ffffff' : '#4CAF50') : (isDark ? '#9ca3af' : '#64748B'),
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              True
            </button>
            <button
              onClick={() => handleAnswerChange(question.id, 'false', question.type)}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid ' + (answers[question.id] === 'false' ? (isDark ? '#4a4a4a' : '#EF4444') : (isDark ? '#4a4a4a' : '#E2E8F0')),
                background: answers[question.id] === 'false' ? (isDark ? '#1e3d20' : '#FEF2F2') : (isDark ? '#252525' : '#fff'),
                color: answers[question.id] === 'false' ? (isDark ? '#ffffff' : '#EF4444') : (isDark ? '#9ca3af' : '#64748B'),
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              False
            </button>
          </div>
        );

      case 'numeric':
        return (
          <input
            type="number"
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'), background: isDark ? '#252525' : '#fff', color: isDark ? '#f0f0f0' : 'inherit', fontSize: '16px' }}
            placeholder="Enter a number..."
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );

      case 'ordering':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.sentenceParts?.map((part, index) => (
              <div
                key={index}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'),
                  background: isDark ? '#252525' : '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDark ? '#4a4a4a' : '#4F46E5',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '12px',
                  flexShrink: 0
                }}>
                  {answers[question.id]?.indexOf(part) + 1 || index + 1}
                </span>
                <span style={{ fontSize: '16px', fontWeight: 500, color: isDark ? '#f0f0f0' : 'inherit' }}>{part}</span>
              </div>
            ))}
          </div>
        );

      case 'sorting':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.items?.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'),
                  background: isDark ? '#252525' : '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: isDark ? '#f0f0f0' : '#64748B'
                }}
              >
                <span style={{ color: isDark ? '#9ca3af' : '#64748B', fontSize: '14px' }}>{item}</span>
              </div>
            ))}
            <textarea
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'), background: isDark ? '#252525' : '#fff', color: isDark ? '#f0f0f0' : 'inherit', fontSize: '16px', minHeight: '100px', resize: 'vertical', marginTop: '10px' }}
              placeholder="Type how you sorted these items..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
            />
          </div>
        );

      default:
        return (
          <input
            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '2px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'), background: isDark ? '#252525' : '#fff', color: isDark ? '#f0f0f0' : 'inherit', fontSize: '16px' }}
            placeholder="Type your answer here..."
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
          />
        );
    }
  };

  // --- 2. THE MAIN WORKSHEET VIEW ---
  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
    // Reduced padding for mobile to push buttons to the edges
    padding: isMobile ? '12px 16px' : '20px 40px',
    borderBottom: '1px solid ' + (isDark ? '#4a4a4a' : '#E2E8F0'),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: isDark ? '#252525' : '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10
  }}>
  {/* QUIT BUTTON: Icon only on mobile */}
  <button
    onClick={onClose}
    style={{
      border: isMobile ? '2px solid ' + (isDark ? '#6a6a6a' : '#E2E8F0') : 'none',
      background: isMobile ? (isDark ? '#3d3d3d' : 'rgba(255,255,255,0.1)') : 'none',
      borderRadius: isMobile ? '12px' : '0',
      padding: isMobile ? '8px' : '0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: 700
    }}
  >
    <ChevronLeft size={isMobile ? 24 : 20} />
    {!isMobile && 'Quit'}
  </button>

  {/* TITLE: Centered and truncated if too long */}
  <h2 style={{
    margin: 0,
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: 900,
    flex: 1,
    textAlign: 'center',
    padding: '0 10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: isDark ? '#f0f0f0' : 'inherit'
  }}>
    {worksheet.title}
  </h2>

  {/* SUBMIT BUTTON: Simplified text on mobile */}
  <button
    onClick={handleSubmit}
    disabled={isSubmitting}
    style={{
      background: isSubmitting ? '#94A3B8' : '#4F46E5',
      color: '#fff',
      border: isMobile ? '2px solid ' + (isDark ? '#6a6a6a' : '#E2E8F0') : 'none',
      padding: isMobile ? '10px 18px' : '10px 25px',
      borderRadius: '12px',
      fontWeight: 700,
      cursor: isSubmitting ? 'wait' : 'pointer',
      whiteSpace: 'nowrap'
    }}
  >
    {isSubmitting
      ? (isMobile ? '...' : 'Submitting...')
      : (isMobile ? 'Submit' : 'Finish & Submit')
    }
  </button>
      </header>
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 20px', background: isDark ? '#252525' : '#F8FAFC' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {worksheet.questions.map((q, idx) => (
            <div key={q.id} style={{ background: '#fff', borderRadius: '24px', padding: '30px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#6366F1', textTransform: 'uppercase' }}>Question {idx + 1}</span>
              {q.paragraph && (
                <div style={{ background: '#F1F5F9', padding: '20px', borderRadius: '16px', margin: '15px 0', lineHeight: '1.6', fontSize: '16px' }}>
                  {q.paragraph}
                </div>
              )}
              <h3 style={{ fontSize: '20px', margin: '15px 0' }}>{q.question}</h3>
              {q.image && <img src={q.image} style={{ width: '100%', borderRadius: '16px', marginBottom: '20px' }} alt="question" />}
              {renderQuestionInput(q)}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentWorksheetSolver;