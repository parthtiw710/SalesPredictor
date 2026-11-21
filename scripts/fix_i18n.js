const fs = require('fs');
const p = 'C:/Users/asus/OneDrive/Desktop/SSTPL/Prasoon/SalesPredictor/src/lib/i18n.ts';
let lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
// In Hindi section (around line 105-115), find status_completed: 'पूर्ण' and remove it and the next line
for (let i = 100; i < 120; i++) {
  if (lines[i] && lines[i].includes("status_completed: 'पूर्ण'")) {
    lines.splice(i, 2);
    console.log('Removed duplicate status lines at index ' + i);
    break;
  }
}
fs.writeFileSync(p, lines.join('\r\n'), 'utf8');
console.log('Done');
