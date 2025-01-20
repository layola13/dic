import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .option('source', {
        type: 'string',
        description: 'Source word list file',
        default: './allwords.txt'
    })
    .option('target', {
        type: 'string',
        description: 'Target word list to compare against',
        default: './words_unique.txt'
    })
    .option('output', {
        type: 'string',
        description: 'Output file for missing words',
        default: './newdiff.txt'
    })
    .argv;

const isValidWord = (word) => {
    // Match words that:
    // - Start with letter
    // - Can contain letters, hyphens, and apostrophes
    // - End with letter
    return /^[a-zA-Z]+(?:['|-][a-zA-Z]+)*$/.test(word);
};
const findMissingWords = async () => {
    try {
        const sourceContent = await fs.promises.readFile(argv.source, 'utf8');
        const targetContent = await fs.promises.readFile(argv.target, 'utf8');

        // Create Sets of valid words only
        const sourceWords = new Set(
            sourceContent
                .split('\n')
                .map(w => w.trim())
                .filter(w => w && isValidWord(w))
        );

        const targetWords = new Set(
            targetContent
                .split('\n')
                .map(w => w.trim())
                .filter(w => w && isValidWord(w))
        );

        console.log(`Valid source words: ${sourceWords.size}`);
        console.log(`Valid target words: ${targetWords.size}`);

        // Find missing valid words
        const missingWords = Array.from(sourceWords)
            .filter(word => !targetWords.has(word))
            .sort();

        await fs.promises.writeFile(argv.output, missingWords.join('\n'));

        console.log(`Found ${missingWords.length} missing valid words`);
        console.log(`Results written to ${argv.output}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findMissingWords();