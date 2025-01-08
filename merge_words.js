import { promises as fs } from 'fs';

async function mergeWords() {
    try {
        const coca = await fs.readFile('./words/COCA_20000.txt', 'utf8');
        const cached = await fs.readFile('./words/cached_words6.txt', 'utf8');
        const oald = await fs.readFile('./words/OALD8_abridged_edited.txt', 'utf8');
        const oald48 = await fs.readFile('./words/e48.txt', 'utf8');
        //COCA_abridged
        const coca_abridged = await fs.readFile('./words/COCA_abridged.txt', 'utf8');

        //CET_4+6_edited.txt

        const CET_4_6 = await fs.readFile('./words/CET_4+6_edited.txt', 'utf8');

        //Highschool_edited.txt
        const Highschool = await fs.readFile('./words/Highschool_edited.txt', 'utf8');

        //小学英语大纲词汇.txt

        const ps = await fs.readFile('./words/小学英语大纲词汇.txt', 'utf8');

        //中考英语词汇表.txt

        const zks = await fs.readFile('./words/中考英语词汇表.txt', 'utf8');

        //TOEFL_abridged.txt

        const toefl = await fs.readFile('./words/TOEFL_abridged.txt', 'utf8');


        //tw.txt

        const tw = await fs.readFile('./words/tw.txt', 'utf8');

        //SUM_of_cet4+6+toefl+gre.txt

        const SUM_of_cet4_6_toefl_gre = await fs.readFile('./words/SUM_of_cet4+6+toefl+gre.txt', 'utf8');


        //TOEFL.txt

        const toefl2 = await fs.readFile('./words/TOEFL.txt', 'utf8');

        //NPEE_Wordlist.txt

        const NPEE_Wordlist = await fs.readFile('./words/NPEE_Wordlist.txt', 'utf8');

        const uniqueWords = new Map();

        // Helper function to validate and clean words
        const isValidWord = (word) => {
            // Remove any special characters except hyphens
            word = word.replace(/[^a-zA-Z-]/g, '');
            return word.length > 2 && // 长度大于2
                /^[a-zA-Z]/.test(word) && // 必须以字母开头
                /^[a-zA-Z-]+$/.test(word) && // 只包含英文字母和连字符
                !word.endsWith('-'); // 不以连字符结尾
        };

        // Process all words with validation
        [...coca.split('\n'), ...cached.split('\n')].forEach(word => {
            word = word.trim().toLowerCase().replace(/[^a-zA-Z-]/g, '');
            if (word && isValidWord(word)) uniqueWords.set(word, true);
        });

        // Process OALD words
        [...oald.split('\n'), ...oald48.split('\n'), ...coca_abridged.split('\n'), ...CET_4_6.split('\n'), ...Highschool.split('\n'), ...ps.split('\n'), ...zks.split('\n'), ...toefl.split('\n'),...toefl2.split('\n'), ...tw.split('\n'), ...SUM_of_cet4_6_toefl_gre.split('\n'),...NPEE_Wordlist.split('\n')].forEach(line => {
            let word = line.split(/\s+/)[0].trim().toLowerCase().replace(/[^a-zA-Z-]/g, '');
            if (word && isValidWord(word)) uniqueWords.set(word, true);
        });

        const sortedWords = [...uniqueWords.keys()].sort();
        await fs.writeFile('./new_word.txt', sortedWords.join('\n'), 'utf8');
        console.log(`Successfully merged words. Total unique words: ${sortedWords.length}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

mergeWords();