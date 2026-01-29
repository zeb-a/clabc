#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/convert-pb-export.js <input.json> [output.json]');
}

const inPath = process.argv[2];
if (!inPath) {
  usage();
  process.exit(1);
}

const outPath = process.argv[3] || (inPath.replace(/\.json$/i, '') + '-converted.json');

try {
  const raw = fs.readFileSync(inPath, 'utf8');
  const data = JSON.parse(raw);

  // Support both wrapped { collections: [...] } and plain array exports
  let collections = null;
  if (Array.isArray(data)) collections = data;
  else if (data && Array.isArray(data.collections)) collections = data.collections;
  else if (data && Array.isArray(data.collections || data.collections)) collections = data.collections;
  else {
    console.error('Could not detect collections array in the provided file.');
    process.exit(2);
  }

  const errors = [];
  for (const col of collections) {
    // If the export uses `fields` instead of `schema`, copy it to `schema`
    if (!col.schema && Array.isArray(col.fields)) {
      col.schema = col.fields;
      delete col.fields;
    }

    // Basic validation: schema must exist and be an array
    if (!Array.isArray(col.schema) || col.schema.length === 0) {
      errors.push({ id: col.id || '(no id)', name: col.name || '(no name)', reason: 'schema is missing or empty' });
    }
  }

  const output = Array.isArray(data) ? collections : Object.assign({}, data, { collections: collections });

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  if (errors.length) {
    console.error('Validation errors found:');
    for (const e of errors) console.error(`- ${e.id} / ${e.name}: ${e.reason}`);
    console.error(`Converted file written to: ${outPath}`);
    process.exit(3);
  }

  console.log(`Conversion successful — wrote ${outPath}`);
  process.exit(0);
} catch (err) {
  console.error('Error processing file:', err && err.message ? err.message : err);
  process.exit(4);
}
