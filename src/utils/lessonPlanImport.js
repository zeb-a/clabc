// Utilities for importing lesson-plan-like tables (TSV/CSV/pasted text)
// Provides parsing and best-effort mapping to existing template structures.

function detectDelimiter(text) {
  if (text.indexOf('\t') !== -1) return '\t';
  // count commas vs semicolons
  const commaCount = (text.match(/,/g) || []).length;
  const semiCount = (text.match(/;/g) || []).length;
  return commaCount >= semiCount ? ',' : ';';
}

// Split a single line by delimiter while respecting quoted fields (basic CSV support)
function splitLineRespectingQuotes(line, delim) {
  if (delim === '\t') return line.split('\t').map(s => s.trim());

  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // escaped quote
        cur += '"';
        i++; // skip next
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delim) {
      fields.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  fields.push(cur.trim());
  return fields.map(f => {
    // remove surrounding quotes if present
    if (f.startsWith('"') && f.endsWith('"')) {
      return f.slice(1, -1).replace(/""/g, '"').trim();
    }
    return f;
  });
}

export function parseTableText(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00A0/g, ' ').replace(/\t+/, '\t').trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const delim = detectDelimiter(text);
  const headers = splitLineRespectingQuotes(lines[0], delim).map(h => h || '');
  const rows = lines.slice(1).map((line) => {
    const cols = splitLineRespectingQuotes(line, delim);
    const obj = {};
    headers.forEach((h, i) => (obj[h || `col${i}`] = (cols[i] || '').toString()));
    return obj;
  });
  return { headers, rows };
}

// Return matrix representation (array of arrays) of the table text
export function parseTableMatrix(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00A0/g, ' ').replace(/\t+/, '\t').trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], matrix: [] };
  const delim = detectDelimiter(text);
  const headers = splitLineRespectingQuotes(lines[0], delim).map(h => h || '');
  const matrix = lines.map(line => splitLineRespectingQuotes(line, delim).map(c => (c||'').toString()));
  return { headers, matrix };
}

const headerCandidates = {
  label: ['day', 'date', 'phase', 'section', 'stage', 'title'],
  focus: ['focus', 'topic', 'objective'],
  languageTarget: ['language', 'language target', 'lang', 'language_target'],
  assessment: ['assessment', 'assess'],
  teacherActions: ['teacher', 'teacher actions', 'teacher_action'],
  studentActions: ['student', 'student actions', 'student_action'],
  method: ['method', 'methods']
};

function findMatchingKey(header) {
  const h = header.toLowerCase();
  for (const [key, variants] of Object.entries(headerCandidates)) {
    for (const v of variants) {
      if (h.includes(v)) return key;
    }
  }
  return null;
}

function mapHeadersToFields(headers) {
  const map = {}; // header -> field
  headers.forEach((h) => {
    const key = findMatchingKey(h);
    if (key) map[h] = key;
  });
  return map;
}

