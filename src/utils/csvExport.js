/**
 * CSV Export Utility for Klasiz.fun
 * Safely exports data to CSV format without affecting existing functionality
 */

/**
 * Convert an array of objects to CSV string
 * @param {Array} data - Array of objects to export
 * @param {Object} options - Export options
 * @returns {string} CSV formatted string
 */
export function convertToCSV(data, options = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const {
    headers = null,
    delimiter = ',',
    includeTimestamp = true
  } = options;

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Build CSV rows
  const rows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      return formatCSVValue(value, delimiter);
    }).join(delimiter);
  });

  // Build header row
  const headerRow = csvHeaders.map(header => formatCSVValue(header, delimiter)).join(delimiter);

  // Add timestamp row if requested
  const timestampRow = includeTimestamp
    ? `Generated,${new Date().toISOString()}`
    : '';

  return [timestampRow, headerRow, ...rows].filter(Boolean).join('\n');
}

/**
 * Format a value for CSV (escape quotes and delimiters)
 * @param {*} value - Value to format
 * @param {string} delimiter - CSV delimiter
 * @returns {string} Formatted CSV value
 */
function formatCSVValue(value, delimiter = ',') {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains delimiter, quotes, or newlines, wrap in quotes and escape quotes
  if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Trigger download of CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name of file to download (without .csv extension)
 */
export function downloadCSV(csvContent, filename = 'export') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (navigator.msSaveBlob) {
    // For IE/Edge
    navigator.msSaveBlob(blob, `${filename}.csv`);
  } else {
    // For other browsers
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}

/**
 * Export data directly to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of file to download
 * @param {Object} options - Export options
 */
export function exportToCSV(data, filename, options = {}) {
  const csvContent = convertToCSV(data, options);
  downloadCSV(csvContent, filename);
}

// Pre-configured export functions for common data types

/**
 * Export student list to CSV
 * @param {Array} students - Student objects
 * @param {string} className - Class name for filename
 */
export function exportStudentList(students, className = 'students') {
  const data = students.map(student => ({
    'Student Name': student.name,
    'Student ID': student.id || '',
    'Student Code': student.code || '',
    'Parent Code': student.parentCode || '',
    'Points': student.points || 0
  }));

  exportToCSV(data, `${className}_student_list`, {
    headers: ['Student Name', 'Student ID', 'Student Code', 'Parent Code', 'Points']
  });
}

/**
 * Export class reports to CSV
 * @param {Array} reportData - Report data
 * @param {string} className - Class name for filename
 * @param {string} period - Period identifier (e.g., 'weekly', 'monthly')
 */
export function exportClassReport(reportData, className = 'class', period = 'report') {
  const data = reportData.map(item => ({
    'Student Name': item.name || '',
    'Total Points': item.points || 0,
    'Positive Behaviors': item.positive || 0,
    'Negative Behaviors': item.negative || 0,
    'Assignments Completed': item.assignments || 0,
    'Average Grade': item.grade || 'N/A'
  }));

  exportToCSV(data, `${className}_${period}_report`, {
    headers: ['Student Name', 'Total Points', 'Positive Behaviors', 'Negative Behaviors', 'Assignments Completed', 'Average Grade']
  });
}

/**
 * Export behavior log to CSV
 * @param {Array} behaviors - Behavior entries
 * @param {string} className - Class name for filename
 */
export function exportBehaviorLog(behaviors, className = 'class') {
  const data = behaviors.map(behavior => ({
    'Date': behavior.date || '',
    'Student Name': behavior.studentName || '',
    'Behavior': behavior.label || '',
    'Type': behavior.type || '',
    'Points': behavior.pts || 0,
    'Notes': behavior.notes || ''
  }));

  exportToCSV(data, `${className}_behavior_log`, {
    headers: ['Date', 'Student Name', 'Behavior', 'Type', 'Points', 'Notes']
  });
}

/**
 * Export assignment submissions to CSV
 * @param {Array} submissions - Submission objects
 * @param {string} assignmentTitle - Assignment title for filename
 */
export function exportSubmissions(submissions, assignmentTitle = 'assignment') {
  const data = submissions.map(sub => ({
    'Student Name': sub.studentName || '',
    'Student ID': sub.studentId || '',
    'Status': sub.status || 'submitted',
    'Grade': sub.grade || 0,
    'Submitted At': sub.submittedAt || '',
    'Answers': JSON.stringify(sub.answers || {}).substring(0, 200) // Truncate long answers
  }));

  exportToCSV(data, `${assignmentTitle}_submissions`, {
    headers: ['Student Name', 'Student ID', 'Status', 'Grade', 'Submitted At', 'Answers']
  });
}
