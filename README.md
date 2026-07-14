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

本项目通过 **GitHub Actions 自动构建并部署**（`vite.config.ts` 中 `base` 已设为
`/italian_learning_portal/`，构建产物托管在 `https://<user>.github.io/italian_learning_portal/`）。

> ⚠️ 不要把仓库根目录（含源代码 `index.html` 指向 `/src/main.tsx`）当作站点源，否则浏览器无法执行
> TypeScript 源码，页面会白屏。必须由 CI 构建出 `dist/` 后部署 `dist/`。

### 一次性配置

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
2. 推送代码到 `main` 分支（或到 Actions 页手动 **Run workflow**）。

### 工作流做了什么

- `npm ci` 安装依赖 → `npm run build` 执行 `tsc -b` 类型检查 + Vite 生产构建，输出到 `dist/`。
- 构建脚本会自动：
  - 将 `index.html` 复制为 `dist/404.html`，作为 **SPA fallback**（刷新/直链子路由不再 404 白屏）；
  - 通过 `public/.nojekyll` 在产物中保留 `.nojekyll`，**禁用 Jekyll**，避免以下划线 `_` 开头的资源被忽略。
- 最后通过官方 `actions/deploy-pages` 将 `dist/` 部署到 GitHub Pages。

### 注意

- 若仓库属于「用户/组织页」（`https://<user>.github.io/`，仓库名即 `<user>.github.io`），
  需把 `vite.config.ts` 的 `base` 改为 `'/'`。
- 修改 `base` 后需同步更新 `src/main.tsx` 中 `<BrowserRouter basename="...">` 的值。

## 说明

- 所有 `id`/`slug` 均为 ASCII kebab-case（小写、连字符、去重音），禁中文/空格。
- 中意双语界面，代码与文档均为中文注释。
- 移动端响应式：导航栏在窄屏折叠为抽屉菜单。
