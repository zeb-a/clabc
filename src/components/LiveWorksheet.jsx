import { useState } from 'react';
import { Upload, FileText, CheckCircle2, X, Plus, Trash2, Play, Send, ChevronLeft, AlertCircle, ArrowUpDown } from 'lucide-react';
import { useTranslation } from '../i18n';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker for version 3.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Question types configuration
const QUESTION_TYPES = {
  choice: { label: 'Multiple Choice', icon: '📝', color: '#6366F1' },
  blank: { label: 'Fill in the Blanks', icon: '✏️', color: '#F59E0B' },
  match: { label: 'Matching', icon: '🔗', color: '#8B5CF6' },
  comprehension: { label: 'Story/Comprehension', icon: '📖', color: '#10B981' },
  truefalse: { label: 'True/False', icon: '✓✗', color: '#EF4444' },
  numeric: { label: 'Numeric', icon: '🔢', color: '#3B82F6' },
  ordering: { label: 'Ordering', icon: '🔢', color: '#EC4899' },
  sorting: { label: 'Sorting', icon: '📊', color: '#14B8A6' }
};

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
 * Detects the question type based on content patterns
 */
function detectQuestionType(questionText, options) {
  const text = (questionText || '').toLowerCase();

  // Detect fill-in-the-blanks (text with [blank] or ___ placeholders)
  if (text.includes('[blank]') || text.includes('___') || /\[?\d+\]?\s*___/.test(text)) {
    return 'blank';
  }

  // Detect matching exercises (contains "match" or pairs of items)
  if (text.includes('match') || text.includes('pair') || (options && options.length > 0 && options[0]?.includes('='))) {
    return 'match';
  }

  // Detect comprehension/story questions (has "story:", "passage:", "read:", or long text)
  if (text.includes('story:') || text.includes('passage:') || text.includes('read:') ||
      text.includes('text:') || text.includes('article:') || text.length > 200) {
    return 'comprehension';
  }

  // Detect true/false questions - More flexible patterns
  if (/\btrue\b.*\bfalse\b|\bfalse\b.*\btrue\b|t\s*\/\s*f|\btrue\s+or\s+false\b|\btrue\s*\/\s*false\b/i.test(text) ||
      /\(true\s*\/\s*false\)|\(t\s*\/\s*f\)|\(true\s+or\s+false\)/i.test(text)) {
    return 'truefalse';
  }

  // Detect numeric questions (asks for number, calculation, etc.)
  if (/calculate|compute|sum|total|count|number|how many|how much|what is \d|\+|\-|\*|div|\/\s*\d/.test(text)) {
    return 'numeric';
  }

  // Detect ordering questions (contains "order", "sequence", "put in order")
  if (/\borders?\b|\bsequence\b|\bput in order\b|\barrange\b|\bstep\s+\d+/i.test(text)) {
    return 'ordering';
  }

  // Detect sorting questions (contains "sort", "categorize", "group", "classify")
  if (/\bsorts?\b|\bcategorize\b|\bgroup\b|\bclassify\b|\bcategories?\b/i.test(text)) {
    return 'sorting';
  }

  // Default to multiple choice if options are present
  if (options && options.filter(o => o?.trim()).length >= 2) {
    return 'choice';
  }

  // Default to comprehension for general questions
  return 'comprehension';
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
 * Format 4 - Fill in the blanks:
 * 1. The capital of France is ___.
 * 2. The ___ is the largest planet in our solar system.
 * 
 * Format 5 - Matching exercises:
 * 1. Match the following: Paris = France, London = England, Madrid = Spain
 * 
 * Format 6 - True/False:
 * 1. The capital of France is London. (True/False)
 * 2. The Earth is flat. (T/F)
 * 
 * Format 7 - Story/Comprehension:
 * Story: Once upon a time...
 * 1. What happened in the story?
 * 
 * Format 8 - Numeric:
 * 1. Calculate 5 + 3.
 * 
 * Format 9 - Ordering:
 * 1. Put these in order: first, second, third.
 * 
 * Format 10 - Sorting:
 * 1. Sort these animals into mammals and reptiles.
 * 
 * Format 11 - Answer key at end:
 * 1. What is the capital of France? A) London B) Paris C) Berlin D) Madrid
 * 2. What is 2 + 2? A) 3 B) 4 C) 5 D) 6
 * Answer Key: 1. B 2. B
 */
