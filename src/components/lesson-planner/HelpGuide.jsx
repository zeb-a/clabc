import React from 'react';
import { X, BookOpen, Plus, Minus, Upload } from 'lucide-react';

const modalStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20
};

const contentStyle = {
  background: '#fff',
  borderRadius: 16,
  padding: 28,
  width: '90vw',
  maxWidth: 800,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const sectionStyle = {
  marginBottom: 24,
  paddingBottom: 24,
  borderBottom: '1px solid #e2e8f0'
};

const titleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: '#1e293b',
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 8
};

const subtitleStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 8,
  marginTop: 16
};

const textStyle = {
  fontSize: 13,
  lineHeight: 1.6,
  color: '#64748b'
};

const listStyle = {
  fontSize: 13,
  lineHeight: 1.6,
  color: '#64748b',
  paddingLeft: 20,
  margin: '8px 0'
};

const highlightStyle = {
  background: '#fef3c7',
  padding: '2px 6px',
  borderRadius: 4,
  fontWeight: 600,
  color: '#92400e'
};

export default function HelpGuide({ onClose }) {
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>
              How to Use Lesson Planner
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
              Complete guide to creating and managing your lesson plans
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: 8,
              border: 'none',
              background: '#f1f5f9',
              cursor: 'pointer'
            }}
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        <div style={sectionStyle}>
          <div style={titleStyle}>
            <BookOpen size={20} color="#0ea5e9" />
            Getting Started
          </div>
          <p style={textStyle}>
            Welcome to the Lesson Planner! This tool helps you create, organize, and export lesson plans
            for different time periods.
          </p>
          <div style={subtitleStyle}>Step 1: Select a Class</div>
          <ul style={listStyle}>
            <li>Choose a class from the dropdown in the left sidebar</li>
            <li>If no class exists, create one first in the main application</li>
          </ul>
          <div style={subtitleStyle}>Step 2: Choose a Period</div>
          <ul style={listStyle}>
            <li><strong>Daily:</strong> Detailed lesson plans with 5E model stages</li>
            <li><strong>Weekly:</strong> Overview of the week with day-by-day focus</li>
            <li><strong>Monthly:</strong> Monthly planning with phase-based structure</li>
            <li><strong>Yearly:</strong> Long-term curriculum planning</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <div style={titleStyle}>
            <BookOpen size={20} color="#0ea5e9" />
            Setting Dates
          </div>
          <p style={textStyle}>
            Each period type has its own date selection:
          </p>
          <ul style={listStyle}>
            <li><strong>Daily:</strong> Select a single date for the lesson</li>
            <li><strong>Weekly:</strong> Set "From" and "To" dates to define the week range</li>
            <li><strong>Monthly:</strong> Choose the month and year (e.g., "January 2026")</li>
            <li><strong>Yearly:</strong> Enter the year for annual planning</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <div style={titleStyle}>
            <BookOpen size={20} color="#0ea5e9" />
            Managing Columns and Rows
          </div>
          <p style={textStyle}>
            Customize your lesson plan tables by adding or removing rows and columns:
          </p>
          <div style={subtitleStyle}>Adding Rows</div>
          <ul style={listStyle}>
            <li>Click the <span style={highlightStyle}>+ Add Row</span> button at the bottom of the table</li>
            <li>A new row will be added with empty fields</li>
            <li>Works for Weekly, Monthly, and Yearly templates</li>
          </ul>
          <div style={subtitleStyle}>Removing Rows</div>
          <ul style={listStyle}>
            <li>Click the <span style={highlightStyle}>× Delete</span> button next to any row</li>
            <li>Only non-locked rows can be deleted (some default rows may be locked)</li>
          </ul>
          <div style={subtitleStyle}>Adding Custom Columns</div>
          <ul style={listStyle}>
            <li>Click <span style={highlightStyle}>+ Add Column</span> to open the column selector</li>
            <li>Choose from predefined options:
              <ul>
                <li><strong>Vocabularies:</strong> For vocabulary lists</li>
                <li><strong>Questions:</strong> For comprehension questions</li>
                <li><strong>Speaking:</strong> For speaking activities</li>
                <li><strong>Listening:</strong> For listening tasks</li>
                <li><strong>Writing:</strong> For writing exercises</li>
              </ul>
            </li>
            <li>The new column will appear in the table with editable fields</li>
          </ul>
          <div style={subtitleStyle}>Removing Columns</div>
          <ul style={listStyle}>
            <li>Click <span style={highlightStyle}>− Remove Column</span> to delete a custom column</li>
            <li>Select which column to remove from the dropdown</li>
            <li>Default columns (Focus, Language Target, Assessment) cannot be removed</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <div style={titleStyle}>
            <Upload size={20} color="#0ea5e9" />
            Importing Content
          </div>
          <p style={textStyle}>
            Quickly bring content from your documents into a lesson plan. You can import plain text or files that contain tables (CSV/TSV).
          </p>
          <div style={subtitleStyle}>Supported File Types</div>
          <ul style={listStyle}>
            <li><strong>PDF (.pdf)</strong> — extracts readable text from the document</li>
            <li><strong>Word (.docx)</strong> — imports paragraph and list text</li>
            <li><strong>Text (.txt)</strong> — plain text files</li>
            <li><strong>CSV/TSV (.csv, .tsv)</strong> — tabular data (rows and columns)</li>
          </ul>
          <div style={subtitleStyle}>How to Import</div>
          <ol style={listStyle}>
            <li>Click the <span style={highlightStyle}>Import</span> button at the top of the Lesson Planner.</li>
            <li>Choose the file you want to import from your device.</li>
            <li>If the file contains a table, you'll be asked whether to <strong>Replace the current table</strong> or <strong>Add to a single column</strong>.</li>
            <li>Follow the on-screen prompts to pick the destination column (if applicable) and confirm the import.</li>
            <li>Review the imported content in the editor and click <span style={highlightStyle}>Save</span> when you're ready to keep the changes.</li>
          </ol>
          <div style={subtitleStyle}>Tips for Best Results</div>
          <ul style={listStyle}>
            <li>Use clear headings, bullet lists, or tables in your source file for better mapping.</li>
            <li>For tabular imports, ensure each row has the same number of columns.</li>
            <li>If something looks off, choose the "Add to a single column" option and place the data manually.</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <div style={titleStyle}>
            <BookOpen size={20} color="#0ea5e9" />
            Saving and Exporting
          </div>
          <div style={subtitleStyle}>Auto-Save</div>
          <ul style={listStyle}>
            <li>Auto-save is disabled. Your changes are saved only when you click <span style={highlightStyle}>Save</span>.</li>
            <li>A <span style={{ color: '#059669', fontWeight: 600 }}>Saved</span> indicator appears after a successful manual save</li>
          </ul>
          <div style={subtitleStyle}>Manual Save</div>
          <ul style={listStyle}>
            <li>Click the <span style={highlightStyle}>Save</span> button to save immediately</li>
          </ul>
          <div style={subtitleStyle}>Export to PDF/DOCX</div>
          <ul style={listStyle}>
            <li>Use the <span style={highlightStyle}>PDF</span> or <span style={highlightStyle}>DOCX</span> buttons to export</li>
            <li>Exported files include all your lesson plan content</li>
            <li>Perfect for sharing with colleagues or printing</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <div style={titleStyle}>
            <BookOpen size={20} color="#0ea5e9" />
            Managing Saved Plans
          </div>
          <p style={textStyle}>
            Access and manage all your saved lesson plans from the left sidebar:
          </p>
          <ul style={listStyle}>
            <li><strong>Search:</strong> Use the search box to find specific plans</li>
            <li><strong>Load:</strong> Click any plan to open it for editing</li>
            <li><strong>Delete:</strong> Click the trash icon to remove a plan permanently</li>
            <li><strong>Import/Export:</strong> Copy plans between different classes</li>
          </ul>
        </div>

          <div style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
            <div style={titleStyle}>
              <BookOpen size={20} color="#0ea5e9" />
              Keyboard Shortcuts
            </div>
            <ul style={listStyle}>
              <li><strong>Ctrl/Cmd + S:</strong> Save immediately</li>
              <li><strong>Tab:</strong> Move to next field</li>
              <li><strong>Shift + Tab:</strong> Move to previous field</li>
            </ul>
          </div>

          <div style={{ marginTop: 24, paddingBottom: 0, borderBottom: 'none' }}>
            <div style={titleStyle}>
              <Upload size={20} color="#0ea5e9" />
              Table Import Options
            </div>
            <p style={textStyle}>
              If your file contains a table (rows and columns), you can either replace the current table or import the data into a single column.
            </p>
            <div style={subtitleStyle}>Replace the Current Table</div>
            <ul style={listStyle}>
              <li>Choose this to replace the existing table with the imported one.</li>
              <li>Column headers and all rows will be taken from the file.</li>
              <li>The import attempts to match common column names (e.g., Focus, Assessment) automatically.</li>
              <li>Extra columns from the file become new custom columns in the plan.</li>
            </ul>
            <div style={subtitleStyle}>Add to a Single Column</div>
            <ul style={listStyle}>
              <li>Choose this to append or overwrite a single column in the current table.</li>
              <li>You will be prompted to pick which column to populate (for example, Notes or Focus).</li>
              <li>This is useful when you only want to import content without changing the table structure.</li>
            </ul>
            <div style={subtitleStyle}>Example Tabular Format</div>
            <p style={{ ...textStyle, background: '#f8fafc', padding: 12, borderRadius: 8, fontFamily: 'monospace', fontSize: 12 }}>
              Day,Focus,Language Target,Assessment<br/>
              Monday,Introduction to verbs,be/do/have verbs,Exit ticket<br/>
              Tuesday,Verb practice exercises,Present tense forms,Oral check<br/>
              Wednesday,Real-world application,Conversation practice,Role play assessment
            </p>
          </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              borderRadius: 10,
              border: 'none',
              background: '#0ea5e9',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
