const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir);

console.log('Fixing controller imports...');

files.forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(controllersDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix incorrect imports
        const newContent = content.replace(/require\(['"]\.\/models\//g, 'require(\'../models/');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`✅ Fixed: ${file}`);
        }
    }
});

console.log('All imports fixed!');