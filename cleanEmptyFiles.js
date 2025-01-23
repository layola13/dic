import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
    .option('dir', {
        type: 'string',
        description: 'Directory to scan',
        demandOption: true
    })
    .option('ext', {
        type: 'string',
        description: 'File extension to check',
        default: '.md'
    })
    .option('minSize', {
        type: 'number',
        description: 'Minimum file size in bytes',
        default: 100
    })
    .argv;

const processFile = async (filePath, deletedCount) => {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) return deletedCount;

    const content = await fs.promises.readFile(filePath, 'utf8');
    if (content.length < argv.minSize) {
        await fs.promises.unlink(filePath);
        console.log(`Deleted: ${filePath} (size: ${content.length} bytes)`);
        return deletedCount + 1;
    }
    return deletedCount;
};

const cleanEmptyFiles = async (dir, deletedCount = 0) => {
    try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                deletedCount = await cleanEmptyFiles(fullPath, deletedCount);
            } else if (entry.name.endsWith(argv.ext)) {
                deletedCount = await processFile(fullPath, deletedCount);
            }
        }

        return deletedCount;

    } catch (error) {
        console.error(`Error processing directory ${dir}:`, error);
        return deletedCount;
    }
};

// Main execution
(async () => {
    try {
        const totalDeleted = await cleanEmptyFiles(argv.dir);
        
        console.log(`\nSummary:`);
        console.log(`Scanned directory: ${argv.dir}`);
        console.log(`File extension: ${argv.ext}`);
        console.log(`Total files deleted: ${totalDeleted}`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();