#!/usr/bin/env node
/**
 * Podcast 学习助手 - 独立服务器
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Redirect root to index
app.get('/', (req, res) => res.redirect('/podcast.html'));

// Static files
app.use(express.static('public'));

// ============== TTS API ==============

// Generate audio from text
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const voiceArg = voice || 'zh-CN-XiaoxiaoNeural';
    
    // Run Python TTS script
    const result = await new Promise((resolve, reject) => {
      const child = spawn('python3', [
        path.join(__dirname, 'cli', 'tts-generator.py'),
        text,
        '--voice', voiceArg,
        '--output', ''
      ], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });
      
      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });
      
      child.on('error', reject);
    });
    
    // Extract filename from output
    const match = result.stdout.match(/audio-[0-9_]+\.mp3/);
    if (match) {
      const filename = match[0];
      res.json({ 
        success: true, 
        audioUrl: `/audio/${filename}`,
        filename
      });
    } else {
      res.status(500).json({ error: 'Failed to generate audio' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get list of generated audio files
app.get('/api/tts/list', async (req, res) => {
  try {
    const audioDir = path.join(__dirname, 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      return res.json({ items: [] });
    }
    
    const files = fs.readdirSync(audioDir)
      .filter(f => f.endsWith('.mp3'))
      .map(f => {
        const filePath = path.join(audioDir, f);
        const stats = fs.statSync(filePath);
        return {
          filename: f,
          url: `/audio/${f}`,
          createdAt: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ items: files });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get available voices
app.get('/api/tts/voices', async (req, res) => {
  res.json({
    items: [
      { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓（女声）' },
      { id: 'zh-CN-YunxiNeural', name: '云希（男声）' },
      { id: 'zh-CN-YunyangNeural', name: '云扬（男声）' },
      { id: 'zh-CN-XiaoxiaoMultilingualNeural', name: '晓晓（多语言）' }
    ]
  });
});

// Generate audio from URL (webpage to audio)
app.post('/api/tts/generate-from-url', async (req, res) => {
  try {
    const { url, voice, maxLength } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`正在爬取网页: ${url}`);
    
    // 动态导入 web-scraper
    const { fetchWebContent, extractSummary } = require('./cli/web-scraper');
    
    // 爬取网页内容
    const content = await fetchWebContent(url);
    
    // 提取音频文本（默认2000字符）
    const text = extractSummary(content.content, maxLength || 2000);
    
    console.log(`已提取文本: ${text.length} 字符`);
    
    // 生成音频
    const voiceArg = voice || 'zh-CN-XiaoxiaoNeural';
    
    const result = await new Promise((resolve, reject) => {
      const child = spawn('python3', [
        path.join(__dirname, 'cli', 'tts-generator.py'),
        text,
        '--voice', voiceArg,
        '--output', ''
      ], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });
      
      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });
      
      child.on('error', reject);
    });
    
    // 提取文件名
    const match = result.stdout.match(/audio-[0-9_]+\.mp3/);
    if (match) {
      const filename = match[0];
      res.json({ 
        success: true, 
        audioUrl: `/audio/${filename}`,
        filename,
        title: content.title,
        textLength: text.length
      });
    } else {
      res.status(500).json({ error: 'Failed to generate audio' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============== Start Server ==============
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Podcast 学习助手运行中: http://0.0.0.0:${PORT}`);
  console.log(`访问: http://49.235.45.173:${PORT}/podcast.html`);
});
