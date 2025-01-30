import fs from 'fs/promises';
import path from 'path';

async function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

async function findJsonBoundaries(content) {
    let start = content.indexOf('{');
    if (start === -1) return null;

    let openBraces = 0;
    let end = start;

    for (let i = start; i < content.length; i++) {
        if (content[i] === '{') openBraces++;
        if (content[i] === '}') openBraces--;
        if (openBraces === 0) {
            end = i + 1;
            break;
        }
    }

    const jsonContent = content.substring(start, end);
    if (await isValidJson(jsonContent)) {
        return { start, end, json: jsonContent };
    }
    return null;
}

async function fixMdFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Skip if already has ```json markers
    if (content.includes('```json')) {
        return false;
    }

    const jsonBoundaries = await findJsonBoundaries(content);
    if (!jsonBoundaries) {
        return false;
    }

    const { start, end, json } = jsonBoundaries;
    const beforeJson = content.substring(0, start);
    const afterJson = content.substring(end);

    const newContent = `${beforeJson}
\`\`\`json
${json}
\`\`\`
${afterJson}`;

    await fs.writeFile(filePath, newContent);
    return true;
}

async function main() {
    const dir = process.argv[2];
    if (!dir) {
        console.error('Please provide directory path');
        process.exit(1);
    }

    const files = await fs.readdir(dir);
    let fixed = 0;

    for (const file of files) {
        if (file.endsWith('.md')) {
            const filePath = path.join(dir, file);
            if (await fixMdFile(filePath)) {
                console.log(`Fixed: ${file}`);
                fixed++;
            }
        }
    }

    console.log(`\nTotal files fixed: ${fixed}`);
}

main().catch(console.error);
