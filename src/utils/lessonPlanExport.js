/**
 * Lesson Plan Export - PDF and DOCX
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
import {
  DAILY_STAGES,
  WEEKLY_DAY_LABELS,
  MONTHLY_PHASE_LABELS,
  YEARLY_SECTION_LABELS,
  PLACEHOLDERS
} from '../templates/lessonTemplates';

/** Sanitize text for export (strip HTML, limit length) */
function sanitize(str) {
  if (str == null || str === undefined) return '';
  const s = String(str).replace(/<[^>]*>/g, '').trim();
  return s.length > 500 ? s.slice(0, 500) + '…' : s;
}

// ============ PDF ============
export async function exportLessonPlanToPDF(plan, className) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 15;
  let y = 15;
  const pageHeight = 297;
  const maxY = pageHeight - 20;

  const addText = (text, size = 10) => {
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(sanitize(text), 180);
    for (const line of lines) {
      if (y > maxY) {
        pdf.addPage();
        y = 15;
      }
      pdf.text(line, margin, y);
      y += 6;
    }
    y += 4;
  };

  const addHeading = (text) => {
    if (y > maxY - 20) {
      pdf.addPage();
      y = 15;
    }
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text(text, margin, y);
    y += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
  };

  // Header block: render period as heading, then metadata each on its own line
  if (y > maxY - 30) { pdf.addPage(); y = 15; }
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Lesson Plan - ${String(plan.period || '').toUpperCase()}`, margin, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Class: ${className || plan.class_id || '—'}`, margin, y);
  y += 7;

  if (plan.title) {
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(12);
    pdf.text(`Title: ${plan.title}`, margin, y);
    y += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
  }

  if (plan.date) {
    pdf.text(`Date: ${plan.date}`, margin, y);
    y += 8;
  }

  y += 2;

  const data = plan.data || {};

  switch (plan.period) {
    case 'daily': {
      addHeading('Objective');
      addText(data.objective || PLACEHOLDERS.daily.objective);
      addHeading('Materials');
      addText(data.materials || PLACEHOLDERS.daily.materials);
      addHeading('Lesson Flow');
      const tableData = [
        ['Stage', 'Method', 'Teacher Actions', 'Student Actions', 'Assessment']
      ];
      const stages = data.stages || [];
      DAILY_STAGES.forEach((s, i) => {
        const st = stages[i] || {};
        tableData.push([
          s.stage,
          s.method,
          sanitize(st.teacherActions || s.teacherActionsPlaceholder),
          sanitize(st.studentActions || s.studentActionsPlaceholder),
          sanitize(st.assessment || s.assessmentPlaceholder)
        ]);
      });
      autoTable(pdf, {
        startY: y,
        head: [tableData[0]],
        body: tableData.slice(1),
        margin: { left: margin },
        styles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 25 },
          2: { cellWidth: 45 },
          3: { cellWidth: 45 },
          4: { cellWidth: 45 }
        }
      });
      y = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : y + 10;
      if (data.notes) {
        addHeading('Notes');
        addText(data.notes);
      }
      break;
    }
    case 'weekly': {
      addHeading('Weekly Plan');
      const wRows = data.rows || [];
      const wTable = [['Day', 'Focus', 'Language Target', 'Assessment']];
      WEEKLY_DAY_LABELS.forEach((day, i) => {
        const r = wRows[i] || {};
        wTable.push([day, sanitize(r.focus), sanitize(r.languageTarget), sanitize(r.assessment)]);
      });
      autoTable(pdf, {
        startY: y,
        head: [wTable[0]],
        body: wTable.slice(1),
        margin: { left: margin },
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 }, 3: { cellWidth: 50 } }
      });
      y = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : y + 10;
      if (data.notes) {
        addHeading('Notes');
        addText(data.notes);
      }
      break;
    }
    case 'monthly': {
      addHeading('Monthly Plan');
      const mRows = data.rows || [];
      const mTable = [['Phase', 'Focus', 'Language Target', 'Assessment']];
      MONTHLY_PHASE_LABELS.forEach((phase, i) => {
        const r = mRows[i] || {};
        mTable.push([phase, sanitize(r.focus), sanitize(r.languageTarget), sanitize(r.assessment)]);
      });
      autoTable(pdf, {
        startY: y,
        head: [mTable[0]],
        body: mTable.slice(1),
        margin: { left: margin },
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 28 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 }, 3: { cellWidth: 50 } }
      });
      y = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : y + 10;
      if (data.notes) {
        addHeading('Notes');
        addText(data.notes);
      }
      break;
    }
    case 'yearly':
    default: {
      addHeading('Yearly Plan');
      const yRows = data.rows || [];
      const yTable = [['Section', 'Focus', 'Language Target', 'Assessment']];
      YEARLY_SECTION_LABELS.forEach((section, i) => {
        const r = yRows[i] || {};
        yTable.push([section, sanitize(r.focus), sanitize(r.languageTarget), sanitize(r.assessment)]);
      });
      autoTable(pdf, {
        startY: y,
        head: [yTable[0]],
        body: yTable.slice(1),
        margin: { left: margin },
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 48 }, 2: { cellWidth: 48 }, 3: { cellWidth: 48 } }
      });
      y = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 10 : y + 10;
      if (data.notes) {
        addHeading('Notes');
        addText(data.notes);
      }
      break;
    }
  }

  const filename = `lesson-plan-${plan.period}-${plan.id || Date.now()}.pdf`;
  try {
    // Preferred approach: create blob and click an anchor
    const blob = pdf.output && typeof pdf.output === 'function' ? pdf.output('blob') : null;
    if (blob && typeof URL !== 'undefined' && URL.createObjectURL) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      // Some environments require the anchor to be in the document
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }
  } catch (err) {
    // Fall through to fallback
    console.warn('Blob download failed, falling back to save()', err);
  }

  try {
    // Fallback: let jsPDF trigger its own save dialog
    if (typeof pdf.save === 'function') {
      pdf.save(filename);
      return;
    }
  } catch (err) {
    console.error('PDF save fallback failed', err);
  }

  // Last resort: open as data URL in new tab
  try {
    const dataUrl = pdf.output && typeof pdf.output === 'function' ? pdf.output('dataurlstring') : null;
    if (dataUrl) {
      const w = window.open('', '_blank');
      if (w) w.document.write('<iframe src="' + dataUrl + '" style="width:100%;height:100%;border:none;"></iframe>');
    }
  } catch (err) {
    console.error('All PDF download methods failed', err);
    alert('Unable to download PDF: your browser may be blocking downloads.');
  }
}

