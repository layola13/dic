// const fs = require('fs');
// const yargs = require('yargs/yargs');
// const { hideBin } = require('yargs/helpers');

import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';


// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('files', {
        type: 'string',
        description: 'Input files separated by comma'
    })
    .option('out', {
        type: 'string',
        description: 'Output file path'
    })
    .demandOption(['files', 'out'])
    .argv;

// Function to parse dictionary line into word and content
const parseDictionaryLine_basic = (line) => {
    // Handle both "word:" and "word :" formats
    const match = line.match(/^([^:]+)\s*:/);
    if (match) {
        const word = match[1].trim();
        return {
            word,
            content: line
        };
    }
    return null;
};

const parseDictionaryLine_simple = (line) => {
    // Match pattern: word (including hyphens) [pronunciation] rest_of_content
    const match = line.match(/^([\w-]+)\s+\[/);
    if (match) {
        const word = match[1].trim();
        return {
            word,
            content: line
        };
    }
    // Debug logging
    console.log(`Failed to parse: "${line}"`);
    return null;
};

const parseDictionaryLine = (line) => {
   // Match only word with optional hyphens
   const match = line.match(/^([a-zA-Z]+(?:-[a-zA-Z]+)*)$/);
   if (match) {
       const word = match[1].trim().toLowerCase();
       return {
           word,
           content: line
       };
   }
   
   console.log(`Failed to parse line: "${line}"`);
   return null;
};

// ...existing code...
// Function to read and parse dictionary file
const readDictionary = (filePath) => {
    console.log(`Reading dictionary from ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content
        .split('\n')
        .filter(line => line.trim().length > 0);
    
    console.log(`Total lines in ${filePath}: ${lines.length}`);
    const wordMap = new Map();

    lines.forEach((line, index) => {
        const parsed = parseDictionaryLine(line);
        if (parsed) {
            wordMap.set(parsed.word.toLowerCase(), parsed.content); // Normalize to lowercase
        } else {
            console.log(`Warning: Could not parse line ${index + 1}: ${line} in ${filePath}`);
        }
    });

    console.log(`Total words in ${filePath}: ${wordMap.size}`);
    return wordMap;
};

// Main execution
const [file1, file2] = argv.files.split(',');
const baseDict = readDictionary(file1);
const compareDict = readDictionary(file2);

let newWordsCount = 0;
const newWords = []; // Track new words
// Compare and combine dictionaries
for (const [word, content] of compareDict) {
    if (!baseDict.has(word)) {
        baseDict.set(word, content);
        newWordsCount++;
        newWords.push(word); // Add to new words list
    }
}

// Write combined dictionary to output file
const output = Array.from(baseDict.values()).join('\n');
fs.writeFileSync(argv.out, output);

// Write diff file with new words
const diffPath = './diff.txt';
fs.writeFileSync(diffPath, newWords.sort().join('\n'));
console.log(`Processing complete:`);
console.log(`Total new words added: ${newWordsCount}`);