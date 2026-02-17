#!/usr/bin/env python3
"""
Edge TTS 音频生成器
将文字转为语音
"""

import asyncio
import os
import sys
import argparse
from datetime import datetime
import edge_tts

# 输出目录
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 可用的中文声音
VOICES = {
    'zh-CN-XiaoxiaoNeural': '晓晓（女声）',
    'zh-CN-YunxiNeural': '云希（男声）',
    'zh-CN-YunyangNeural': '云扬（男声）',
    'zh-CN-XiaoxiaoMultilingualNeural': '晓晓（多语言）',
}


async def text_to_speech(text: str, voice: str = 'zh-CN-XiaoxiaoNeural', output_file: str = None):
    """将文字转为语音"""
    if not output_file:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = os.path.join(OUTPUT_DIR, f'audio-{timestamp}.mp3')
    
    print(f"🎵 正在生成音频...")
    print(f"   文字: {text[:50]}...")
    print(f"   声音: {VOICES.get(voice, voice)}")
    print(f"   输出: {output_file}")
    
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)
    
    print(f"✅ 音频生成完成: {output_file}")
    return output_file


async def list_voices():
    """列出所有可用的声音"""
    voices = await edge_tts.list_voices()
    print("\n📢 可用的中文声音:")
    print("-" * 60)
    for v in voices:
        if v['ShortName'].startswith('zh-CN'):
            print(f"  {v['ShortName']:<40} - {v['FriendlyName']}")
    print("-" * 60)


async def main():
    parser = argparse.ArgumentParser(description='Edge TTS 音频生成器')
    parser.add_argument('text', nargs='?', help='要转换的文字')
    parser.add_argument('--voice', '-v', default='zh-CN-XiaoxiaoNeural', help='声音名称')
    parser.add_argument('--output', '-o', help='输出文件路径')
    parser.add_argument('--list', '-l', action='store_true', help='列出所有声音')
    
    args = parser.parse_args()
    
    if args.list:
        await list_voices()
        return
    
    if not args.text:
        print("""
Edge TTS 音频生成器

用法:
  python tts-generator.py "<文字内容>" [选项]

选项:
  --voice, -v <声音>   选择声音 (默认: zh-CN-XiaoxiaoNeural)
  --output, -o <文件>  输出文件路径
  --list, -l           列出所有可用的声音

示例:
  python tts-generator.py "你好，这是一个测试"
  python tts-generator.py "你好" -v zh-CN-YunxiNeural -o hello.mp3
""")
        return
    
    try:
        result = await text_to_speech(args.text, args.voice, args.output)
        print(f"\n🎉 完成！音频文件: {result}")
    except Exception as e:
        print(f"生成失败: {e}")
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