// ============ DOCX ============
export async function exportLessonPlanToDOCX(plan, className) {
  const data = plan.data || {};
  const children = [];

  const p = (text, bold = false) =>
    new Paragraph({
      children: [new TextRun({ text: sanitize(text), bold })]
    });

  const heading = (text) =>
    new Paragraph({
      text: text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 }
    });

  children.push(p(`Lesson Plan - ${plan.period}`, true));
  children.push(p(`Class: ${className || plan.class_id}`));
  if (plan.title) children.push(p(`Title: ${plan.title}`));
  if (plan.date) children.push(p(`Date: ${plan.date}`));
  children.push(new Paragraph({ text: '', spacing: { after: 120 } }));

  const makeDocxCell = (txt, bold = false) =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: sanitize(String(txt)), bold })] })]
    });

  switch (plan.period) {
    case 'daily': {
      children.push(heading('Objective'));
      children.push(p(data.objective || PLACEHOLDERS.daily.objective));
      children.push(heading('Materials'));
      children.push(p(data.materials || PLACEHOLDERS.daily.materials));
      children.push(heading('Lesson Flow'));
      const stages = data.stages || [];
      const rows = [
        new TableRow({
          children: ['Stage', 'Method', 'Teacher Actions', 'Student Actions', 'Assessment'].map((t) => makeDocxCell(t, true))
        })
      ];
      DAILY_STAGES.forEach((s, i) => {
        const st = stages[i] || {};
        rows.push(
          new TableRow({
            children: [
              s.stage,
              s.method,
              st.teacherActions || s.teacherActionsPlaceholder,
              st.studentActions || s.studentActionsPlaceholder,
              st.assessment || s.assessmentPlaceholder
            ].map((t) => makeDocxCell(t))
          })
        );
      });
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
      if (data.notes) {
        children.push(heading('Notes'));
        children.push(p(data.notes));
      }
      break;
    }
    case 'weekly': {
      children.push(heading('Weekly Plan'));
      const wDataRows = data.rows || [];
      const wRows = [
        new TableRow({ children: ['Day', 'Focus', 'Language Target', 'Assessment'].map((t) => makeDocxCell(t, true)) })
      ];
      WEEKLY_DAY_LABELS.forEach((day, i) => {
        const r = wDataRows[i] || {};
        wRows.push(new TableRow({ children: [day, r.focus, r.languageTarget, r.assessment].map((t) => makeDocxCell(t)) }));
      });
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: wRows }));
      if (data.notes) {
        children.push(heading('Notes'));
        children.push(p(data.notes));
      }
      break;
    }
    case 'monthly': {
      children.push(heading('Monthly Plan'));
      const mDataRows = data.rows || [];
      const mRows = [
        new TableRow({ children: ['Phase', 'Focus', 'Language Target', 'Assessment'].map((t) => makeDocxCell(t, true)) })
      ];
      MONTHLY_PHASE_LABELS.forEach((phase, i) => {
        const r = mDataRows[i] || {};
        mRows.push(new TableRow({ children: [phase, r.focus, r.languageTarget, r.assessment].map((t) => makeDocxCell(t)) }));
      });
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: mRows }));
      if (data.notes) {
        children.push(heading('Notes'));
        children.push(p(data.notes));
      }
      break;
    }
    case 'yearly':
    default: {
      children.push(heading('Yearly Plan'));
      const yDataRows = data.rows || [];
      const yRows = [
        new TableRow({ children: ['Section', 'Focus', 'Language Target', 'Assessment'].map((t) => makeDocxCell(t, true)) })
      ];
      YEARLY_SECTION_LABELS.forEach((section, i) => {
        const r = yDataRows[i] || {};
        yRows.push(new TableRow({ children: [section, r.focus, r.languageTarget, r.assessment].map((t) => makeDocxCell(t)) }));
      });
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: yRows }));
      if (data.notes) {
        children.push(heading('Notes'));
        children.push(p(data.notes));
      }
      break;
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lesson-plan-${plan.period}-${plan.id || Date.now()}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
