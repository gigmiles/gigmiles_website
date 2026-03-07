const fs = require('fs');
const path = require('path');

function replaceInDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            content = content.replace(/text-neon-primary/g, 'text-emerald-500');
            content = content.replace(/bg-neon-primary/g, 'bg-emerald-500');
            content = content.replace(/border-neon-primary/g, 'border-emerald-500');
            content = content.replace(/from-neon-primary/g, 'from-emerald-500');
            content = content.replace(/to-neon-primary/g, 'to-emerald-500');
            content = content.replace(/via-neon-primary/g, 'via-emerald-500');
            
            // Explicitly deal with rgba shadows
            content = content.replace(/rgba\(57,255,20,/g, 'rgba(16,185,129,');
            
            fs.writeFileSync(fullPath, content, 'utf-8');
        }
    });
}

replaceInDir(path.join(__dirname, 'src', 'components', 'dashboard'));
console.log('Replaced neon-primary with emerald-500 across all dashboard files.');
