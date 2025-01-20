import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const isValidWord = (word) => {
    // Match words with letters, hyphens, and apostrophes
    return /^[a-zA-Z]+(?:['|-][a-zA-Z]+)*$/.test(word);
};

const argv = yargs(hideBin(process.argv))
    .option('files', {
        type: 'string',
        description: 'Input files separated by comma',
        default: './words_unique.txt,./allwords.txt'
    })
    .option('output', {
        type: 'string',
        description: 'Output merged file path',
        default: './merged_words.txt'
    })
    .argv;

const mergeWordLists = async () => {
    try {
        // Read all input files
        const [file1, file2] = argv.files.split(',');
        const content1 = await fs.promises.readFile(file1, 'utf8');
        const content2 = await fs.promises.readFile(file2, 'utf8');

        // Create merged Set of valid words
        const mergedWords = new Set([
            ...content1.split('\n'),
            ...content2.split('\n')
        ]
            .map(w => w.trim())
            .filter(w => w && isValidWord(w))
            .map(w => w.toLowerCase())
        );

        // Sort and write output
        const sortedWords = Array.from(mergedWords).sort();
        await fs.promises.writeFile(argv.output, sortedWords.join('\n'));

        console.log(`Total input words from ${file1}: ${content1.split('\n').length}`);
        console.log(`Total input words from ${file2}: ${content2.split('\n').length}`);
        console.log(`Total unique valid words: ${mergedWords.size}`);
        console.log(`Results written to ${argv.output}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

mergeWordLists();