// const fs = require('fs');
import fs from 'fs';

const normalizeFile = (filePath) => {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove spaces between colon and forward slash
    const normalized = content.replace(/:\s+\//g, ':/');
    
    // Write back to file
    fs.writeFileSync(filePath, normalized);
    
    console.log('Format normalized successfully.');
};

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
    console.error('Please provide a file path');
    process.exit(1);
}

normalizeFile(filePath);