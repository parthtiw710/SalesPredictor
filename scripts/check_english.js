const fs = require('fs');
const content = fs.readFileSync('src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

const englishWords = [
  'Preparing', 'Civil Lines', 'Express', 'Home', 'Mandi', 'Scan', 'Today', 'Prep', 
  'Targets', 'Shift', 'Records', 'View All', 'Kitchen', 'Audio', 'Bulletin', 'Voice', 'dispatch', 
  'Tap to', 'Generating', 'Loading', 'Open Camera', 'Upload', 'Snap', 'Verified', 'Purchase', 
  'Grand Total', 'Save', 'Recording', 'Outlet Details', 'Network', 'Location', 'Cook', 'Switch', 
  'Enter', 'Copy', 'Copied', 'New Item', 'Breakfast', 'Lunch', 'Dinner', 'Align', 'Retake', 'All Shifts'
];

lines.forEach((line, idx) => {
  englishWords.forEach(w => {
    const regex = new RegExp('>\\s*[^<]*' + w + '[^<]*<', 'i');
    if (regex.test(line)) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  });
});
