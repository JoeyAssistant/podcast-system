# Podcast 学习助手

将文字或网页内容转换为音频，方便随时收听学习。

## 功能特性

- 📝 **文字转音频** - 输入任意文字，一键生成语音
- 🌐 **网页转音频** - 粘贴博客/文章链接，自动提取内容生成音频
- 🎤 **多种声音** - 支持多种中文语音（晓晓、云希、云扬）
- 📚 **历史记录** - 自动保存生成历史
- 🎧 **在线播放** - 生成后直接播放

## 快速开始

### 1. 安装依赖

```bash
cd podcast-system
npm install
```

### 2. 安装 Python 依赖

```bash
pip install edge-tts
```

### 3. 启动服务

```bash
npm start
```

### 4. 访问

打开浏览器访问：`http://49.235.45.173:3000/podcast.html`

## 项目结构

```
podcast-system/
├── server.js          # Express 服务器
├── public/
│   └── podcast.html   # 前端界面
├── cli/
│   ├── tts-generator.py   # Edge TTS 音频生成
│   ├── web-scraper.js     # 网页内容爬取
│   └── minimax.js         # MiniMax API 集成
├── package.json
└── README.md
```

## API 接口

### 生成音频（文字）

```bash
POST /api/tts/generate
Content-Type: application/json

{
  "text": "你好，这是测试",
  "voice": "zh-CN-XiaoxiaoNeural"
}
```

### 生成音频（网页）

```bash
POST /api/tts/generate-from-url
Content-Type: application/json

{
  "url": "https://example.com/article",
  "voice": "zh-CN-XiaoxiaoNeural",
  "maxLength": 2000
}
```

### 获取历史列表

```bash
GET /api/tts/list
```

## 使用截图

![界面预览](https://via.placeholder.com/800x400?text=Podcast+助手)

## 技术栈

- **前端**: HTML + CSS + JavaScript
- **后端**: Node.js + Express
- **TTS**: Edge TTS（微软语音合成）
- **爬虫**: Cheerio + Axios
- **浏览器**: Playwright

## License

MIT

## 作者

Joey Assistant
