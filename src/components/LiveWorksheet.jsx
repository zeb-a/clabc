import { useState } from 'react';
import { Upload, FileText, CheckCircle2, X, Plus, Trash2, Play, Send, ChevronLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from '../i18n';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker for version 3.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts text from uploaded file (supports PDF, DOCX, and TXT)
 */
function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const fileType = file.type || file.name.split('.').pop().toLowerCase();

    // PDF files
    if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          if (!fullText.trim()) {
            reject(new Error('No text found in PDF. The PDF may contain scanned images rather than selectable text.'));
          } else {
            resolve(fullText);
          }
        } catch (err) {
          reject(new Error(`Failed to parse PDF: ${err.message || 'Unknown error'}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    }
    // DOCX files
    else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
          resolve(result.value);
        } catch (err) {
          reject(new Error('Failed to parse DOCX file. Please ensure it\'s a valid .docx file.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read DOCX file'));
      reader.readAsArrayBuffer(file);
    }
    // Plain text files
    else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    }
    else {
      reject(new Error('Unsupported file format. Please use .pdf, .docx, or .txt files.'));
    }
  });
}

/**
 * Parses worksheet text into questions and options
 * Supports multiple formats:
 * 
 * Format 1 - Numbered questions with lettered options on same line:
 * 1. What is the capital of France? A) London B) Paris C) Berlin D) Madrid
 * 
 * Format 2 - Numbered questions with options below:
 * 1. What is the capital of France?
 * A) London
 * B) Paris
 * C) Berlin
 * D) Madrid
 * 
 * Format 3 - With periods instead of parentheses:
 * 1. What is 2 + 2?
 * A. 3
 * B. 4
 * C. 5
 * D. 6
 * 
 * Format 4 - Answer key at end:
 * 1. What is the capital of France? A) London B) Paris C) Berlin D) Madrid
 * 2. What is 2 + 2? A) 3 B) 4 C) 5 D) 6
 * Answer Key: 1. B 2. B
 */
function parseWorksheetText(text) {
  // Normalize text - unify various formats
  let normalizedText = text
    // Collapse multiple spaces into single space
    .replace(/\s+/g, ' ')
    // Insert newlines before question numbers to handle questions on same line
    .replace(/(\s)(\d+\.\s)/g, '\n$2')
    // Convert "A." to "A)" for consistency
    .replace(/([a-dA-D])\.\s/g, '$1) ')
    // Add spaces around parenthesized letters
    .replace(/\(([a-dA-D])\)/g, ' $1) ')
    // Normalize dashes
    .replace(/–/g, '-')
    // Remove special characters but keep letters, numbers, and common punctuation
    .replace(/[^\x20-\x7E\n]/g, ' ');

  const lines = normalizedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQuestion = null;
  let answerKeyMode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect answer key section
    if (/^answer\s*key/i.test(line)) {
      answerKeyMode = true;
      continue;
    }

    // Process answer key entries
    if (answerKeyMode) {
      const match = line.match(/^(\d+)\s*[:.)]\s*([ABCDabcd])/i);
      if (match) {
        const qNum = parseInt(match[1]) - 1;
        const answer = match[2].toUpperCase();
        if (questions[qNum]) {
          const answerIndex = ['A', 'B', 'C', 'D'].indexOf(answer);
          if (answerIndex !== -1) {
            questions[qNum].correct = answerIndex;
          }
        }
      }
      continue;
    }

    // Detect question number pattern: "1.", "Q1:", "1)", etc.
    const questionMatch = line.match(/^(\d+)[\.)]\s*(.+)?/i) ||
                         line.match(/^q(\d+)[:.)]\s*(.+)?/i) ||
                         line.match(/^question\s*\d+[:.)]\s*(.+)?/i);

    if (questionMatch) {
      // Save previous question if it has content
      if (currentQuestion && (currentQuestion.question.trim() || currentQuestion.options.some(o => o?.trim()))) {
        questions.push(currentQuestion);
      }

      // Extract question text and parse inline options
      let questionText = questionMatch[2] || '';
      const options = ['', '', '', ''];

      // Parse inline options like "A) London B) Paris C) Berlin D) Madrid"
      // Split by option markers
      const parts = questionText.split(/\s*([ABCD])\)\s*/);

      if (parts.length > 1 && parts[0].trim()) {
        questionText = parts[0].trim();
      }

      for (let j = 1; j < parts.length; j += 2) {
        if (j + 1 < parts.length) {
          const optionLetter = parts[j];
          const optionValue = parts[j + 1].trim();
          const optionIndex = ['A', 'B', 'C', 'D'].indexOf(optionLetter);

          if (optionIndex !== -1) {
            options[optionIndex] = optionValue;
          }
        }
      }

      // Start new question
      currentQuestion = {
        id: Date.now() + questions.length,
        question: questionText,
        options: options,
        correct: 0
      };

      continue;
    }

    // Detect options: "A)", "a)", "(A)", "A -", "a."
    const optionMatch = line.match(/^([a-dA-D])[\)]\s*(.+)?/i) ||
                        line.match(/^\(([a-dA-D])\)\s*(.+)?/i) ||
                        line.match(/^([a-dA-D])\s*-\s*(.+)?/i);

    if (optionMatch && currentQuestion) {
      const optionLetter = optionMatch[1].toUpperCase();
      const optionIndex = ['A', 'B', 'C', 'D'].indexOf(optionLetter);

      if (optionIndex !== -1 && optionIndex < 4) {
        currentQuestion.options[optionIndex] = optionMatch[2] || '';
      }
      continue;
    }

    // If we have a question and this line doesn't match any pattern,
    // it might be continuation of the question text
    if (currentQuestion && !questionMatch && !optionMatch && !answerKeyMode) {
      // Only append if it's not a new question number or answer key
      if (!/^\d+/.test(line) && !/^answer/i.test(line.toLowerCase())) {
        if (currentQuestion.question) {
          currentQuestion.question += ' ' + line;
        } else {
          currentQuestion.question = line;
        }
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && (currentQuestion.question.trim() || currentQuestion.options.some(o => o?.trim()))) {
    questions.push(currentQuestion);
  }

  // Filter out questions without both question text AND at least one option
  return questions.filter(q => q.question?.trim() && q.options.some(o => o?.trim()));
}

export default function LiveWorksheet({ onBack, selectedClass, onAssign, onPlayNow }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [editingQuestions, setEditingQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle file upload
  const handleFileUpload = async (uploadedFile) => {
    // Reset state before processing new file
    setError(null);
    setLoading(true);
    setFile(null);
    setEditingQuestions([]);

    try {
      const text = await extractTextFromFile(uploadedFile);
      const questions = parseWorksheetText(text);

      if (questions.length === 0) {
        setError('No questions found. Please ensure your file follows this format:\n\n' +
                 '1. What is the capital of France?\n' +
                 'A) London\n' +
                 'B) Paris\n' +
                 'C) Berlin\n' +
                 'D) Madrid\n\n' +
                 '2. What is 2 + 2?\n' +
                 'A) 3\n' +
                 'B) 4\n' +
                 'C) 5\n' +
                 'D) 6\n\n' +
                 'Note: PDF files must contain selectable text, not scanned images.');
      } else {
        setFile(uploadedFile);
        setEditingQuestions(questions.map(q => ({
          ...q,
          options: q.options.slice(0, 4).concat(Array(Math.max(0, 4 - q.options.length)).fill(''))
        })));
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err.message || t('worksheets.parse_error'));
    } finally {
      setLoading(false);
    }
  };

  // Update question
  const updateQuestion = (index, field, value) => {
    const updated = [...editingQuestions];
    updated[index][field] = value;
    setEditingQuestions(updated);
  };

  // Update option
  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...editingQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setEditingQuestions(updated);
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correct: 0
    };
    setEditingQuestions([...editingQuestions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (index) => {
    const updated = editingQuestions.filter((_, i) => i !== index);
    setEditingQuestions(updated);
  };

  // Get valid questions count
  const validQuestionsCount = editingQuestions.filter(q =>
    q.question?.trim() && q.options.filter(o => o?.trim()).length >= 2 && q.options[q.correct]?.trim()
  ).length;

  // Handle assign to students
  const handleAssign = () => {
    setError(null);
    setSuccess(null);
    
    if (validQuestionsCount === 0) {
      setError(t('worksheets.validate_questions'));
      return;
    }
    const validQuestions = editingQuestions.filter(q =>
      q.question?.trim() && q.options.filter(o => o?.trim()).length >= 2 && q.options[q.correct]?.trim()
    );
    onAssign && onAssign({
      file: file?.name || 'worksheet',
      questions: validQuestions,
      createdAt: new Date().toISOString()
    });
    setSuccess('Worksheet assigned successfully to ' + (selectedClass?.name || 'your class') + '!');
  };

  // Handle play now
  const handlePlayNow = () => {
    if (validQuestionsCount === 0) {
      setError(t('worksheets.validate_questions'));
      return;
    }
    const validQuestions = editingQuestions.filter(q =>
      q.question?.trim() && q.options.filter(o => o?.trim()).length >= 2 && q.options[q.correct]?.trim()
    );
    onPlayNow && onPlayNow(validQuestions);
  };

  if (!showPreview) {
    // Upload view
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '700px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '5px solid #667eea',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            📄
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 10px 0',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
          }}>
            {t('worksheets.title')}
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Upload a PDF, DOCX, or plain text file containing quiz questions. We'll extract them automatically!
          </p>

          {/* Upload Zone */}
          <div style={{
            border: '3px dashed #667eea',
            borderRadius: '20px',
            padding: '40px',
            background: '#f8f9ff',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
          }}
          onClick={() => document.getElementById('file-upload').click()}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f0ff';
            e.currentTarget.style.borderColor = '#5568d3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8f9ff';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.background = '#f0f0ff';
            e.currentTarget.style.borderColor = '#5568d3';
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.background = '#f8f9ff';
            e.currentTarget.style.borderColor = '#667eea';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.background = '#f8f9ff';
            e.currentTarget.style.borderColor = '#667eea';
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) handleFileUpload(droppedFile);
          }}
          >
            <Upload size={64} color="#667eea" style={{ marginBottom: '15px' }} />
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#667eea',
              marginBottom: '8px'
            }}>
              {t('worksheets.upload_click')}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#999'
            }}>
              {t('worksheets.supported_formats')}: .pdf, .docx, .txt
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              style={{ display: 'none' }}
              onChange={(e) => {
                const uploadedFile = e.target.files[0];
                if (uploadedFile) handleFileUpload(uploadedFile);
              }}
            />
          </div>

          {/* Format Guide */}
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid #e5e7eb',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '10px'
            }}>
              📋 Expected Format:
            </div>
            <pre style={{
              fontSize: '13px',
              color: '#6b7280',
              background: '#f9fafb',
              padding: '12px',
              borderRadius: '8px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
{`1. What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid

2. What is 2 + 2?
A) 3
B) 4
C) 5
D) 6`}
            </pre>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '2px solid #f87171',
              borderRadius: '12px',
              padding: '15px',
              color: '#dc2626',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              textAlign: 'left',
              marginBottom: '15px'
            }}>
              <AlertCircle style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{
              fontSize: '18px',
              color: '#667eea',
              fontWeight: '600'
            }}>
              {t('worksheets.parsing')}...
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={onBack}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(156, 163, 175, 0.3)',
              marginTop: '10px'
            }}
          >
            <ChevronLeft size={20} />
            Back
          </button>
        </div>
      </div>
    );
  }

  // Preview view
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} color="#667eea" />
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '800',
                color: '#667eea'
              }}>
                Edit Questions
              </h2>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {file?.name || 'worksheet'} • {validQuestionsCount} valid
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        {/* Error Message */}
        {success && (
          <div style={{
            background: '#d1fae5',
            border: '2px solid #10b981',
            borderRadius: '10px',
            padding: '16px',
            color: '#065f46',
            fontSize: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <CheckCircle2 size={24} color="#10b981" />
            <span style={{ fontWeight: '600' }}>{success}</span>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '2px solid #f87171',
            borderRadius: '10px',
            padding: '12px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Questions List */}
        <div style={{ marginBottom: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {editingQuestions.map((q, index) => (
            <div key={q.id} style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              border: '2px solid #e5e7eb'
            }}>
              {/* Question Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#667eea',
                  background: '#ede9fe',
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  Question {index + 1}
                </span>
                <button
                  onClick={() => removeQuestion(index)}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    color: '#dc2626',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Question Input */}
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                placeholder="Enter your question here..."
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  resize: 'vertical',
                  minHeight: '60px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />

              {/* Options */}
              <div style={{ display: 'grid', gap: '8px' }}>
                {['A', 'B', 'C', 'D'].map((label, optIndex) => (
                  <div key={optIndex} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => updateQuestion(index, 'correct', optIndex)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: q.correct === optIndex ? '#10b981' : '#e5e7eb',
                        background: q.correct === optIndex ? '#d1fae5' : 'white',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {q.correct === optIndex ? <CheckCircle2 size={20} color="#10b981" /> : label}
                    </button>
                    <input
                      type="text"
                      value={q.options[optIndex]}
                      onChange={(e) => updateOption(index, optIndex, e.target.value)}
                      placeholder={`Option ${label}`}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <button
          onClick={addQuestion}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: '700',
            background: '#f3f4f6',
            color: '#374151',
            border: '2px dashed #d1d5db',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}
        >
          <Plus size={20} />
          Add Question
        </button>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleAssign}
            disabled={validQuestionsCount === 0}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              background: validQuestionsCount > 0 ? '#667eea' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: validQuestionsCount > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: validQuestionsCount > 0 ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
            }}
          >
            <Send size={20} />
            Assign
          </button>
          <button
            onClick={handlePlayNow}
            disabled={validQuestionsCount === 0}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              background: validQuestionsCount > 0 ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: validQuestionsCount > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: validQuestionsCount > 0 ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'
            }}
          >
            <Play size={20} />
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
