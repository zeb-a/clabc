import React, { useState, useRef } from 'react';
import { X, Check, XCircle, Download, Printer, Award, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';

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
  const reportRef = useRef(null);

  // Fetch worksheet data
  React.useEffect(() => {
    const fetchWorksheet = async () => {
      try {
        setLoading(true);
        const assignmentId = submission.assignment_id;
        
        console.log('Debug: submission object:', submission);
        console.log('Debug: assignmentId:', assignmentId);
        
        if (!assignmentId) {
          console.error('No assignment_id found in submission');
          alert('Debug: No assignment_id found in submission');
          setLoading(false);
          return;
        }

        // Fetch the class data to get assignments
        const classesData = await api.pbRequest('/collections/classes/records?perPage=500');
        console.log('Debug: classesData:', classesData);
        
        // Find the assignment in all classes
        let foundAssignment = null;
        let totalAssignments = 0;
        
        // Extract the title from assignment_id (format: "title_timestamp" where title may have underscores instead of spaces)
        const timestampIndex = assignmentId.lastIndexOf('_');
        let assignmentTitle = timestampIndex !== -1 ? assignmentId.substring(0, timestampIndex) : assignmentId;
        
        // Replace underscores with spaces to match actual assignment titles
        assignmentTitle = assignmentTitle.replace(/_/g, ' ');
        
        console.log('Debug: Original assignment_id:', assignmentId);
        console.log('Debug: Extracted title before space replacement:', timestampIndex !== -1 ? assignmentId.substring(0, timestampIndex) : assignmentId);
        console.log('Debug: Looking for assignment with title:', assignmentTitle);
        
        for (const cls of classesData.items || []) {
          const assignments = typeof cls.assignments === 'string' 
            ? JSON.parse(cls.assignments || '[]') 
            : (cls.assignments || []);
          
          console.log(`Debug: Class ${cls.name} has ${assignments.length} assignments:`, assignments);
          totalAssignments += assignments.length;
          
          // Show all assignment titles for comparison
          if (assignments.length > 0) {
            console.log(`Debug: Available titles in ${cls.name}:`, assignments.map(a => a.title));
          }
          
          // Try both exact match and case-insensitive match
          const assignment = assignments.find(a => 
            a.title === assignmentTitle || 
            a.title.toLowerCase() === assignmentTitle.toLowerCase()
          );
          
          if (assignment) {
            console.log('Debug: Found assignment in class:', cls.name, assignment);
            foundAssignment = assignment;
            break;
          }
        }

        console.log(`Debug: Searched ${classesData.items?.length || 0} classes, ${totalAssignments} total assignments`);

        if (!foundAssignment) {
          throw new Error(`Assignment not found. Searched for ID: ${assignmentId}`);
        }

        setWorksheet(foundAssignment);
      } catch (error) {
        console.error('Error fetching worksheet:', error);
        alert(`Failed to load assignment questions. Debug info: ${error.message}`);
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

  // Handle save and submit
  const handleSaveGrade = async () => {
    setIsSaving(true);
    try {
      const finalScore = calculateScore();
      const totalQuestions = questions.length;
      
      // Prepare graded data
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

      // Call parent handler to save
      await onSaveGrade(gradedData);
      
      alert(`Grade saved! ${studentName} received ${finalScore} point${finalScore !== 1 ? 's' : ''}.`);
      onClose();
    } catch (error) {
      console.error('Failed to save grade:', error);
      alert('Failed to save grade. Please try again.');
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
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
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

              return (
                <div 
                  key={q.id} 
                  style={{
                    ...styles.questionCard,
                    borderLeft: grade === 'correct' ? '4px solid #4CAF50' : 
                               grade === 'incorrect' ? '4px solid #F44336' : 
                               '4px solid #E0E0E0'
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
                    <div style={styles.answerText}>
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
    padding: '20px'
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #E0E0E0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1
  },
  headerInfo: {
    marginTop: '8px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
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
    fontSize: '24px',
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
    padding: '8px',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  },
  report: {
    background: '#fff',
    padding: '32px',
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
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '16px',
    transition: 'all 0.2s'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  questionNumber: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1976D2',
    textTransform: 'uppercase'
  },
  gradeButtons: {
    display: 'flex',
    gap: '12px'
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
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#1a1a1a',
    marginBottom: '12px'
  },
  answerSection: {
    marginTop: '12px'
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
    marginTop: '32px',
    padding: '24px',
    background: '#f8f9fa',
    borderRadius: '12px',
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  signatureCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '4px solid #F44336',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  signatureScore: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#F44336'
  },
  signatureInfo: {
    fontSize: '14px',
    lineHeight: '1.8'
  },
  footer: {
    padding: '24px',
    borderTop: '1px solid #E0E0E0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  },
  scoreDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  scoreText: {
    fontSize: '18px',
    color: '#1a1a1a'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  actionBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid #E0E0E0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  saveBtn: {
    background: '#1976D2',
    color: '#fff',
    border: 'none'
  }
};

export default AssignmentGradingModal;
