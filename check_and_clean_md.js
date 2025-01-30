// const fs = require('fs').promises;
// const path = require('path');
import fs from 'fs/promises';
import path from 'path';

async function findMdFiles(dir) {
	    const files = await fs.readdir(dir, { withFileTypes: true });
	    const mdFiles = [];

	    for (const file of files) {
		            const fullPath = path.join(dir, file.name);
		            if (file.isDirectory()) {
				                mdFiles.push(...(await findMdFiles(fullPath)));
				            } else if (file.name.endsWith('.md')) {
						                mdFiles.push(fullPath);
						            }
		        }
	    return mdFiles;
}
async function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

async function hasJsonContent(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Strip markdown front matter if present
    const cleanContent = content.replace(/^---[\s\S]*?---\n/, '').trim();
    
    // First try to parse the entire content as JSON
    try {
        JSON.parse(cleanContent);
        return true;
    } catch {
        // If not valid JSON, continue with other checks
    }

    // Check for explicitly marked JSON
    if (content.includes('```json') && content.includes('```')) {
        return true;
    }

    // Check for any code blocks that might contain JSON
    const codeBlocks = content.match(/```([\s\S]*?)```/g) || [];
    for (const block of codeBlocks) {
        const codeContent = block.replace(/```/g, '').trim();
        try {
            JSON.parse(codeContent);
            return true;
        } catch {
            continue;
        }
    }

    return false;
}

async function main() {
    if (process.argv.length < 3) {
        console.error('Please provide a directory path');
        console.error('Usage: node check_and_clean_md.js <dir> [--dry-run]');
        process.exit(1);
    }

    const targetDir = process.argv[2];
    const isDryRun = process.argv.includes('--dry-run');
    const deletedFiles = [];
    const backupDir = path.join(targetDir, '_deleted_backup_' + Date.now());

    try {
        const mdFiles = await findMdFiles(targetDir);
        console.log(`Found ${mdFiles.length} MD files`);

        // Create backup directory
        if (!isDryRun) {
            await fs.mkdir(backupDir, { recursive: true });
        }

        for (const file of mdFiles) {
            const hasJson = await hasJsonContent(file);
            if (!hasJson) {
                console.log(`${isDryRun ? '[DRY RUN] Would delete' : 'Deleting'}: ${file}`);
                if (!isDryRun) {
                    // Backup file
                    const backupPath = path.join(backupDir, path.basename(file));
                    await fs.copyFile(file, backupPath);
                    // Delete file
                    await fs.unlink(file);
                    deletedFiles.push(file);
                }
            }
        }

        console.log('\nSummary:');
        console.log(`${isDryRun ? 'Would delete' : 'Deleted'}: ${deletedFiles.length} files`);
        if (!isDryRun && deletedFiles.length > 0) {
            console.log(`Backup created at: ${backupDir}`);
        }

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
