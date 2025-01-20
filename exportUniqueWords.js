import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .option('input', {
        type: 'string',
        description: 'Input dictionary file path',
        default: './dics/simple_dic_gemini.txt'
    })
    .option('output', {
        type: 'string',
        description: 'Output file path',
        default: './words_unique.txt'
    })
    .argv;

const extractWords = async () => {
    try {
        // Read file content
        const content = await fs.promises.readFile(argv.input, 'utf8');
        
        // Extract words using regex
        const words = new Set();
        const lines = content.split('\n');
        
        lines.forEach(line => {
            const match = line.match(/^(\w+)/);
            if (match) {
                words.add(match[1].trim());
            }
        });

        // Sort and join words
        const sortedWords = Array.from(words).sort();
        
        // Write output
        await fs.promises.writeFile(argv.output, sortedWords.join('\n'));
        
        console.log(`Total unique words: ${words.size}`);
        console.log(`Output saved to: ${argv.output}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

extractWords();