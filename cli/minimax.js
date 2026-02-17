#!/usr/bin/env node
/**
 * MiniMax LLM 调用
 */

const axios = require('axios');
const fs = require('fs');

// API 配置
const API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';
const API_KEY = 'sk-cp-JDpys3TdHoH-PttIbrK8xs48LbRXKT1ntCf8HPHujtpS3sPoKxDZ8-W59cJolZa7niQqGK108sG_GS9SFrfwMTk7NC6DmPN1CrqaK09bSWxBYFqpLyKgFMc';

/**
 * 调用 MiniMax 生成内容
 * @param {string} prompt - 提示词
 * @returns {string} - 生成的文本
 */
async function callLLM(prompt) {
  console.log('🤖 调用 MiniMax...');
  
  try {
    const response = await axios.post(API_URL, {
      model: 'MiniMax-Text-01',
      messages: [
        {
          role: 'system',
          content: '你是一个知识总结助手，用通俗易懂的中文总结技术文章。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = response.data.choices[0].message.content;
    console.log('✅ MiniMax 响应成功');
    return result;
    
  } catch (error) {
    console.error('❌ MiniMax 调用失败:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * 总结文章
 * @param {string} articleText - 文章内容
 * @returns {string} - 总结后的中文文本
 */
async function summarizeArticle(articleText) {
  const prompt = `
请阅读以下英文技术文章，用通俗易懂的中文进行总结。

要求：
1. 用简单直白的中文表达
2. 保留核心概念和关键细节
3. 如果有代码示例，解释代码的作用
4. 总长度控制在 1500-2000 字

文章内容：
${articleText.substring(0, 8000)}
`;
  
  return await callLLM(prompt);
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
MiniMax LLM 调用工具

用法:
  node minimax.js "<提示词>"

示例:
  node minimax.js "用中文总结：人工智能是..."
`);
    return;
  }
  
  const prompt = args.join(' ');
  const result = await callLLM(prompt);
  console.log('\n📝 结果:\n');
  console.log(result);
}

module.exports = { callLLM, summarizeArticle };

if (require.main === module) {
  main().catch(console.error);
}
