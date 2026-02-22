import React, { useState, useRef } from 'react';
import { X, Check, XCircle, Download, Printer, Award, Save } from 'lucide-react';
import api from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * AssignmentGradingModal - Comprehensive question-by-question grading system
 * 
 * Features:
 * - Grade each question individually (correct/incorrect)
 * - Auto-calculate points (correct = +1, incorrect = -1)
 * - Visual feedback (green for correct, red for incorrect)
 * - Teacher signature with final grade (e.g., "1/5" in red circle)
 * - Downloadable/printable graded assignment
 * - Auto-sync points to student card
 * - Save graded report to Reports page
 */
const AssignmentGradingModal = ({ 
  submission, 
  onClose, 
  onSaveGrade,
  studentName,
  assignmentTitle 
}) => {
  const [questionGrades, setQuestionGrades] = useState({});
  const [teacherNotes, setTeacherNotes] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [worksheet, setWorksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const reportRef = useRef(null);

  // Fetch worksheet data
  React.useEffect(() => {
    const fetchWorksheet = async () => {
      try {
        setLoading(true);
        const assignmentId = submission.assignment_id;
        
        
        if (!assignmentId) {
          setLoading(false);
          return;
        }

        // Fetch the class data to get assignments
        const classesData = await api.pbRequest('/collections/classes/records?perPage=500');
        
        // Find the assignment in all classes
        let foundAssignment = null;
        let totalAssignments = 0;
        
        // Extract the title from assignment_id (format: "title_timestamp" where title may have underscores instead of spaces)
        const timestampIndex = assignmentId.lastIndexOf('_');
        let assignmentTitle = timestampIndex !== -1 ? assignmentId.substring(0, timestampIndex) : assignmentId;
        
        // Replace underscores with spaces to match actual assignment titles
        assignmentTitle = assignmentTitle.replace(/_/g, ' ');
        
        
        for (const cls of classesData.items || []) {
          const assignments = typeof cls.assignments === 'string' 
            ? JSON.parse(cls.assignments || '[]') 
            : (cls.assignments || []);
          
          totalAssignments += assignments.length;
          
          // Show all assignment titles for comparison
          if (assignments.length > 0) {
          }
          
          // Try both exact match and case-insensitive match
          const assignment = assignments.find(a => 
            a.title === assignmentTitle || 
            a.title.toLowerCase() === assignmentTitle.toLowerCase()
          );
          
          if (assignment) {
            foundAssignment = assignment;
            break;
          }
        }


        if (!foundAssignment) {
          throw new Error(`Assignment not found. Searched for ID: ${assignmentId}`);
        }

        setWorksheet(foundAssignment);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchWorksheet();
  }, [submission.assignment_id]);

  // Extract questions and answers
  const questions = worksheet?.questions || [];
  const studentAnswers = submission.answers || {};

  // Calculate total score
  const calculateScore = () => {
    const grades = Object.values(questionGrades);
    const correct = grades.filter(g => g === 'correct').length;
    const incorrect = grades.filter(g => g === 'incorrect').length;
    return correct - incorrect;
  };

  // Toggle question grade
  const toggleQuestionGrade = (questionId, grade) => {
    clearValidationError();
    setQuestionGrades(prev => ({
      ...prev,
      [questionId]: prev[questionId] === grade ? null : grade
    }));
    
    // If marking as incorrect, ensure we have a notes entry
    if (grade === 'incorrect') {
      setTeacherNotes(prev => ({
        ...prev,
        [questionId]: prev[questionId] || ''
      }));
    }
  };

  // Update teacher note for a question
  const updateTeacherNote = (questionId, note) => {
    setTeacherNotes(prev => ({
      ...prev,
      [questionId]: note
    }));
  };

  // Get grade status
  const getQuestionGrade = (questionId) => {
    return questionGrades[questionId] || null;
  };

  // Check if all questions are graded
  const allQuestionsGraded = () => {
    return questions.every(q => questionGrades[q.id]);
  };

  const clearValidationError = () => {
    setValidationError(null);
  };

  const handleSaveGrade = async () => {
    if (!allQuestionsGraded()) {
      setValidationError('Please grade all questions before saving.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setIsSaving(true);
    setShowConfirm(false);
    try {
      const finalScore = calculateScore();
      const totalQuestions = questions.length;

      const gradedData = {
        submissionId: submission.id,
        studentId: submission.student_id,
        studentName: studentName || submission.student_name,
        assignmentTitle: assignmentTitle || submission.assignment_title,
        finalScore,
        totalQuestions,
        questionGrades,
        teacherNotes,
        timestamp: new Date().toISOString()
      };

      await onSaveGrade(gradedData);
      onClose();
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  // Download as PDF
  const handleDownload = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${studentName}_${assignmentTitle}_graded.pdf`);
    } catch (error) {
    }
  };

  // Print
  const handlePrint = async () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    const reportContent = reportRef.current ? reportRef.current.innerHTML : '';
    
    printWindow.document.write('<html><head><title>Graded Assignment</title>');
    printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;} .print-header{border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:20px;} .print-header h1{margin:0 0 8px 0;color:#000;} .print-header p{margin:4px 0;color:#666;} .question-card{margin-bottom:20px;padding:16px;background:#f8f9fa;border-radius:8px;border-left:4px solid #E0E0E0;} .question-number{font-weight:700;color:#1976D2;margin-bottom:8px;} .question-text{margin-bottom:12px;line-height:1.5;} .answer-section{background:#fff;padding:12px;border-radius:6px;border:1px solid #E0E0E0;} .grade-indicator{margin-top:12px;font-weight:700;} .grade-correct{color:#4CAF50;} .grade-incorrect{color:#F44336;} .signature{margin-top:20px;padding:16px;background:#f8f9fa;border-radius:12px;} .signature-info{font-size:13px;line-height:1.6;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div class="print-header">');
    printWindow.document.write(`<h1>${assignmentTitle}</h1>`);
    printWindow.document.write(`<p><strong>Student:</strong> ${studentName}</p>`);
    printWindow.document.write(`<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>`);
    printWindow.document.write(`<p><strong>Score:</strong> ${finalScore}/${totalQuestions}</p>`);
    printWindow.document.write('</div>');
    printWindow.document.write(reportContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const finalScore = calculateScore();
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.max(0, (finalScore / totalQuestions) * 100) : 0;

  // Show loading state
  if (loading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={{ ...styles.content, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#1976D2', marginBottom: '10px' }}>
                Loading questions...
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Please wait</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no questions
  if (!questions || questions.length === 0) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <h2 style={styles.title}>No Questions Found</h2>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={24} />
            </button>
          </div>
          <div style={{ ...styles.content, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <XCircle size={48} color="#F44336" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', color: '#666' }}>
                This assignment has no questions to grade.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      {showConfirm && (
        <div style={styles.confirmOverlay}>
          <div style={styles.confirmBox}>
            <h3 style={styles.confirmTitle}>Are you sure?</h3>
            <p style={styles.confirmText}>You cannot grade this assignment again after saving.</p>
            <div style={styles.confirmActions}>
              <button onClick={() => setShowConfirm(false)} style={styles.confirmCancel}>Cancel</button>
              <button onClick={confirmSave} disabled={isSaving} style={styles.confirmSave}>
                {isSaving ? 'Saving...' : 'Yes, Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      {validationError && (
        <div style={styles.errorAlert}>
          {validationError}
        </div>
      )}
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h2 style={styles.title}>Grade Assignment</h2>
            <div style={styles.headerInfo}>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}><strong>Student:</strong> {studentName}</span>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}><strong>Assignment:</strong> {assignmentTitle}</span>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.compactScore}>
              <span style={styles.compactScoreLabel}>Score:</span>
              <span style={{
                ...styles.compactScoreNumber,
                color: finalScore >= 0 ? '#4CAF50' : '#F44336'
              }}>
                {finalScore}/{totalQuestions}
              </span>
              <div style={styles.compactStats}>
                <span style={styles.compactStat}>
                  <Check size={14} color="#4CAF50" />
                  {Object.values(questionGrades).filter(g => g === 'correct').length}
                </span>
                <span style={styles.compactStat}>
                  <XCircle size={14} color="#F44336" />
                  {Object.values(questionGrades).filter(g => g === 'incorrect').length}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Grading Area */}
        <div style={styles.content}>
          {/* Printable Report */}
          <div ref={reportRef} style={styles.report}>

            {/* Questions */}
            {questions.map((q, index) => {
              const grade = getQuestionGrade(q.id);
              const answer = studentAnswers[q.id];
              const isUngraded = !grade && validationError;

              return (
                <div 
                  key={q.id} 
                  style={{
                    ...styles.questionCard,
                    borderLeft: grade === 'correct' ? '4px solid #4CAF50' : 
                               grade === 'incorrect' ? '4px solid #F44336' : 
                               '4px solid #E0E0E0',
                    ...(isUngraded && styles.ungradedQuestion)
                  }}
                >
                  <div style={styles.questionHeader}>
                    <span style={styles.questionNumber}>Question {index + 1}</span>
                    <div style={styles.gradeButtons}>
                      <button
                        onClick={() => toggleQuestionGrade(q.id, 'correct')}
                        style={{
                          ...styles.gradeBtn,
                          ...styles.correctBtn,
                          ...(grade === 'correct' ? styles.activeBtnCorrect : styles.inactiveBtn)
                        }}
                        title="Mark as correct (+1 point)"
                      >
                        <Check size={24} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => toggleQuestionGrade(q.id, 'incorrect')}
                        style={{
                          ...styles.gradeBtn,
                          ...styles.incorrectBtn,
                          ...(grade === 'incorrect' ? styles.activeBtnIncorrect : styles.inactiveBtn)
                        }}
                        title="Mark as incorrect (-1 point)"
                      >
                        <XCircle size={24} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.questionText}>{q.question}</div>
                  
                  <div style={styles.answerSection}>
                    <strong style={styles.answerLabel}>Student Answer:</strong>
                    <div style={{
                      ...styles.answerText,
                      ...(isUngraded && styles.ungradedAnswer)
                    }}>
                      {typeof answer === 'object' ? JSON.stringify(answer, null, 2) : answer || 'No answer provided'}
                    </div>
                  </div>

                  {/* Teacher Notes for Incorrect Answers */}
                  {grade === 'incorrect' && (
                    <div style={styles.teacherNotesSection}>
                      <strong style={styles.notesLabel}>Teacher Notes:</strong>
                      <textarea
                        value={teacherNotes[q.id] || ''}
                        onChange={(e) => updateTeacherNote(q.id, e.target.value)}
                        placeholder="Add feedback for this incorrect answer..."
                        style={styles.notesTextarea}
                      />
                    </div>
                  )}

                  {/* Grade indicator for print */}
                  {grade && (
                    <div style={{
                      ...styles.gradeIndicator,
                      color: grade === 'correct' ? '#4CAF50' : '#F44336'
                    }}>
                      {grade === 'correct' ? '✓ Correct' : '✗ Incorrect'}
                    </div>
                  )}

                  {/* Display notes in print view */}
                  {grade === 'incorrect' && teacherNotes[q.id] && (
                    <div style={styles.printNotes}>
                      <strong>Teacher Feedback:</strong>
                      <div style={styles.printNotesText}>{teacherNotes[q.id]}</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Teacher Signature */}
            <div style={styles.signature}>
              <div style={styles.signatureCircle}>
                <span style={styles.signatureScore}>{finalScore}/{totalQuestions}</span>
              </div>
              <div style={styles.signatureInfo}>
                <p><strong>Final Score:</strong> {finalScore} point{finalScore !== 1 ? 's' : ''}</p>
                <p><strong>Percentage:</strong> {percentage.toFixed(0)}%</p>
                <p><strong>Graded by:</strong> Teacher</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={styles.footer}>
          <div style={styles.scoreDisplay}>
            <Award size={24} color="#FFD700" />
            <span style={styles.scoreText}>
              Score: <strong>{finalScore}</strong> / {totalQuestions}
            </span>
          </div>

          <div style={styles.actions}>
            <button onClick={handleDownload} style={styles.actionBtn}>
              <Download size={18} />
              Download PDF
            </button>
            <button onClick={handlePrint} style={styles.actionBtn}>
              <Printer size={18} />
              Print
            </button>
            <button 
              onClick={handleSaveGrade} 
              disabled={isSaving}
              style={{
                ...styles.actionBtn,
                ...styles.saveBtn,
                opacity: isSaving ? 0.6 : 1
              }}
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Grade & Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        
        button:hover {
          filter: brightness(1.1);
        }
        
        button:active {
          transform: scale(0.95);
        }
        
        textarea:hover {
          border-color: '#fdcb6e';
        }
        
        textarea:focus {
          border-color: '#fdcb6e';
          box-shadow: '0 0 0 3px rgba(253, 203, 110, 0.2)';
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '10px'
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '95vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #E0E0E0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px'
  },
  headerLeft: {
    flex: 1,
    minWidth: 0
  },
  headerInfo: {
    marginTop: '6px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
    fontSize: '12px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0
  },
  compactScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #E0E0E0'
  },
  compactScoreLabel: {
    fontSize: '11px',
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  },
  compactScoreNumber: {
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: '1'
  },
  compactStats: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px'
  },
  compactStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#666'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#666'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px'
  },
  report: {
    background: '#fff',
    padding: '16px',
    borderRadius: '8px'
  },
  reportHeader: {
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #000'
  },
  reportTitle: {
    margin: '0 0 16px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#000'
  },
  reportMeta: {
    display: 'flex',
    gap: '24px',
    fontSize: '14px',
    color: '#666'
  },
  questionCard: {
    background: '#f8f9fa',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
    transition: 'all 0.2s'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  questionNumber: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1976D2',
    textTransform: 'uppercase'
  },
  gradeButtons: {
    display: 'flex',
    gap: '8px'
  },
  gradeBtn: {
    border: '2px solid transparent',
    padding: '10px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    minWidth: '50px',
    minHeight: '50px',
    position: 'relative'
  },
  correctBtn: {
    background: '#fff',
    color: '#4CAF50'
  },
  incorrectBtn: {
    background: '#fff',
    color: '#F44336'
  },
  activeBtnCorrect: {
    background: '#4CAF50',
    color: '#fff',
    borderColor: '#4CAF50',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
    transform: 'scale(1.1)'
  },
  activeBtnIncorrect: {
    background: '#F44336',
    color: '#fff',
    borderColor: '#F44336',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
    transform: 'scale(1.1)'
  },
  inactiveBtn: {
    opacity: 0.5,
    borderColor: '#E0E0E0'
  },
  questionText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#1a1a1a',
    marginBottom: '10px'
  },
  answerSection: {
    marginTop: '10px'
  },
  answerLabel: {
    fontSize: '13px',
    color: '#666',
    display: 'block',
    marginBottom: '6px'
  },
  answerText: {
    background: '#fff',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '15px',
    lineHeight: '1.6',
    border: '1px solid #E0E0E0',
    whiteSpace: 'pre-wrap'
  },
  teacherNotesSection: {
    marginTop: '16px',
    padding: '16px',
    background: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '8px',
    borderLeft: '4px solid #fdcb6e'
  },
  notesLabel: {
    fontSize: '13px',
    color: '#856404',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600'
  },
  notesTextarea: {
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '1.5',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: '#fff',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  gradeIndicator: {
    marginTop: '12px',
    fontSize: '14px',
    fontWeight: '700'
  },
  printNotes: {
    marginTop: '12px',
    padding: '12px',
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '13px'
  },
  printNotesText: {
    marginTop: '6px',
    lineHeight: '1.5',
    color: '#495057'
  },
  signature: {
    marginTop: '20px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  signatureCircle: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: '4px solid #F44336',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  signatureScore: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#F44336'
  },
  signatureInfo: {
    fontSize: '13px',
    lineHeight: '1.6'
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #E0E0E0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  scoreDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  scoreText: {
    fontSize: '14px',
    color: '#1a1a1a'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #E0E0E0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  saveBtn: {
    background: '#1976D2',
    color: '#fff',
    border: 'none'
  },
  confirmOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderRadius: '16px'
  },
  confirmBox: {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '320px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    border: '3px solid #DC2626'
  },
  confirmTitle: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#DC2626'
  },
  confirmText: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5'
  },
  confirmActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  confirmCancel: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #E0E0E0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666'
  },
  confirmSave: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '2px solid #1976D2',
    background: '#1976D2',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  errorAlert: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#DC2626',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 100001,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
  },
  ungradedQuestion: {
    border: '3px solid #DC2626 !important',
    animation: 'shake 0.3s ease-in-out',
    boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.3)'
  },
  ungradedAnswer: {
    border: '2px solid #DC2626',
    boxShadow: 'inset 0 0 0 1px rgba(220, 38, 38, 0.5)'
  }
};

export default AssignmentGradingModal;
