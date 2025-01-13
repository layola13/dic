import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .option('input', {
        type: 'string',
        description: 'Input file path',
        demandOption: true
    })
    .option('output', {
        type: 'string',
        description: 'Output file path',
        default: 'deduplicated.txt'
    })
    .argv;

const processLine = (line) => {
    const firstSpaceIndex = line.indexOf(' ');
    if (firstSpaceIndex === -1) return null;

    const word = line.substring(0, firstSpaceIndex).trim();
    let content = line.substring(firstSpaceIndex).trim();

    // If no pronunciation brackets, add empty ones
    if (!content.includes('[')) {
        const posIndex = content.indexOf('adj.') || content.indexOf('n.') || content.indexOf('v.');
        if (posIndex !== -1) {
            content = `[] ${content}`;
        }
    }

    return {
        word,
        content: `${word} ${content}`
    };
};

const deduplicateFile = async () => {
    try {
        const content = await fs.promises.readFile(argv.input, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        const wordMap = new Map();
        
        for (const line of lines) {
            const parsed = processLine(line);
            if (parsed) {
                wordMap.set(parsed.word.toLowerCase(), parsed.content);
            }
        }

        const output = Array.from(wordMap.values()).sort().join('\n');
        await fs.promises.writeFile(argv.output, output);

        console.log(`Original entries: ${lines.length}`);
        console.log(`Unique words: ${wordMap.size}`);
        console.log(`Output saved to: ${argv.output}`);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

deduplicateFile();