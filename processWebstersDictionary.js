import fs from 'fs';
import path from 'path';

const processWebstersDictionary = async () => {
    try {
        // Read JSON file
        const jsonContent = await fs.promises.readFile(
            path.join('./dics', 'dictionary.json'), 
            'utf8'
        );
        
        const dictionary = JSON.parse(jsonContent);
        const wordMap = new Map();

        // Process each dictionary entry
        dictionary.forEach(entry => {
            if (entry.word) {
                // Split on semicolon and process each word
                const words = entry.word.split(';').map(w => w.trim());
                words.forEach(word => {
                    if (word) {
                        wordMap.set(word.toLowerCase(), entry.word);
                    }
                });
            }
        });

        // Ensure output directory exists
        if (!fs.existsSync('./words')) {
            fs.mkdirSync('./words');
        }

        // Export word list
        const wordList = Array.from(wordMap.keys())
            .sort()
            .join('\n');

        await fs.promises.writeFile(
            './words/webstersDictionary.txt',
            wordList
        );

        console.log(`Processed ${dictionary.length} entries`);
        console.log(`Exported ${wordMap.size} unique words`);

    } catch (error) {
        console.error('Error processing dictionary:', error);
    }
};

// Execute
processWebstersDictionary();