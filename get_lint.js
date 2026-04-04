const fs = require('fs');
const data = JSON.parse(fs.readFileSync('lint.json', 'utf8'));
data.forEach(file => {
  if (file.messages.length > 0) {
    file.messages.forEach(msg => {
      console.log(`${file.filePath}:${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
    });
  }
});
