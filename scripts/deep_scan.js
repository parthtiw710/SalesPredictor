const fs = require('fs');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  console.log(`\n=== SCANNING: ${filePath} ===`);

  lines.forEach((line, idx) => {
    // Look for hardcoded string literals in JSX or returns
    // Ignore imports, comments, console, className, type definitions
    const trimmed = line.trim();
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('console.') ||
      trimmed.startsWith('export interface') ||
      trimmed.startsWith('type ')
    ) {
      return;
    }

    // Match string literals that have English words (capitalized or common words)
    const matches = line.match(/'[A-Za-z0-9\s,./:!?-]+'|"[A-Za-z0-9\s,./:!?-]+"/g);
    if (matches) {
      matches.forEach(m => {
        const val = m.slice(1, -1).trim();
        // Ignore html/css/config values, single words like colors or identifiers
        if (
          val.includes(' ') &&
          !val.startsWith('bg-') &&
          !val.startsWith('text-') &&
          !val.startsWith('border-') &&
          !val.startsWith('flex') &&
          !val.startsWith('http') &&
          !val.startsWith('SELECT') &&
          !val.startsWith('INSERT') &&
          !val.startsWith('CREATE') &&
          !val.startsWith('DELETE') &&
          !val.includes('application/json') &&
          !val.includes('image/') &&
          !val.includes('font-') &&
          !val.includes('round') &&
          !val.includes('grid')
        ) {
          console.log(`  Line ${idx + 1}: ${m}   --> context: ${trimmed.slice(0, 80)}`);
        }
      });
    }

    // Check direct JSX text between tags >Text<
    const jsxTextMatches = line.match(/>([^<>{}]*[a-zA-Z]{3,}[^<>{}]*)</g);
    if (jsxTextMatches) {
      jsxTextMatches.forEach(j => {
        const text = j.slice(1, -1).trim();
        if (text && !text.startsWith('function') && !text.startsWith('return')) {
          console.log(`  [DIRECT JSX TEXT] Line ${idx + 1}: "${text}"`);
        }
      });
    }
  });
}

scanFile('src/app/page.tsx');
scanFile('src/lib/gcp.ts');
scanFile('src/app/api/bulletin/route.ts');
scanFile('src/app/api/history/route.ts');