function parseWorksheetText(text) {
  // Normalize text - unify various formats (more aggressive normalization)
  let normalizedText = text
    // Collapse multiple spaces/tabs into single space
    .replace(/\s+/g, ' ')
    // Insert newlines before question numbers to handle questions on same line
    .replace(/(\s)(\d+[\.\)\:]\s)/g, '\n$2')
    // Normalize various option separators to standard format
    .replace(/([a-dA-D])\.\s/g, '$1) ') // A. -> A)
    .replace(/([a-dA-D])\:\s/g, '$1) ') // A: -> A)
    .replace(/([a-dA-D])\-\s/g, '$1) ') // A- -> A)
    // Add spaces around parenthesized letters
    .replace(/\(([a-dA-D])\)/g, ' $1) ')
    // Normalize dashes and arrows
    .replace(/–|→|➜|→/g, '-')
    // Normalize various True/False indicators
    .replace(/\(True\s*\/\s*False\)/gi, '(True/False)')
    .replace(/\(T\s*\/\s*F\)/gi, '(T/F)')
    // Clean up extra spaces around punctuation
    .replace(/\s+([\.\,\?\!\:\;\)])/g, '$1')
    .replace(/([\(\[])\s+/g, '$1')
    // Remove special characters but keep letters, numbers, and common punctuation
    .replace(/[^\x20-\x7E\n]/g, ' ');

  const lines = normalizedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQuestion = null;
  let answerKeyMode = false;
  let currentParagraph = ''; // For story/comprehension questions

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect story/passage marker
    if (/^(story|passage|read|text)\s*:/i.test(line)) {
      currentParagraph = line.replace(/^(story|passage|read|text)\s*:\s*/i, '');
      continue;
    }

    // Detect answer key section
    if (/^answer\s*key/i.test(line)) {
      answerKeyMode = true;
      continue;
    }

    // Process answer key entries - More flexible matching
    if (answerKeyMode) {
      // Handle different answer formats: "1. Answer", "1) Answer", "1: Answer", "1 Answer", "1-Answer"
      const match = line.match(/^(\d+)\s*[\.\)\:\-]?\s*(.+)$/i) ||
                    line.match(/^(\d+)\s+[:\-]?\s*(.+)$/i);
      if (match) {
        const qNum = parseInt(match[1]) - 1;
        const answer = match[2].trim();
        if (questions[qNum]) {
          // Handle based on question type
          if (questions[qNum].type === 'choice') {
            const answerIndex = ['A', 'B', 'C', 'D'].indexOf(answer.toUpperCase());
            if (answerIndex !== -1) {
              questions[qNum].correct = answerIndex;
            }
          } else if (questions[qNum].type === 'truefalse') {
            questions[qNum].correct = answer.toLowerCase() === 'true' || answer.toLowerCase() === 't' ? 'true' : 'false';
          } else if (questions[qNum].type === 'numeric') {
            questions[qNum].correct = parseFloat(answer);
          } else {
            questions[qNum].correct = answer;
          }
        }
      }
      continue;
    }

    // Detect question number pattern - More flexible patterns to catch edge cases
    const questionMatch = line.match(/^(\d+)[\.)]\s*(.+)?/i) ||
                         line.match(/^(\d+)\)\s*(.+)?/i) ||
                         line.match(/^q(\d+)[:.)]\s*(.+)?/i) ||
                         line.match(/^question\s*\d+[:.)]\s*(.+)?/i) ||
                         line.match(/^(\d+)\.\s+(.+)?/i) ||
                         line.match(/^(\d+)\s+[:\-]\s*(.+)?/i);

    if (questionMatch) {
      // Save previous question if it has content
      if (currentQuestion && (currentQuestion.question.trim() || currentQuestion.options.some(o => o?.trim()))) {
        // Detect and set question type
        currentQuestion.type = detectQuestionType(currentQuestion.question, currentQuestion.options);
        if (currentParagraph && currentQuestion.type === 'comprehension') {
          currentQuestion.paragraph = currentParagraph;
        }
        questions.push(currentQuestion);
      }

      // Extract question text and parse inline options
      let questionText = questionMatch[2] || '';
      const options = ['', '', '', ''];

      // Check if this is a matching exercise with inline pairs
      const matchPairs = questionText.match(/([^.!?]+)\s*=\s*([^.!?]+)/g);
      if (matchPairs && matchPairs.length > 0) {
        options.length = 0;
        matchPairs.forEach(pair => {
          const [left, right] = pair.split('=').map(s => s.trim());
          if (left && right) {
            options.push({ left, right });
          }
        });
        questionText = 'Match the following items:';
      } else {
      // Parse inline options like "A) London B) Paris C) Berlin D) Madrid" or "A. London B. Paris" or "A- London B- Paris"
      const parts = questionText.split(/\s*([ABCD])[\).\-\:]\s*/);

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
      }

      // Detect if it's a true/false question and set options
      const isTrueFalse = /true.*false|t\/f|true or false/i.test(questionText);
      if (isTrueFalse) {
        questionText = questionText.replace(/\s*\(.*?(true.*false|t\/f|true or false).*?\)\s*/gi, '').trim();
      }

      // Start new question
      currentQuestion = {
        id: Date.now() + questions.length,
        type: null, // Will be detected after parsing
        question: questionText,
        options: isTrueFalse ? ['True', 'False'] : options,
        correct: isTrueFalse ? 'true' : 0,
        pairs: matchPairs ? options : null, // For matching exercises
        sentenceParts: null, // For ordering questions
        items: null // For sorting questions
      };

      continue;
    }

    // Detect options: "A)", "a)", "(A)", "A -", "a.", "A.", "A:", "A-"
    const optionMatch = line.match(/^([a-dA-D])[\)]\s*(.+)?/i) ||
                        line.match(/^\(([a-dA-D])\)\s*(.+)?/i) ||
                        line.match(/^([a-dA-D])\s*-\s*(.+)?/i) ||
                        line.match(/^([a-dA-D])\.\s*(.+)?/i) ||
                        line.match(/^([a-dA-D])\:\s*(.+)?/i) ||
                        line.match(/^([a-dA-D])\s+[:\-]\s*(.+)?/i);

    if (optionMatch && currentQuestion && currentQuestion.type !== 'match' && currentQuestion.type !== 'blank') {
      const optionLetter = optionMatch[1].toUpperCase();
      const optionIndex = ['A', 'B', 'C', 'D'].indexOf(optionLetter);

      if (optionIndex !== -1 && optionIndex < 4) {
        currentQuestion.options[optionIndex] = optionMatch[2] || '';
      }
      continue;
    }

    // Detect matching pairs: "Paris - France" or "Paris: France"
    if (currentQuestion && currentQuestion.type === 'match') {
      const pairMatch = line.match(/^([^-:]+)\s*[-:]\s*(.+)$/);
      if (pairMatch) {
        currentQuestion.pairs = currentQuestion.pairs || [];
        currentQuestion.pairs.push({ left: pairMatch[1].trim(), right: pairMatch[2].trim() });
      }
      continue;
    }

    // If we have a question and this line doesn't match any pattern,
    // it might be continuation of the question text (more permissive)
    if (currentQuestion && !questionMatch && !optionMatch && !answerKeyMode) {
      // Skip lines that look like new sections or headers
      const isHeader = /^(section|chapter|part|unit|page)\s*\d*/i.test(line);
      const isEmpty = line.trim().length === 0;

      if (!isHeader && !isEmpty && !/^\d+/.test(line) && !/^answer/i.test(line.toLowerCase())) {
        if (currentQuestion.question) {
          // Append with proper spacing
          currentQuestion.question += (currentQuestion.question.endsWith('.') || currentQuestion.question.endsWith('?') ? ' ' : ' ') + line;
        } else {
          currentQuestion.question = line;
        }
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && (currentQuestion.question.trim() || currentQuestion.options.some(o => o?.trim()))) {
    // Detect and set question type
    currentQuestion.type = detectQuestionType(currentQuestion.question, currentQuestion.options);
    if (currentParagraph && currentQuestion.type === 'comprehension') {
      currentQuestion.paragraph = currentParagraph;
    }
    questions.push(currentQuestion);
  }

  // Filter out questions without question text
  const validQuestions = questions.filter(q => q.question?.trim());

  // Post-process for special question types
  validQuestions.forEach(q => {
    // For ordering questions, parse the sentence parts
    if (q.type === 'ordering') {
      const parts = q.question.match(/"([^"]+)"/g);
      if (parts) {
        q.sentenceParts = parts.map(p => p.replace(/"/g, '')).reverse(); // Reverse for ordering
        q.question = q.question.replace(/"[^"]+"/g, '').trim() || 'Put the following in order:';
      }
    }

    // For sorting questions, extract items
    if (q.type === 'sorting') {
      const items = q.question.match(/"([^"]+)"/g);
      if (items) {
        q.items = items.map(p => p.replace(/"/g, ''));
        q.question = q.question.replace(/"[^"]+"/g, '').trim() || 'Sort the following items:';
      }
    }

    // For fill-in-blank, count blanks
    if (q.type === 'blank') {
      q.blankCount = (q.question.match(/\[blank\]|___/gi) || []).length;
    }
  });

  return validQuestions;
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
        setError('No questions found. Please ensure your file follows one of these formats:\n\n' +
                 'MULTIPLE CHOICE:\n' +
                 '1. What is the capital of France?\n' +
                 'A) London\nB) Paris\nC) Berlin\nD) Madrid\n\n' +
                 'FILL IN THE BLANKS:\n' +
                 '1. The capital of France is ___.\n' +
                 '2. The ___ is the largest planet.\n\n' +
                 'MATCHING:\n' +
                 '1. Match the following:\n' +
                 'Paris - France\nLondon - England\n\n' +
                 'TRUE/FALSE:\n' +
                 '1. Paris is the capital of France. (True/False)\n\n' +
                 'NUMERIC:\n' +
                 '1. Calculate 5 + 3.\n\n' +
                 'ORDERING:\n' +
                 '1. Put in order: "first", "second", "third"\n\n' +
                 'SORTING:\n' +
                 '1. Sort: "cat", "dog", "bird"\n\n' +
                 'Note: PDF files must contain selectable text.');
      } else {
        setFile(uploadedFile);
        setEditingQuestions(questions.map(q => ({
          ...q,
          type: q.type || 'choice',
          options: q.options && q.options.length > 0
            ? q.options.slice(0, 4).concat(Array(Math.max(0, 4 - q.options.length)).fill(''))
            : ['', '', '', ''],
          pairs: q.pairs || [],
          sentenceParts: q.sentenceParts || [],
          items: q.items || [],
          blankCount: q.blankCount || 1,
          correct: q.correct !== undefined ? q.correct : 0
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
    // Auto-detect type if not set
    if (field === 'question' && !updated[index].type) {
      updated[index].type = detectQuestionType(value, updated[index].options);
    }
    setEditingQuestions(updated);
  };

  // Update option
  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...editingQuestions];
    updated[questionIndex].options[optionIndex] = value;
    setEditingQuestions(updated);
  };

  // Update matching pair
  const updatePair = (questionIndex, pairIndex, side, value) => {
    const updated = [...editingQuestions];
    updated[questionIndex].pairs[pairIndex][side] = value;
    setEditingQuestions(updated);
  };

  // Update sentence part (for ordering)
  const updateSentencePart = (questionIndex, partIndex, value) => {
    const updated = [...editingQuestions];
    updated[questionIndex].sentenceParts[partIndex] = value;
    setEditingQuestions(updated);
  };

  // Update item (for sorting)
  const updateItem = (questionIndex, itemIndex, value) => {
    const updated = [...editingQuestions];
    updated[questionIndex].items[itemIndex] = value;
    setEditingQuestions(updated);
  };

  // Add matching pair
  const addPair = (questionIndex) => {
    const updated = [...editingQuestions];
    updated[questionIndex].pairs.push({ left: '', right: '' });
    setEditingQuestions(updated);
  };

  // Remove matching pair
  const removePair = (questionIndex, pairIndex) => {
    const updated = [...editingQuestions];
    updated[questionIndex].pairs = updated[questionIndex].pairs.filter((_, i) => i !== pairIndex);
    setEditingQuestions(updated);
  };

  // Add sentence part (for ordering)
  const addSentencePart = (questionIndex) => {
    const updated = [...editingQuestions];
    updated[questionIndex].sentenceParts.push('');
    setEditingQuestions(updated);
  };

  // Remove sentence part
  const removeSentencePart = (questionIndex, partIndex) => {
    const updated = [...editingQuestions];
    updated[questionIndex].sentenceParts = updated[questionIndex].sentenceParts.filter((_, i) => i !== partIndex);
    setEditingQuestions(updated);
  };

  // Add item (for sorting)
  const addItem = (questionIndex) => {
    const updated = [...editingQuestions];
    updated[questionIndex].items.push('');
    setEditingQuestions(updated);
  };

  // Remove item
  const removeItem = (questionIndex, itemIndex) => {
    const updated = [...editingQuestions];
    updated[questionIndex].items = updated[questionIndex].items.filter((_, i) => i !== itemIndex);
    setEditingQuestions(updated);
  };

  // Change question type
  const changeQuestionType = (index, newType) => {
    const updated = [...editingQuestions];
    updated[index].type = newType;
    // Initialize type-specific fields
    if (newType === 'match' && !updated[index].pairs) {
      updated[index].pairs = [{ left: '', right: '' }];
    }
    if (newType === 'ordering' && !updated[index].sentenceParts) {
      updated[index].sentenceParts = ['', '', ''];
    }
    if (newType === 'sorting' && !updated[index].items) {
      updated[index].items = ['', '', ''];
    }
    if (newType === 'truefalse') {
      updated[index].options = ['True', 'False'];
      updated[index].correct = 'true';
    }
    setEditingQuestions(updated);
  };

  // Add new question
  const addQuestion = (type = 'choice') => {
    const newQuestion = {
      id: Date.now(),
      type: type,
      question: '',
      options: type === 'truefalse' ? ['True', 'False'] : ['', '', '', ''],
      correct: type === 'truefalse' ? 'true' : 0,
      pairs: type === 'match' ? [{ left: '', right: '' }] : [],
      sentenceParts: type === 'ordering' ? ['', '', ''] : [],
      items: type === 'sorting' ? ['', '', ''] : [],
      blankCount: type === 'blank' ? 1 : 0
    };
    setEditingQuestions([...editingQuestions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (index) => {
    const updated = editingQuestions.filter((_, i) => i !== index);
    setEditingQuestions(updated);
  };

  // Validate question based on type
  const isQuestionValid = (q) => {
    if (!q.question?.trim()) return false;

    switch (q.type) {
      case 'choice':
        return q.options.filter(o => o?.trim()).length >= 2 && q.options[q.correct]?.trim();
      case 'blank':
        return q.blankCount > 0;
      case 'match':
        return q.pairs && q.pairs.filter(p => p.left?.trim() && p.right?.trim()).length >= 2;
      case 'comprehension':
        return true;
      case 'truefalse':
        return q.correct === 'true' || q.correct === 'false';
      case 'numeric':
        return !isNaN(q.correct);
      case 'ordering':
        return q.sentenceParts && q.sentenceParts.filter(p => p?.trim()).length >= 2;
      case 'sorting':
        return q.items && q.items.filter(i => i?.trim()).length >= 2;
      default:
        return true;
    }
  };

  // Get valid questions count
  const validQuestionsCount = editingQuestions.filter(q => isQuestionValid(q)).length;

  // Handle assign to students
  const handleAssign = () => {
    setError(null);
    setSuccess(null);

    if (validQuestionsCount === 0) {
      setError('Please add at least one valid question.');
      return;
    }
    const validQuestions = editingQuestions.filter(q => isQuestionValid(q));
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
      setError('Please add at least one valid question.');
      return;
    }
    const validQuestions = editingQuestions.filter(q => isQuestionValid(q));
    onPlayNow && onPlayNow(validQuestions);
  };

  // Render question type selector
  const renderQuestionTypeSelector = (q, index) => (
    <select
      value={q.type}
      onChange={(e) => changeQuestionType(index, e.target.value)}
      style={{
        padding: '6px 10px',
        fontSize: '12px',
        fontWeight: '700',
        border: '2px solid #E5E7EB',
        borderRadius: '6px',
        background: '#fff',
        color: '#374151',
        cursor: 'pointer'
      }}
    >
      {Object.entries(QUESTION_TYPES).map(([key, config]) => (
        <option key={key} value={key}>{config.icon} {config.label}</option>
      ))}
    </select>
  );

  // Render question input based on type
  const renderQuestionContent = (q, index) => {
    switch (q.type) {
      case 'choice':
        return (
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
        );

      case 'blank':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <label>Number of blanks:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={q.blankCount || 1}
                onChange={(e) => updateQuestion(index, 'blankCount', parseInt(e.target.value) || 1)}
                style={{
                  width: '60px',
                  padding: '6px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>(Use [blank] or ___ in question)</span>
            </div>
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              placeholder="Enter your sentence with [blank] or ___ for each blank..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '80px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            <input
              type="text"
              value={q.correct || ''}
              onChange={(e) => updateQuestion(index, 'correct', e.target.value)}
              placeholder="Correct answer(s), separated by commas"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
        );

      case 'match':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.pairs?.map((pair, pairIndex) => (
              <div key={pairIndex} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => updatePair(index, pairIndex, 'left', e.target.value)}
                  placeholder="Left item"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '18px', color: '#9ca3af' }}>=</span>
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => updatePair(index, pairIndex, 'right', e.target.value)}
                  placeholder="Right item"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => removePair(index, pairIndex)}
                  style={{
                    padding: '8px',
                    background: '#fee2e2',
                    border: 'none',
                    color: '#dc2626',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addPair(index)}
              style={{
                padding: '10px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#f3f4f6',
                color: '#374151',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Add Pair
            </button>
          </div>
        );

      case 'comprehension':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={q.paragraph || ''}
              onChange={(e) => updateQuestion(index, 'paragraph', e.target.value)}
              placeholder="Enter the story or passage here..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '100px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                background: '#f8fafc'
              }}
            />
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              placeholder="Enter your comprehension question..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '60px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            <textarea
              value={q.correct || ''}
              onChange={(e) => updateQuestion(index, 'correct', e.target.value)}
              placeholder="Correct answer or key points..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '50px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>
        );

      case 'truefalse':
        return (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => updateQuestion(index, 'correct', 'true')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: q.correct === 'true' ? '#4CAF50' : '#E2E8F0',
                background: q.correct === 'true' ? '#E8F5E9' : '#fff',
                color: q.correct === 'true' ? '#4CAF50' : '#64748B',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ✓ True
            </button>
            <button
              onClick={() => updateQuestion(index, 'correct', 'false')}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: q.correct === 'false' ? '#EF4444' : '#E2E8F0',
                background: q.correct === 'false' ? '#FEF2F2' : '#fff',
                color: q.correct === 'false' ? '#EF4444' : '#64748B',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ✗ False
            </button>
          </div>
        );

      case 'numeric':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              placeholder="Enter your numeric question..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '60px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
            <input
              type="number"
              value={q.correct !== undefined ? q.correct : ''}
              onChange={(e) => updateQuestion(index, 'correct', parseFloat(e.target.value))}
              placeholder="Correct answer (numeric)"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
        );

      case 'ordering':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Students will order these parts (1, 2, 3...)
            </div>
            {q.sentenceParts?.map((part, partIndex) => (
              <div key={partIndex} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {partIndex + 1}
                </span>
                <input
                  type="text"
                  value={part}
                  onChange={(e) => updateSentencePart(index, partIndex, e.target.value)}
                  placeholder={`Part ${partIndex + 1}`}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => removeSentencePart(index, partIndex)}
                  style={{
                    padding: '6px',
                    background: '#fee2e2',
                    border: 'none',
                    color: '#dc2626',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addSentencePart(index)}
              style={{
                padding: '10px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#f3f4f6',
                color: '#374151',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Add Part
            </button>
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              placeholder="Instructions for ordering..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>
        );

      case 'sorting':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Students will sort these items into categories
            </div>
            {q.items?.map((item, itemIndex) => (
              <div key={itemIndex} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '18px' }}>•</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(index, itemIndex, e.target.value)}
                  placeholder={`Item ${itemIndex + 1}`}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => removeItem(index, itemIndex)}
                  style={{
                    padding: '6px',
                    background: '#fee2e2',
                    border: 'none',
                    color: '#dc2626',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addItem(index)}
              style={{
                padding: '10px',
                fontSize: '14px',
                fontWeight: '600',
                background: '#f3f4f6',
                color: '#374151',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              Add Item
            </button>
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(index, 'question', e.target.value)}
              placeholder="Instructions for sorting (e.g., 'Sort into mammals and reptiles')..."
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>
        );

      default:
        return null;
    }
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
              📋 Supported Question Types:
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              background: '#f9fafb',
              padding: '12px',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              lineHeight: '1.6'
            }}>
              <div><strong>📝 Multiple Choice:</strong></div>
              <div style={{ marginLeft: '16px' }}>1. What is the capital of France?<br/>A) London B) Paris C) Berlin D) Madrid</div>
              <br/>
              <div><strong>✏️ Fill in the Blanks:</strong></div>
              <div style={{ marginLeft: '16px' }}>1. The capital of France is ___.<br/>2. The ___ is the largest planet.</div>
              <br/>
              <div><strong>🔗 Matching:</strong></div>
              <div style={{ marginLeft: '16px' }}>1. Match: Paris - France, London - England</div>
              <br/>
              <div><strong>✓✗ True/False:</strong></div>
              <div style={{ marginLeft: '16px' }}>1. Paris is the capital of France. (True/False)</div>
              <br/>
              <div><strong>🔢 Numeric:</strong></div>
              <div style={{ marginLeft: '16px' }}>1. Calculate 5 + 3.</div>
              <br/>
              <div><strong>📖 Story/Comprehension:</strong></div>
              <div style={{ marginLeft: '16px' }}>Story: Once upon a time...<br/>1. What happened in the story?</div>
            </div>
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
              border: `2px solid ${isQuestionValid(q) ? '#e5e7eb' : '#fca5a5'}`
            }}>
              {/* Question Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  {renderQuestionTypeSelector(q, index)}
                  {isQuestionValid(q) ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <AlertCircle size={18} color="#f59e0b" />
                  )}
                </div>
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

              {/* Question Content based on type */}
              {q.type !== 'choice' && q.type !== 'blank' && q.type !== 'match' && q.type !== 'truefalse' && (
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
              )}

              {/* Type-specific content */}
              {renderQuestionContent(q, index)}
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <select
            id="new-question-type"
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              background: '#fff',
              color: '#374151',
              cursor: 'pointer',
              flex: '1',
              minWidth: '200px'
            }}
          >
            {Object.entries(QUESTION_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.icon} {config.label}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const type = document.getElementById('new-question-type').value;
              addQuestion(type);
            }}
            style={{
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '700',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Plus size={20} />
            Add Question
          </button>
        </div>

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
