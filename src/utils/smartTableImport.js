/**
 * Smart Table Import Utility
 * Handles intelligent merging of table data based on header matching
 * Supports column and row header matching with flexible update strategies
 */

/**
 * Normalize a string for comparison (case-insensitive, trimmed, whitespace removed)
 * @param {string} str - String to normalize
 * @returns {string} - Normalized string
 */
function normalizeString(str) {
    if (!str) return '';
    return String(str).toLowerCase().trim().replace(/\s+/g, '');
  }
  
  /**
   * Calculate similarity between two strings using simple matching
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Similarity score (0-1, higher is better)
   */
  function calculateSimilarity(str1, str2) {
    const s1 = normalizeString(str1);
    const s2 = normalizeString(str2);
  
    // Exact match
    if (s1 === s2) return 1;
  
    // One contains the other
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
    // Check for partial match (at least 50% overlap)
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length < s2.length ? s2 : s1;
  
    let matchCount = 0;
    for (let i = 0; i <= shorter.length; i++) {
      if (longer.includes(shorter.substring(0, i))) {
        matchCount = i;
      }
    }
  
    const similarity = matchCount / shorter.length;
    return similarity >= 0.5 ? similarity : 0;
  }
  
  /**
   * Find the best matching header from existing headers
   * @param {string} newHeader - Header to match
   * @param {Array<string>} existingHeaders - Existing headers to search
   * @param {number} threshold - Minimum similarity threshold (0-1)
   * @returns {Object} - Match result { found: boolean, match: string|null, score: number }
   */
  function findMatchingHeader(newHeader, existingHeaders, threshold = 0.7) {
    let bestMatch = null;
    let bestScore = 0;
  
    for (const existingHeader of existingHeaders) {
      const score = calculateSimilarity(newHeader, existingHeader);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = existingHeader;
      }
    }
  
    return {
      found: bestMatch !== null,
      match: bestMatch,
      score: bestScore
    };
  }
  
  /**
   * Create a mapping from new headers to existing headers
   * @param {Array<string>} newHeaders - Headers from imported data
   * @param {Array<string>} existingHeaders - Existing table headers
   * @returns {Map} - Mapping of newHeaderIndex -> existingHeaderKey (or null if no match)
   */
  function createHeaderMapping(newHeaders, existingHeaders) {
    const mapping = new Map();
    const usedExistingHeaders = new Set();
  
    // First pass: exact matches
    newHeaders.forEach((newHeader, index) => {
      const normalized = normalizeString(newHeader);
      const exactMatch = existingHeaders.find(h => normalizeString(h) === normalized);
  
      if (exactMatch && !usedExistingHeaders.has(exactMatch)) {
        mapping.set(index, exactMatch);
        usedExistingHeaders.add(exactMatch);
      }
    });
  
    // Second pass: fuzzy matches for remaining
    newHeaders.forEach((newHeader, index) => {
      if (mapping.has(index)) return; // Already matched
  
      const availableHeaders = existingHeaders.filter(h => !usedExistingHeaders.has(h));
      const matchResult = findMatchingHeader(newHeader, availableHeaders);
  
      if (matchResult.found) {
        mapping.set(index, matchResult.match);
        usedExistingHeaders.add(matchResult.match);
      } else {
        mapping.set(index, null); // No match, will create new column
      }
    });
  
    return mapping;
  }
  
  /**
   * Build new custom columns from headers that don't match existing ones
   * @param {Array<string>} newHeaders - Headers from imported data
   * @param {Map} headerMapping - Header mapping
   * @param {Object} existingColumnLabels - Existing column labels
   * @param {Object} existingCustomColumns - Existing custom columns
   * @returns {Array} - New custom columns to add
   */
  function buildNewCustomColumns(newHeaders, headerMapping, existingColumnLabels, existingCustomColumns) {
    const newColumns = [];
    const allExistingKeys = [
      ...Object.keys(existingColumnLabels),
      ...existingCustomColumns.map(c => c.key)
    ];
  
    newHeaders.forEach((header, index) => {
      const mappedKey = headerMapping.get(index);
      if (!mappedKey) {
        // This header doesn't match any existing column
        const key = normalizeString(header);
        if (!allExistingKeys.includes(key) && key) {
          newColumns.push({
            key,
            label: header,
            placeholder: ''
          });
        }
      }
    });
  
    return newColumns;
  }
  
  /**
   * Merge column labels with new headers
   * @param {Object} existingColumnLabels - Existing column labels
   * @param {Map} headerMapping - Header mapping
   * @param {Array<string>} newHeaders - Headers from imported data
   * @param {Object} existingColumnWidths - Existing column widths
   * @returns {Object} - Merged column labels
   */
  function mergeColumnLabels(existingColumnLabels, headerMapping, newHeaders, existingColumnWidths) {
    const merged = { ...existingColumnLabels };
  
    // For each new header, if it maps to an existing key, update the label
    newHeaders.forEach((header, index) => {
      const existingKey = headerMapping.get(index);
      if (existingKey && existingColumnLabels[existingKey]) {
        // Keep existing label, don't update it
        // Or optionally update: merged[existingKey] = header;
      }
    });
  
    return merged;
  }
  
  /**
   * Create a mapping from new row headers to existing row indices
   * @param {Array<Object>} existingRows - Existing rows
   * @param {string} rowLabelKey - Key for row labels (e.g., 'day', 'phase', 'section', 'stage')
   * @param {Array<Object>} newRows - New rows from imported data
   * @returns {Object} - Row mapping { rowLabel: existingRowIndex | null }
   */
  function createRowMapping(existingRows, rowLabelKey, newRows) {
    const mapping = {};
    const existingRowLabels = existingRows.map(row => normalizeString(row[rowLabelKey] || ''));
  
    newRows.forEach((newRow, index) => {
      const newRowLabel = normalizeString(newRow[rowLabelKey] || '');
  
      if (!newRowLabel) {
        mapping[index] = null;
        return;
      }
  
      // Find exact match first
      const exactMatchIndex = existingRowLabels.findIndex(label => label === newRowLabel);
      if (exactMatchIndex !== -1) {
        mapping[index] = exactMatchIndex;
        return;
      }
  
      // Find fuzzy match
      let bestMatchIndex = null;
      let bestScore = 0;
  
      existingRowLabels.forEach((existingLabel, idx) => {
        if (!existingLabel) return;
        const score = calculateSimilarity(newRowLabel, existingLabel);
        if (score > bestScore && score >= 0.7) {
          bestScore = score;
          bestMatchIndex = idx;
        }
      });
  
      mapping[index] = bestMatchIndex; // null if no match found
    });
  
    return mapping;
  }
  
  /**
   * Merge rows from new data with existing rows
   * @param {Array<Object>} existingRows - Existing rows
   * @param {Array<Object>} newRows - New rows from imported data
   * @param {Map} headerMapping - Column header mapping
   * @param {Array<string>} newHeaders - Headers from imported data
   * @param {string} rowLabelKey - Key for row labels
   * @param {Object} rowMapping - Row mapping
   * @param {string} rowLabelColumnKey - Key for the row label column in new data (usually first column)
   * @returns {Array} - Merged rows
   */
  function mergeRows(existingRows, newRows, headerMapping, newHeaders, rowLabelKey, rowMapping, rowLabelColumnKey) {
    const merged = [...existingRows];
  
    newRows.forEach((newRow, newIndex) => {
      const existingRowIndex = rowMapping[newIndex];
  
      if (existingRowIndex !== null && merged[existingRowIndex]) {
        // Update existing row
        newHeaders.forEach((header, colIndex) => {
          const existingKey = headerMapping.get(colIndex);
  
          if (existingKey) {
            // Update existing column
            merged[existingRowIndex][existingKey] = newRow[colIndex] || '';
          } else if (header !== rowLabelColumnKey) {
            // Add new column data (will be in new custom columns)
            const newKey = normalizeString(header);
            if (newKey) {
              merged[existingRowIndex][newKey] = newRow[colIndex] || '';
            }
          }
        });
      } else {
        // Add new row
        const newRowData = { [rowLabelKey]: newRow[rowLabelColumnKey] || '' };
  
        newHeaders.forEach((header, colIndex) => {
          if (header !== rowLabelColumnKey) {
            const existingKey = headerMapping.get(colIndex);
            const key = existingKey || normalizeString(header);
            if (key) {
              newRowData[key] = newRow[colIndex] || '';
            }
          }
        });
  
        merged.push(newRowData);
      }
    });
  
    return merged;
  }
  
  /**
   * Smart table import - merges data based on header matching
   * @param {Object} params - Import parameters
   * @param {Object} params.currentData - Current lesson plan data
   * @param {Object} params.tableData - Parsed table data with headers and rows
   * @param {string} params.periodType - Period type (daily, weekly, monthly, yearly)
   * @param {Object} params.defaultLabels - Default column labels for the period
   * @returns {Object} - Merged data structure
   */
  export function smartTableImport({
    currentData,
    tableData,
    periodType,
    defaultLabels
  }) {
    const { headers: newHeaders, rows: newRows } = tableData;
  
    // Determine row label key based on period
    const rowLabelKey = periodType === 'daily' ? 'stage' :
                       periodType === 'weekly' ? 'day' :
                       periodType === 'monthly' ? 'phase' : 'section';
  
    // Get existing data
    const existingRows = currentData.rows || [];
    const existingColumnLabels = currentData.columnLabels || { ...defaultLabels };
    const existingCustomColumns = currentData.customColumns || [];
    const existingColumnWidths = currentData.columnWidths || {};
  
    // Get all existing column keys (including custom columns)
    const allExistingHeaders = [
      ...Object.keys(existingColumnLabels),
      ...existingCustomColumns.map(c => c.key)
    ];
  
    // Identify the row label column in new data (first column or by keyword)
    let rowLabelColumnIndex = 0;
    const rowLabelKeywords = ['stage', 'day', 'phase', 'section'];
    for (let i = 0; i < newHeaders.length; i++) {
      const header = newHeaders[i].toLowerCase();
      if (rowLabelKeywords.some(keyword => header.includes(keyword))) {
        rowLabelColumnIndex = i;
        break;
      }
    }
    const rowLabelColumnKey = normalizeString(newHeaders[rowLabelColumnIndex]);
  
    // Create header mapping (new header index -> existing header key)
    const headerMapping = createHeaderMapping(newHeaders, allExistingHeaders);
  
    // Build new custom columns for unmatched headers
    const newCustomColumns = buildNewCustomColumns(
      newHeaders,
      headerMapping,
      existingColumnLabels,
      existingCustomColumns
    );
  
    // Merge column labels (preserve existing labels, don't append)
    const mergedColumnLabels = mergeColumnLabels(
      existingColumnLabels,
      headerMapping,
      newHeaders,
      existingColumnWidths
    );
  
    // Merge column widths (add default width for new columns)
    const mergedColumnWidths = { ...existingColumnWidths };
    newCustomColumns.forEach(col => {
      if (!mergedColumnWidths[col.key]) {
        mergedColumnWidths[col.key] = 200; // Default width
      }
    });
  
    // Create row mapping (new row index -> existing row index)
    const rowMapping = createRowMapping(existingRows, rowLabelKey, newRows);
  
    // Merge rows
    const mergedRows = mergeRows(
      existingRows,
      newRows,
      headerMapping,
      newHeaders,
      rowLabelKey,
      rowMapping,
      rowLabelColumnKey
    );
  
    // Combine existing and new custom columns
    const mergedCustomColumns = [...existingCustomColumns];
    newCustomColumns.forEach(newCol => {
      const exists = mergedCustomColumns.find(c => c.key === newCol.key);
      if (!exists) {
        mergedCustomColumns.push(newCol);
      }
    });
  
    return {
      rows: mergedRows,
      columnLabels: mergedColumnLabels,
      columnWidths: mergedColumnWidths,
      customColumns: mergedCustomColumns
    };
  }
  
  /**
   * Completely replace table with new data (alternative to smart merge)
   * @param {Object} params - Replace parameters
   * @param {Object} params.tableData - Parsed table data with headers and rows
   * @param {string} params.periodType - Period type (daily, weekly, monthly, yearly)
   * @param {Object} params.defaultLabels - Default column labels
   * @returns {Object} - New data structure
   */
  export function replaceTableWithNew({
    tableData,
    periodType,
    defaultLabels
  }) {
    const { headers: newHeaders, rows: newRows } = tableData;
  
    // Determine row label key
    const rowLabelKey = periodType === 'daily' ? 'stage' :
                       periodType === 'weekly' ? 'day' :
                       periodType === 'monthly' ? 'phase' : 'section';
  
    // Identify row label column
    let rowLabelColumnIndex = 0;
    const rowLabelKeywords = ['stage', 'day', 'phase', 'section'];
    for (let i = 0; i < newHeaders.length; i++) {
      const header = newHeaders[i].toLowerCase();
      if (rowLabelKeywords.some(keyword => header.includes(keyword))) {
        rowLabelColumnIndex = i;
        break;
      }
    }
  
    const rowLabelColumnKey = normalizeString(newHeaders[rowLabelColumnIndex]);
  
    // Build column labels (preserve default structure where possible)
    const columnLabels = { ...defaultLabels };
    const customColumns = [];
    const columnWidths = {};
  
    // Process headers
    newHeaders.forEach((header, index) => {
      if (index === rowLabelColumnIndex) {
        columnLabels[rowLabelKey] = header;
        columnWidths[rowLabelKey] = 150;
      } else {
        const key = normalizeString(header);
        const isDefault = ['focus', 'languagetarget', 'assessment', 'teacheractions', 'studentactions'].includes(key);
  
        if (isDefault) {
          columnLabels[key] = header;
          columnWidths[key] = 200;
        } else {
          customColumns.push({
            key,
            label: header,
            placeholder: ''
          });
          columnWidths[key] = 200;
        }
      }
    });
  
    // Build rows
    const rows = newRows.map(rowData => {
      const row = { [rowLabelKey]: rowData[rowLabelColumnIndex] || '' };
  
      newHeaders.forEach((header, index) => {
        if (index !== rowLabelColumnIndex) {
          const key = normalizeString(header);
          row[key] = rowData[index] || '';
        }
      });
  
      return row;
    });
  
    return {
      rows,
      columnLabels,
      columnWidths,
      customColumns
    };
  }
  
  /**
   * Generate import report showing what will be merged
   * @param {Object} params - Report parameters
   * @param {Object} params.currentData - Current lesson plan data
   * @param {Object} params.tableData - Parsed table data
   * @param {string} params.periodType - Period type
   * @param {Object} params.defaultLabels - Default column labels
   * @returns {Object} - Import report
   */
  export function generateImportReport({
    currentData,
    tableData,
    periodType,
    defaultLabels
  }) {
    const { headers: newHeaders, rows: newRows } = tableData;
  
    const existingRows = currentData.rows || [];
    const existingColumnLabels = currentData.columnLabels || { ...defaultLabels };
    const existingCustomColumns = currentData.customColumns || [];
    const allExistingHeaders = [
      ...Object.keys(existingColumnLabels),
      ...existingCustomColumns.map(c => c.key)
    ];
  
    const rowLabelKey = periodType === 'daily' ? 'stage' :
                       periodType === 'weekly' ? 'day' :
                       periodType === 'monthly' ? 'phase' : 'section';
  
    // Column analysis
    const matchedColumns = [];
    const newColumns = [];
    const headerMapping = createHeaderMapping(newHeaders, allExistingHeaders);
  
    newHeaders.forEach((header, index) => {
      const existingKey = headerMapping.get(index);
      if (existingKey) {
        matchedColumns.push({ new: header, existing: existingKey });
      } else if (header.toLowerCase().replace(/\s+/g, '') !== rowLabelKey) {
        newColumns.push(header);
      }
    });
  
    // Row analysis
    const rowMapping = createRowMapping(existingRows, rowLabelKey, newRows);
    const updatedRows = [];
    const addedRows = [];
  
    newRows.forEach((row, index) => {
      const existingIndex = rowMapping[index];
      const rowLabel = row[0] || '';
  
      if (existingIndex !== null) {
        updatedRows.push({
          label: rowLabel,
          existingLabel: existingRows[existingIndex]?.[rowLabelKey] || ''
        });
      } else if (rowLabel) {
        addedRows.push(rowLabel);
      }
    });
  
    return {
      totalNewColumns: newHeaders.length,
      matchedColumns: matchedColumns.length,
      newColumns: newColumns.length,
      matchedColumnDetails: matchedColumns,
      newColumnDetails: newColumns,
      totalNewRows: newRows.length,
      updatedRows: updatedRows.length,
      addedRows: addedRows.length,
      updatedRowDetails: updatedRows,
      addedRowDetails: addedRows
    };
  }
  