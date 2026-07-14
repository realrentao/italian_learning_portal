# 意大利语学习门户 · Italian Learning Portal

一个纯静态的意大利语学习单页应用（SPA），包含四大模块：**词汇**、**动词变位**、**听力练习**、**习语**。全部数据随包内置，无需后端，可完全离线运行。

## 技术栈

- **构建**：Vite 5 + TypeScript 5
- **框架**：React 18
- **UI**：MUI 5（@mui/material、@mui/icons-material，Emotion）+ Tailwind CSS 3（仅布局）
- **路由**：react-router-dom 6（BrowserRouter，`basename="/italian_learning_portal"` 适配 GitHub Pages）
- **音频**：原生 `HTMLAudioElement`，封装为全局单例 `AudioPlayerContext`，无第三方音频库
- **状态**：`useState` + React Context（收藏、播放器），无 Redux/Zustand
- **数据**：静态 JSON 随包 `import`，`resolveJsonModule` 开启，天然离线

## 目录结构

```
italian_learning_portal/
├── index.html
├── package.json
├── vite.config.ts          # 含 @/ 别名与 base 子路径
├── tsconfig.json           # 方案文件，引用 app / node
├── tsconfig.app.json       # 应用编译配置（strict 开启）
├── tsconfig.node.json      # vite.config 编译配置
├── tailwind.config.js      # 关闭 preflight，与 MUI 共存
├── postcss.config.js
├── scripts/
│   ├── tts-generate.py     # edge-tts 批量生成音频（幂等）
│   └── gen_verbs.py        # 动词变位数据生成器（含校验）
├── public/audio/           # 预生成 mp3（git 跟踪 .gitkeep）
└── src/
    ├── main.tsx            # 入口：Theme + Router + 全局 Context
    ├── App.tsx             # 路由骨架
    ├── vite-env.d.ts
    ├── types/index.ts      # Word/Verb/Exercise/Idiom 接口
    ├── data/               # words / verbs / exercises / idioms 种子数据
    ├── utils/              # slug.ts（id 校验）、audio.ts（音频 URL）
    ├── context/            # AudioPlayerContext、FavoritesContext
    ├── components/         # Layout/NavBar/Footer/PlayButton/卡片/矩阵/工具
    └── pages/              # Home/Vocabulary/Verb/Exercise/Idiom
```

## 本地开发

```bash
npm install
npm run dev          # 启动开发服务器
npm run build        # 类型检查 + 生产构建（tsc -b && vite build）
npm run preview      # 预览构建产物
```

## 生成发音音频（可选）

音频文件默认不随仓库分发（需联网生成）。提供 `scripts/tts-generate.py` 使用 `edge-tts` 批量生成：

```bash
pip install edge-tts
npm run tts                       # 默认音色 it-IT-ElsaNeural
python scripts/tts-generate.py --voice it-IT-IsabellaNeural --force
```

- 文件名与数据 `id` 一致（如 `parlare.mp3`），运行时通过
  `${import.meta.env.BASE_URL}audio/${id}.mp3` 访问。
- 音色严格限制为 `it-IT-*`，硬编码黑名单拒绝非意大利语音色。
- 已存在文件默认跳过，`--force` 覆盖；脚本可重复执行（幂等）。
- **离线环境会报错属正常现象**，不影响前端构建与运行（仅缺音频时发音按钮无声音）。

## 动词变位数据

`src/data/verbs.json` 含 30 个常用动词的 7 大语式变位，由 `scripts/gen_verbs.py`
规则生成 + 不规则动词显式校对，生成时校验人称数并断言 id 合法。如需重新生成：

```bash
python scripts/gen_verbs.py
```

## 部署到 GitHub Pages

`vite.config.ts` 已设置 `base: '/italian_learning_portal/'`，构建产物可直接托管在
`https://<user>.github.io/italian_learning_portal/` 下。

## 说明

- 所有 `id`/`slug` 均为 ASCII kebab-case（小写、连字符、去重音），禁中文/空格。
- 中意双语界面，代码与文档均为中文注释。
- 移动端响应式：导航栏在窄屏折叠为抽屉菜单。
