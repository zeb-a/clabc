// documentExtraction removed — nothing to do here. If any code still imports
// `extractTextFromFile`, this stub will throw so the missing import is visible
// during development. Use the paste-table workflow instead.

export async function extractTextFromFile() {
  throw new Error('documentExtraction: removed. Use paste import flow only.');
}

/**
 * Extract text from DOCX file
 * @param {File} file - DOCX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromDOCX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = await extractDOCXText(e.target.result);
        resolve(text);
      } catch (error) {
        reject(new Error('Failed to extract text from DOCX file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read DOCX file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from DOCX by parsing the XML structure
 */
async function extractDOCXText(arrayBuffer) {
  // DOCX files are ZIP archives containing XML
  // For a proper implementation, you'd use a library like mammoth.js
  // Here's a basic implementation
  try {
    // Try to extract text by looking for readable content
    const decoder = new TextDecoder('utf-8');
    const content = decoder.decode(arrayBuffer);
    
    // Very basic extraction - look for text between common XML tags
    // This is not production-quality but works for simple cases
    const textMatches = content.match(/>[^<]+</g);
    if (textMatches) {
      const text = textMatches
        .map(match => match.slice(1, -1).trim())
        .filter(text => text.length > 0)
        .join('\n');
      
      if (text.length > 50) {
        return text;
      }
    }
    
    throw new Error('Could not extract meaningful text from DOCX');
  } catch (error) {
    throw new Error('DOCX extraction requires additional library installation. Please use TXT files or copy-paste the content directly.');
  }
}

/**
 * Extract text from RTF file
 * @param {File} file - RTF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromRTF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;

        // Check if it's a valid RTF file
        if (!content.match(/^\{\\rtf/i)) {
          reject(new Error('Invalid RTF file format.'));
          return;
        }

        // Extract text content from RTF
        let text = content;

        // Remove all control words (starts with backslash)
        text = text.replace(/\\[a-zA-Z]+\d*/g, '');

        // Remove hex-encoded characters
        text = text.replace(/\\'[0-9a-fA-F]{2}/g, '');

        // Remove unicode characters
        text = text.replace(/\\u\d+\?/g, '');

        // Remove braces
        text = text.replace(/[{}]/g, '');

        // Handle remaining special characters (those escaped with backslash before we removed all backslash commands)
        text = text
          .replace(/par/g, '\n')
          .replace(/line/g, '\n')
          .replace(/tab/g, '\t')
          .replace(/~ /g, ' ')
          .replace(/\-/g, '–')
          .replace(/—/g, '—')
          .replace(/•/g, '•')
          .replace(/ldblquote/g, '"')
          .replace(/rdblquote/g, '"')
          .replace(/lquote/g, "'")
          .replace(/rquote/g, "'")
          .replace(/bullet/g, '•')
          .replace(/emdash/g, '—')
          .replace(/endash/g, '–');

        // Clean up whitespace
        text = text
          .replace(/;+/g, ' ')  // Remove extra semicolons
          .replace(/\s+/g, ' ')  // Collapse multiple spaces
          .replace(/ \n /g, '\n')  // Clean up newlines
          .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
          .trim();

        if (text.length < 10) {
          reject(new Error('Could not extract meaningful text from RTF file.'));
          return;
        }

        resolve(text);
      } catch (error) {
        console.error('RTF extraction error:', error);
        reject(new Error('Failed to extract text from RTF file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read RTF file'));
    reader.readAsText(file);
  });
}

/**
 * Extract text from CSV file
 * @param {File} file - CSV file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = () => reject(new Error('Failed to read CSV file'));
    reader.readAsText(file);
  });
}

/**
 * Extract text from plain text file
 * @param {File} file - Text file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
}

/**
 * Parse extracted text into structured format for table rows
 * @param {string} text - Extracted text
 * @param {number} rowCount - Number of rows to populate
 * @returns {Array} - Array of text segments for each row
 */
export function parseTextForRows(text, rowCount) {
  if (!text || rowCount <= 0) return [];

  // Split text by common delimiters
  const delimiters = [/\n\n+/, /\n+/];
  let segments = [text];

  for (const delimiter of delimiters) {
    segments = segments.flatMap(seg => seg.split(delimiter).filter(s => s.trim()));
    if (segments.length >= rowCount) break;
  }

  // If we have fewer segments than rows, distribute the text evenly
  if (segments.length < rowCount) {
    const result = new Array(rowCount).fill('');
    const segmentLength = Math.ceil(segments.length / rowCount);
    
    segments.forEach((seg, i) => {
      const rowIndex = Math.floor(i / segmentLength);
      if (result[rowIndex]) {
        result[rowIndex] += '\n' + seg.trim();
      } else {
        result[rowIndex] = seg.trim();
      }
    });
    
    return result;
  }

  // If we have more segments than rows, combine some
  const result = segments.slice(0, rowCount);
  if (segments.length > rowCount) {
    const extra = segments.slice(rowCount).join(' ');
    result[rowCount - 1] += '\n' + extra;
  }

  return result.map(s => s.trim());
}

/**
 * Clean and format extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
export function cleanExtractedText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Detect if text contains a tabular structure (CSV/TSV format)
 * @param {string} text - Extracted text
 * @returns {boolean} - True if text appears to be tabular
 */
