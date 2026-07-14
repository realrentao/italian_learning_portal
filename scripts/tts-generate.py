#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
意大利语 TTS 批量生成脚本
================================
读取 src/data 下的四个 JSON（words / verbs / exercises / idioms），
使用 edge-tts 将对应文本合成为 mp3，输出到 public/audio/{id}.mp3。

文本提取规则：
  - Word     -> 取 field "italian"
  - Verb     -> 取 field "infinitive"
  - Idiom    -> 取 field "italian"
  - Exercise -> 取正确选项文本 options[answer]["text"]
                （听力题音频播放的就是正确选项对应的词/句）

音色：默认 it-IT-ElsaNeural，可用 --voice 切换为 it-IT-IsabellaNeural 等。
      硬编码黑名单：仅允许 it-IT-* 音色，严禁 ar-AE 等非意大利语音色。

幂等：已存在的文件默认跳过；--force 可覆盖。
CLI：python scripts/tts-generate.py [--voice it-IT-ElsaNeural] [--force]

依赖：pip install edge-tts
注意：本脚本需要联网访问 Azure TTS 服务；离线环境会报错，属正常情况。
"""

import argparse
import asyncio
import json
import os
import re
import sys

try:
    import edge_tts
except ImportError:
    sys.stderr.write(
        "错误：缺少依赖 edge-tts，请先执行 `pip install edge-tts`。\n"
    )
    sys.exit(1)

# ------------------------- 路径配置 -------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(PROJECT_ROOT, "src", "data")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "public", "audio")

# 允许的音色前缀（严格限制为意大利语）
ALLOWED_VOICE_PREFIX = "it-IT-"
DEFAULT_VOICE = "it-IT-ElsaNeural"

# 安全 id 校验正则：小写字母/数字 + 连字符，不含首尾连字符、不含连续连字符
SAFE_ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def assert_safe_id(value: str) -> None:
    """校验 id 是否为合法 ASCII kebab-case，非法即报错退出。"""
    if not isinstance(value, str) or not SAFE_ID_RE.match(value):
        raise ValueError(
            f"非法 id：{value!r} 必须是小写字母/数字组成的 kebab-case，"
            "不能含大写、空格、中文或非 ASCII 字符。"
        )


def load_json(name: str):
    path = os.path.join(DATA_DIR, name)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def collect_tasks():
    """
    收集所有 (id, text) 生成任务。
    返回 [(id, text), ...]，并保证 id 合法、去重。
    """
    tasks = []

    # words.json
    for item in load_json("words.json"):
        tid = item["id"]
        assert_safe_id(tid)
        tasks.append((tid, item["italian"]))

    # verbs.json
    for item in load_json("verbs.json"):
        tid = item["id"]
        assert_safe_id(tid)
        tasks.append((tid, item["infinitive"]))

    # idioms.json
    for item in load_json("idioms.json"):
        tid = item["id"]
        assert_safe_id(tid)
        tasks.append((tid, item["italian"]))

    # exercises.json：取正确选项文本
    for item in load_json("exercises.json"):
        tid = item["id"]
        assert_safe_id(tid)
        answer = item.get("answer", 0)
        options = item.get("options", [])
        if not (0 <= answer < len(options)):
            raise ValueError(f"练习 {tid} 的 answer 下标越界")
        text = options[answer].get("text", "")
        if not text:
            raise ValueError(f"练习 {tid} 的正确选项文本为空")
        tasks.append((tid, text))

    # 去重（同一 id 只生成一次）
    seen = set()
    unique = []
    for tid, text in tasks:
        if tid in seen:
            continue
        seen.add(tid)
        unique.append((tid, text))
    return unique


async def generate_one(voice: str, tid: str, text: str, force: bool) -> str:
    """生成单个音频文件，返回状态描述。"""
    out_path = os.path.join(OUTPUT_DIR, f"{tid}.mp3")
    if os.path.exists(out_path) and not force:
        return f"跳过（已存在）: {tid}"

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(out_path)
    return f"生成成功: {tid} <- \"{text}\""


async def run(voice: str, force: bool) -> None:
    # 校验音色白名单
    if not voice.startswith(ALLOWED_VOICE_PREFIX):
        raise ValueError(
            f"非法音色 {voice!r}：仅允许 {ALLOWED_VOICE_PREFIX}* 意大利语音色，"
            "严禁 ar-AE 等非意大利语音色。"
        )

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    tasks = collect_tasks()
    print(f"共需生成 {len(tasks)} 个音频，音色={voice}")

    ok, skip, fail = 0, 0, 0
    for tid, text in tasks:
        try:
            result = await generate_one(voice, tid, text, force)
            if result.startswith("跳过"):
                skip += 1
            else:
                ok += 1
            print(f"  [{ok + skip + fail:03d}] {result}")
        except Exception as e:  # noqa: BLE001
            fail += 1
            print(f"  [失败] {tid}: {e}")

    print(f"\n完成：成功 {ok}，跳过 {skip}，失败 {fail}")
    if fail > 0:
        sys.exit(2)


def main():
    parser = argparse.ArgumentParser(description="意大利语 TTS 批量生成")
    parser.add_argument(
        "--voice",
        default=DEFAULT_VOICE,
        help=f"语音音色，默认 {DEFAULT_VOICE}（仅允许 {ALLOWED_VOICE_PREFIX}*）",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="覆盖已存在的音频文件",
    )
    args = parser.parse_args()

    try:
        asyncio.run(run(args.voice, args.force))
    except ValueError as e:
        sys.stderr.write(f"配置错误：{e}\n")
        sys.exit(1)
    except Exception as e:  # noqa: BLE001
        sys.stderr.write(f"运行错误（可能是离线无法访问 TTS 服务）：{e}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