// Attempt to merge parsed rows into existingData for the given period.
// If a reliable label-based match is found, we update existing rows and return { matched: true, data }
// Otherwise we build a new data object based on the period and parsed rows and return { matched: false, data }
export function matchAndApplyToPlanData(period, existingData = {}, headers, parsedRows) {
  // Preprocess headers/rows to merge common PDF-extraction artifacts like
  // header followed by a ':' or a separate column containing the value
  // e.g. ['Topic', ': Playground .'] -> ['Topic'] with value 'Playground .'
  let workingHeaders = headers.slice();
  let workingRows = parsedRows.slice();

  try {
    const matrix = workingRows.map(r => workingHeaders.map(h => (r[h] || '').toString()));
    const mergedHeaderIndices = [];
    const newHeaders = [];
    for (let i = 0; i < workingHeaders.length; i++) {
      const cur = (workingHeaders[i] || '').toString();
      const next = (workingHeaders[i + 1] || '').toString();
      if (next && (next.trim().startsWith(':') || next.trim() === ':' || /^[:,-]?$/.test(next.trim()))) {
        const mergedName = (cur + ' ' + next).trim();
        newHeaders.push(mergedName || cur || `col${i}`);
        mergedHeaderIndices.push(i);
        i++; // skip next
      } else {
        newHeaders.push(cur || `col${i}`);
      }
    }

    if (mergedHeaderIndices.length > 0) {
      const newRows = matrix.map(rowVals => {
        const out = {};
        let ri = 0;
        for (let hi = 0; hi < newHeaders.length; hi++) {
          let val = '';
          if (mergedHeaderIndices.includes(ri)) {
            val = (rowVals[ri + 1] || '').toString();
            ri += 2;
          } else {
            val = (rowVals[ri] || '').toString();
            ri += 1;
          }
          out[newHeaders[hi]] = val;
        }
        return out;
      });

      workingHeaders = newHeaders;
      workingRows = newRows;
    }
  } catch (e) {
    workingHeaders = headers.slice();
    workingRows = parsedRows.slice();
  }

  const headerMap = mapHeadersToFields(workingHeaders);

  const hasLabel = Object.values(headerMap).includes('label');

  // Helper to update a target object using headerMap
  const applyRowToTarget = (rowObj, targetObj) => {
    for (const h of headers) {
      const field = headerMap[h];
      if (!field) continue;
      if (field === 'label') {
        // label handled elsewhere
        continue;
      }
      // normalize keys used in templates
      if (field === 'focus') targetObj.focus = rowObj[h];
      else if (field === 'languageTarget') targetObj.languageTarget = rowObj[h];
      else if (field === 'assessment') targetObj.assessment = rowObj[h];
      else if (field === 'teacherActions') targetObj.teacherActions = rowObj[h];
      else if (field === 'studentActions') targetObj.studentActions = rowObj[h];
      else if (field === 'method') targetObj.method = rowObj[h];
    }
  };

  if (period === 'daily') {
    // existingData.stages expected
    const stages = Array.isArray(existingData.stages) ? existingData.stages : [];
    if (hasLabel) {
      const labelHeader = Object.keys(headerMap).find((h) => headerMap[h] === 'label');
      // create map of existing by stage/method or stage
      const existingByLabel = {};
      stages.forEach((s, i) => {
        const key = (s.stage || s.method || ('row' + i)).toString().toLowerCase();
        existingByLabel[key] = s;
      });
      let matchedCount = 0;
      parsedRows.forEach((r) => {
        const lbl = (r[labelHeader] || '').toString().toLowerCase();
        if (!lbl) return;
        const target = existingByLabel[lbl];
        if (target) {
          applyRowToTarget(r, target);
          matchedCount++;
        }
      });
      if (matchedCount > 0) return { matched: true, data: { ...existingData, stages } };
    }
    // fallback: create new stages from parsed rows
    const newStages = parsedRows.map((r, i) => {
      // If headers didn't map to known fields, try heuristic: treat row as ordered cells
      const meaningfulHeaders = headers.filter(h => h && h.toString().trim()).length;
      if (Object.keys(headerMap).length === 0 || meaningfulHeaders < Math.max(1, Math.floor(headers.length / 3))) {
        const cells = headers.map(h => (r[h] || '').toString()).filter(Boolean);
        const out = {
          stage: cells[0] || `Stage ${i + 1}`,
          method: cells[1] || '',
          teacherActions: cells[2] || '',
          studentActions: cells[3] || '',
          assessment: cells[4] || ''
        };
        return out;
      }

      const out = { stage: r[headers[0]] || `Stage ${i + 1}`, method: '', teacherActions: '', studentActions: '', assessment: '' };
      applyRowToTarget(r, out);
      return out;
    });
    return { matched: false, data: { ...existingData, stages: newStages } };
  }

  // weekly/monthly/yearly share rows structure
  const existingRows = Array.isArray(existingData.rows) ? existingData.rows : [];
  if (hasLabel) {
    const labelHeader = Object.keys(headerMap).find((h) => headerMap[h] === 'label');
    const existingByLabel = {};
    existingRows.forEach((r) => {
      const key = (r.day || r.phase || r.section || r.section || r.label || '').toString().toLowerCase();
      existingByLabel[key] = r;
    });
    let matchedCount = 0;
    parsedRows.forEach((r) => {
      const lbl = (r[labelHeader] || '').toString().toLowerCase();
      if (!lbl) return;
      const target = existingByLabel[lbl];
      if (target) {
        applyRowToTarget(r, target);
        matchedCount++;
      }
    });
    if (matchedCount > 0) return { matched: true, data: { ...existingData, rows: existingRows } };
  }

  // fallback: create new rows from parsed rows
  const newRows = parsedRows.map((r) => {
    const meaningfulHeaders = headers.filter(h => h && h.toString().trim()).length;
    // If headers don't map, use heuristic: ordered cells -> [label, focus, languageTarget, assessment]
    if (Object.keys(headerMap).length === 0 || meaningfulHeaders < Math.max(1, Math.floor(headers.length / 3))) {
      const cells = headers.map(h => (r[h] || '').toString()).filter(s => s && s.trim());
      const out = { focus: '', languageTarget: '', assessment: '' };
      // assign label-like first cell
      if (cells.length > 0) {
        out.day = cells[0];
        out.phase = cells[0];
        out.section = cells[0];
      }
      out.focus = cells[1] || (cells.length === 1 ? cells[0] : '');
      out.languageTarget = cells[2] || '';
      out.assessment = cells[3] || (cells.slice(3).length ? cells.slice(3).join(' ') : '');
      return out;
    }

    const out = { focus: '', languageTarget: '', assessment: '' };
    // if first header looks like a label, set it as day/phase/section
    const firstHeader = headers[0];
    const firstField = headerMap[firstHeader];
    if (firstField === 'label') {
      out.day = r[firstHeader];
    }
    applyRowToTarget(r, out);
    return out;
  });
  return { matched: false, data: { ...existingData, rows: newRows } };
}

export default { parseTableText, matchAndApplyToPlanData };