export function detectTableStructure(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return false;

  // Priority 1: Check for tabs (most reliable for PDF extraction)
  const tabCount = lines[0].split('\t').length - 1;
  if (tabCount >= 2) {
    // Check if most lines have similar tab count
    const consistentTabLines = lines.slice(0, Math.min(5, lines.length)).filter(line => {
      const lineTabs = line.split('\t').length - 1;
      return Math.abs(lineTabs - tabCount) <= 1;
    });
    if (consistentTabLines.length >= lines.slice(0, 5).length * 0.5) {
      return true;
    }
  }

  // Priority 2: Check for consistent delimiter usage (comma or pipe)
  const delimiters = [',', '|'];
  for (const delim of delimiters) {
    const counts = lines.slice(0, 5).map(line => (line.match(new RegExp(`\\${delim}`, 'g')) || []).length);
    const uniqueCounts = new Set(counts);
    if (uniqueCounts.size === 1 && counts[0] > 0) {
      return true;
    }
  }

  // Priority 3: Check for columnar spacing patterns (multiple consecutive spaces suggest columns)
  const sampleLines = lines.slice(0, 5);
  let multipleSpaceCount = 0;

  for (const line of sampleLines) {
    // Check for 2+ consecutive spaces appearing multiple times (lowered from 3+)
    const matches = line.match(/ {2,}/g);
    if (matches && matches.length >= 1) {  // Lowered from 2 to 1
      multipleSpaceCount++;
    }
  }

  // If any sample lines have columnar spacing, treat as a table (lowered threshold)
  if (multipleSpaceCount >= Math.max(1, Math.ceil(sampleLines.length * 0.3))) {
    return true;
  }

  return false;
}

/**
 * Parse tabular text (CSV/TSV/Space-delimited) into structured data
 * @param {string} text - Tabular text content
 * @returns {Object} - Parsed table with headers and rows
 */
export function parseTableFromText(text) {
  const lines = text.trim().split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error('Not enough lines to form a table');
  }

  // Detect delimiter
  const firstLine = lines[0];
  let delimiter = '\t';
  let useRegex = false;

  if (firstLine.includes(',') && !firstLine.includes('\t')) {
    delimiter = ',';
  } else if (firstLine.includes('|') && !firstLine.includes('\t') && !firstLine.includes(',')) {
    delimiter = '|';
  } else if (!firstLine.includes('\t') && !firstLine.includes(',') && !firstLine.includes('|')) {
    // Use columnar spacing (3+ consecutive spaces)
    delimiter = /\s{3,}/;
    useRegex = true;
  }

  // Parse header row
  const headerRow = useRegex
    ? firstLine.split(delimiter).map(s => s.trim())
    : parseCSVLine(firstLine, delimiter);

  // Parse data rows
  const dataRows = lines.slice(1).map(line =>
    useRegex
      ? line.split(delimiter).map(s => s.trim())
      : parseCSVLine(line, delimiter)
  );

  return {
    headers: headerRow,
    rows: dataRows
  };
}

/**
 * Parse a single CSV/TSV line, handling quoted values
 * @param {string} line - Line to parse
 * @param {string} delimiter - Delimiter character
 * @returns {Array} - Array of cell values
 */
function parseCSVLine(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Convert parsed table data to lesson plan format
 * @param {Object} tableData - Parsed table with headers and rows
 * @param {string} periodType - Period type (daily, weekly, monthly, yearly)
 * @returns {Object} - Lesson plan data structure
 */
export function convertTableToLessonPlan(tableData, periodType) {
  const { headers, rows } = tableData;
  
  // Identify row label column (first column or column containing 'day', 'phase', 'section', 'stage')
  let rowLabelIndex = 0;
  const rowLabelKeywords = ['day', 'phase', 'section', 'stage'];
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    if (rowLabelKeywords.some(keyword => header.includes(keyword))) {
      rowLabelIndex = i;
      break;
    }
  }

  // Build column mapping
  const columnMapping = {};
  headers.forEach((header, index) => {
    if (index !== rowLabelIndex) {
      const key = header.toLowerCase().replace(/\s+/g, '');
      columnMapping[key] = index;
    }
  });

  // Determine row label key based on period
  const rowLabelKey = periodType === 'daily' ? 'stage' :
                     periodType === 'weekly' ? 'day' :
                     periodType === 'monthly' ? 'phase' : 'section';

  // Build rows data
  const planRows = rows.map(row => ({
    [rowLabelKey]: row[rowLabelIndex] || '',
    ...Object.fromEntries(
      Object.entries(columnMapping).map(([key, index]) => [
        key,
        row[index] || ''
      ])
    )
  }));

  // Build custom columns (excluding default columns)
  const defaultColumnKeys = ['focus', 'languagetarget', 'assessment', 'teacheractions', 'studentactions'];
  const customColumns = headers
    .filter((_, index) => index !== rowLabelIndex)
    .filter(header => {
      const key = header.toLowerCase().replace(/\s+/g, '');
      return !defaultColumnKeys.includes(key);
    })
    .map(header => ({
      key: header.toLowerCase().replace(/\s+/g, ''),
      label: header,
      placeholder: ''
    }));

  return {
    rows: planRows,
    customColumns
  };
}
