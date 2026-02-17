#!/usr/bin/env node
/**
 * 网页内容爬取器
 * 提取博客/文章的正文内容
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 爬取网页内容
 * @param {string} url - 网页URL
 * @returns {Object} { title, content, text }
 */
async function fetchWebContent(url) {
  console.log(`🔍 正在爬取: ${url}`);
  
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    
    const $ = cheerio.load(response.data);
    
    // 移除脚本和样式
    $('script, style, nav, header, footer, aside, .ads, .advertisement, .comments, .sidebar').remove();
    
    // 提取标题
    let title = $('h1').first().text().trim() || 
                $('title').text().trim() || 
                '无标题';
    
    // 提取正文内容 - 尝试多种选择器
    let content = '';
    
    // 尝试常见的文章内容选择器
    const articleSelectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
      '.main-content',
      '#content',
      '.article-body'
    ];
    
    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }
    
    // 如果没找到，尝试获取 body
    if (!content || content.length < 100) {
      content = $('body').text();
    }
    
    // 清理文本
    content = cleanText(content);
    
    console.log(`✅ 标题: ${title}`);
    console.log(`✅ 内容长度: ${content.length} 字符`);
    
    return {
      title,
      content,
      url,
      fetchedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ 爬取失败: ${error.message}`);
    throw error;
  }
}

/**
 * 清理文本
 * @param {string} text - 原始文本
 * @returns {string} 清理后的文本
 */
function cleanText(text) {
  return text
    // 移除多余空白
    .replace(/\s+/g, ' ')
    // 移除特殊字符（保留中文、英文、数字、常用标点）
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s.,!?;:()（）【】《》"'"、，。！？；：""''【】《》]/g, '')
    // 移除首尾空白
    .trim();
}

/**
 * 提取文本摘要（用于音频）
 * @param {string} content - 完整内容
 * @param {number} maxLength - 最大长度
 * @returns {string}
 */
function extractSummary(content, maxLength = 2000) {
  if (content.length <= maxLength) {
    return content;
  }
  
  // 在句号、逗号处截断
  const truncated = content.substring(0, maxLength);
  const lastPeriod = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('，'),
    truncated.lastIndexOf(',')
  );
  
  if (lastPeriod > maxLength * 0.5) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  return truncated + '...';
}

/**
 * 命令行接口
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
网页内容爬取器

用法:
  node web-scraper.js <URL> [选项]

选项:
  --output, -o <文件>  保存JSON结果到文件
  --text, -t          只输出文本内容
  --max <数字>        最大字符数（默认2000）

示例:
  node web-scraper.js "https://example.com/article"
  node web-scraper.js "https://example.com/article" --max 3000
  node web-scraper.js "https://example.com/article" -o result.json
`);
    return;
  }
  
  const url = args[0];
  let outputFile = null;
  let outputTextOnly = false;
  let maxLength = 2000;
  
  // 解析选项
  for (let i = 1; i < args.length; i++) {
    if ((args[i] === '--output' || args[i] === '-o') && args[i + 1]) {
      outputFile = args[i + 1];
      i++;
    } else if (args[i] === '--text' || args[i] === '-t') {
      outputTextOnly = true;
    } else if ((args[i] === '--max' || args[i] === '-m') && args[i + 1]) {
      maxLength = parseInt(args[i + 1]);
      i++;
    }
  }
  
  try {
    const result = await fetchWebContent(url);
    
    if (outputTextOnly) {
      console.log('\n========== 文本内容 ==========\n');
      console.log(extractSummary(result.content, maxLength));
    } else {
      const summary = extractSummary(result.content, maxLength);
      console.log('\n========== 摘要 ==========\n');
      console.log(summary);
      
      if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify({
          ...result,
          summary
        }, null, 2));
        console.log(`\n✅ 已保存到: ${outputFile}`);
      }
    }
    
  } catch (error) {
    console.error('失败:', error.message);
    process.exit(1);
  }
}

module.exports = { fetchWebContent, extractSummary, cleanText };

if (require.main === module) {
  main();
}
