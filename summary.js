import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('source', {
    alias: 's',
    description: '源文件夹路径',
    type: 'string',
    demandOption: true,
  })
  .option('withnumber', {
    alias: 'n',
    description: '是否显示单词出现次数',
    type: 'boolean',
    default: false,
  })
  .option('ext', {
    alias: 'e',
    description: '要处理的文件扩展名',
    type: 'string',
    default: '.vtt',
  })
  .option('out', {
    alias: 'o',
    description: '输出文件路径',
    type: 'string',
    demandOption: true,
  })
  .help()
  .argv;

// 单词计数字典
const wordCounts = new Map();

// 验证单词的有效性
const isValidWord = (word) => {
  return (
    /^[a-zA-Z]+(-?[a-zA-Z]+)*$/.test(word) &&
    !word.includes("'") &&
    word.length >= 2 &&
    word.length <= 45
  );
};

// 处理单个 VTT 文件
const processVTTFile = async (filePath) => {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      // 跳过时间戳行和空行
      if (line.includes('-->') || !line.trim() || line === 'WEBVTT') {
        continue;
      }

      // 处理文本行
      const words = line
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(isValidWord);

      for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error);
  }
};

// 递归遍历目录
const walkDir = async (dir) => {
  try {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) {
        await walkDir(filePath);
      } else if (path.extname(file) === argv.ext) {
        console.log(`正在处理: ${filePath}`);
        await processVTTFile(filePath);
      }
    }
  } catch (error) {
    console.error(`遍历目录 ${dir} 时出错:`, error);
  }
};

// 主函数
(async () => {
  try {
    // 处理所有文件
    await walkDir(argv.source);

    // 按字母顺序和计数排序单词
    const sortedEntries = [...wordCounts.entries()].sort(([a], [b]) =>
      a.localeCompare(b)
    );

    // 格式化输出
   // 根据 withnumber 参数决定输出格式
   const output = sortedEntries
   .map(([word, count]) => argv.withnumber ? `${word} ${count}` : word)
   .join('\n');

    // 写入结果
    await fs.promises.writeFile(argv.out, output);

    console.log(`处理完成，结果已保存到 ${argv.out}`);
    console.log(`总共统计了 ${wordCounts.size} 个不同的单词。`);
  } catch (error) {
    console.error('执行过程中发生错误:', error);
    process.exit(1);
  }
})();
