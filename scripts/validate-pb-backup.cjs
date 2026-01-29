#!/usr/bin/env node
const fs = require('fs');

function usage() {
  console.log('Usage: node scripts/validate-pb-backup.cjs <backup.json>');
}

const inPath = process.argv[2];
if (!inPath) {
  usage();
  process.exit(1);
}

try {
  const raw = fs.readFileSync(inPath, 'utf8');
  const data = JSON.parse(raw);

  // Expect top-level object with `collections` array
  let collections = null;
  if (data && Array.isArray(data.collections)) collections = data.collections;
  else if (Array.isArray(data)) {
    console.warn('Warning: file is a top-level array. PocketBase expects an object with `collections`.');
    collections = data;
  } else {
    console.error('Invalid: top-level object must contain a `collections` array.');
    process.exit(2);
  }

  let errors = 0;
  function err(msg) { console.error(msg); errors++; }

  if (!collections.length) {
    err('No collections found in file.');
  }

  collections.forEach((col, idx) => {
    const prefix = `Collection[${idx}] (${col && col.id ? col.id : 'no-id'})`;
    if (!col || typeof col !== 'object') {
      err(`${prefix}: not an object`);
      return;
    }
    if (!col.id || typeof col.id !== 'string') err(`${prefix}: missing or invalid 'id'`);
    if (!col.name || typeof col.name !== 'string') err(`${prefix}: missing or invalid 'name'`);
    if (!col.type || (col.type !== 'base' && col.type !== 'auth')) err(`${prefix}: missing or invalid 'type' (expected 'base' or 'auth')`);

    if (!Array.isArray(col.schema)) err(`${prefix}: missing 'schema' array`);
    else if (!col.schema.length) err(`${prefix}: 'schema' array is empty`);
    else {
      col.schema.forEach((f, fidx) => {
        const fpre = `${prefix} -> field[${fidx}]`;
        if (!f || typeof f !== 'object') err(`${fpre}: not an object`);
        if (!f.name || typeof f.name !== 'string') err(`${fpre}: missing or invalid 'name'`);
        if (!f.type || typeof f.type !== 'string') err(`${fpre}: missing or invalid 'type'`);
        // relation fields must have a collectionId
        if (f.type === 'relation' && (!f.collectionId || typeof f.collectionId !== 'string')) {
          err(`${fpre}: relation field missing 'collectionId'`);
        }
      });
    }
  });

  if (errors) {
    console.error(`\nValidation failed: ${errors} issues found.`);
    process.exit(3);
  }

  console.log('Validation passed: backup file looks well-formed.');
  process.exit(0);
} catch (err) {
  console.error('Error reading/parsing file:', err && err.message ? err.message : err);
  process.exit(4);
}
