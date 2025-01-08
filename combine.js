// const fs = require('fs');
// const path = require('path');
import fs from 'fs';
import path from 'path';

// 解析命令行参数
const args = process.argv.slice(2);
let sourceDir = '';
let extFilter = [];
let outputFile = '';

args.forEach((arg, index) => {
    if (arg === '--source') sourceDir = args[index + 1];
    if (arg === '--ext') extFilter = args[index + 1].split(',').map(ext => ext.trim().replace('*', '')); // 去掉'*'
    if (arg === '--out') outputFile = args[index + 1];
});

//print ext array

console.log(extFilter);
// 判断是否提供了所有参数
if (!sourceDir || !extFilter.length || !outputFile) {
    console.error('Usage: node combine.js --source <directory> --ext "*.h,*.cpp" --out <output-file>');
    process.exit(1);
}

// 递归遍历文件夹并筛选文件
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllFiles(filePath, fileList); // 递归子文件夹
        } else {
            const ext = path.extname(file); // 获取文件扩展名
            const baseName = path.basename(file); // 获取文件名
            
            // 检查文件是否符合扩展名要求，且不是自动生成的文件
            if (
                extFilter.includes(ext) && 
                !baseName.includes('.gen.') &&     // 排除 *.gen.cpp
                !baseName.includes('.generated.')  // 排除 *.generated.h
            ) {
                fileList.push(filePath); // 将符合条件的文件添加到列表
            }else{
                console.log('file not match: ', filePath);
            }
        }
    });
    fileList.sort((a, b) => {
        // Extract numbers from filenames using regex
        const numA = parseInt(a.match(/(\d+)\.json$/)[1]);
        const numB = parseInt(b.match(/(\d+)\.json$/)[1]);
        return numA - numB;
    });
    console.log(fileList.join('\n'));

  

    return fileList;
}

// 合并文件内容并输出到指定文件
function combineFiles(files, output) {
    const writeStream = fs.createWriteStream(output, { flags: 'w' });

    files.forEach(file => {
        const fileName = path.basename(file);
        const content = fs.readFileSync(file, 'utf-8');
        //定义文件全路径
        const fileFullPath = path.resolve(file);
        // 写入文件名注释
       // writeStream.write(`// ${fileFullPath}\n`);
        writeStream.write(content + '\n\n');
    });

    writeStream.end();
    console.log(`All files have been combined into ${output}`);
}

// 主函数
(function main() {
    const allFiles = getAllFiles(sourceDir);
    if (allFiles.length === 0) {
        console.log('No files found with the specified extensions.');
        return;
    }

    combineFiles(allFiles, outputFile);
})();
