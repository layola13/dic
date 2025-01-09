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
const parseDictionaryLine = (line) => {
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

// Function to read and parse dictionary file
const readDictionary = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const wordMap = new Map();

    lines.forEach(line => {
        const parsed = parseDictionaryLine(line);
        if (parsed) {
            wordMap.set(parsed.word, parsed.content);
        }
    });

    return wordMap;
};

// Main execution
const [file1, file2] = argv.files.split(',');
const baseDict = readDictionary(file1);
const compareDict = readDictionary(file2);

let newWordsCount = 0;

// Compare and combine dictionaries
for (const [word, content] of compareDict) {
    if (!baseDict.has(word)) {
        baseDict.set(word, content);
        newWordsCount++;
    }
}

// Write combined dictionary to output file
const output = Array.from(baseDict.values()).join('\n');
fs.writeFileSync(argv.out, output);

console.log(`Processing complete:`);
console.log(`Total new words added: ${newWordsCount}`);