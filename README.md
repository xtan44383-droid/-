# 商品素材图生成工具 — 电商视觉生成

基于 **Claude Agent SDK** 构建的电商视觉生成 Web 应用。用户输入商品链接或产品描述，AI 自动匹配 25 个电商场景模板，调用 GPT-Image-2 API 直接生成商品图片。

## 架构

```
用户浏览器 (React + Tailwind)
    ↕ WebSocket + REST API
Express Server (port 3006)
    ↕ Claude Agent SDK
Claude AI + ecom-details-image Skill
    ↕ Bash (Node 脚本)
GPT-Image-2 API (OpenAI 兼容)
```

## 核心功能

- **25 个场景模板** — 白底主图、场景图、平铺图、细节微距、海报、社媒、UGC、模特展示、信息图、爆炸图等
- **Prompt 质量规范** — hex 颜色码强制指定、数字占比控制、否定词清单、平台预留空间，保障输出一致性
- **Campaign Style Lock** — 多图任务自动锁定色板、冷暖调、字体、背景、光线，确保系列图片风格一致
- **WebSocket 实时推送** — 前端展示各阶段状态（模板匹配 → 文案生成 → 图片渲染 → 完成）
- **完整 PDP 图片包** — 5 张主图 + 7-9 张详情页信息图，一键生成
- **图片画廊** — 左侧边栏展示生成图片的缩略图，点击放大预览
- **参考产品图** — 上传产品照片传入 `--image` 参数，提升生图一致性
- **执行日志** — 右侧面板显示工具调用实时状态

## 25 个场景模板

| # | 模板 | 触发词 | # | 模板 | 触发词 |
|---|------|--------|---|------|--------|
| 01 | 白底主图 | 白底图、主图 | 14 | 套装组合 | 套装、组合 |
| 02 | 场景图 | 场景图、lifestyle | 15 | 直播图 | 直播 |
| 03 | 平铺图 | 平铺图、俯拍 | 16 | 虚拟试穿 | 试穿、融入 |
| 04 | 细节微距 | 细节图、微距 | 17 | 爆炸图 | 拆解图、爆炸图 |
| 05 | 海报横幅 | 海报、banner | 18 | 隐形模特 | 隐形模特、3D服装 |
| 06 | 社交媒体 | 小红书、Instagram | 19 | 多角度网格 | 多角度、网格 |
| 07 | UGC风格 | UGC、买家秀 | 20 | 杂志封面 | 杂志、editorial |
| 08 | 模特展示 | 模特、人物展示 | 21 | 季节营销 | 季节、campaign |
| 09 | 前后对比 | 对比、before after | 22 | 奢华氛围 | 奢华、氛围 |
| 10 | 包装礼盒 | 包装、礼盒 | 23 | 设备模型 | mockup、SaaS |
| 11 | 信息图 | A+、详情页 | 24 | 店铺空间 | 店铺、门面 |
| 12 | 创意概念 | 创意、概念 | 25 | 运动健身 | 运动、健身 |
| 13 | 尺寸规格 | 尺寸、规格 | | | |

## 技术栈

- **后端**: Express + WebSocket + Claude Agent SDK
- **前端**: React 18 + Tailwind CSS 4 + Vite 6
- **图片生成**: GPT-Image-2 (OpenAI 兼容)
- **模板**: 25 个 JSON 场景模板
- **脚本**: Node.js 图片生成脚本

## 快速开始

### 1. 安装依赖

```bash
cd ecom-image-chat
npm install
```

### 2. 配置环境变量

根目录 `.env`：

```env
ANTHROPIC_API_KEY=your-api-key
PORT=3006
```

图片生成 API 配置 `.claude/skills/ecom-details-image/.env`：

```env
IMG_BASE_URL=https://api.openai.com/v1
IMG_MODEL=gpt-image-2
IMG_API_KEY=your-api-key
```

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器访问 Vite 显示的地址（自动代理到 3006 端口）。

### 4. 生产构建

```bash
npm run build
npm start
```

## 项目结构

```
ecom-image-chat/
├── .claude/skills/
│   └── ecom-details-image/          # 电商视觉生成技能
│       ├── SKILL.md                  # 技能定义（Prompt 工程体系）
│       ├── .env                      # 图片生成 API 配置
│       ├── scripts/
│       │   ├── generate-image.mjs    # 图片生成脚本 (Node.js)
│       │   └── generate_image.py     # (旧版 Python 脚本，可选删除)
│       └── references/
│           └── templates/            # 25 个场景模板 (JSON)
├── server/
│   ├── index.ts                      # Express + WebSocket (port 3006)
│   ├── agent-client.ts               # SDK 封装 + systemPrompt
│   ├── message-queue.ts              # 异步消息队列
│   └── logger.ts                     # 文件日志
├── src/
│   ├── App.tsx                       # 三栏布局（图片画廊+对话+执行日志）
│   ├── types.ts                      # TypeScript 类型定义
│   └── hooks/
│       ├── useWebSocket.ts           # WebSocket 连接管理
│       └── useFileUpload.ts          # 文件上传管理
├── generated-images/                 # 生成图片输出（自动创建）
├── uploads/                          # 上传文件（自动创建）
└── package.json
```

## 使用方法

1. 打开浏览器，看到欢迎页面和模板卡片
2. 描述你的产品和图片需求，例如：
   - 「帮我生成一款蓝牙耳机的白底主图」
   - 「帮我生成完整的咖啡杯 PDP 详情页图片」
   - 「帮我做一组小红书风格的护肤品产品图」
3. AI 自动匹配场景模板，调用 API 生成图片
4. 左侧图片画廊自动展示生成的图片，点击可放大预览
5. 可上传产品参考照片（jpg/png），AI 会用 `--image` 参数提升一致性

## 支持的图片尺寸

`1:1`、`3:2`、`2:3`、`4:3`、`3:4`、`5:4`、`4:5`、`16:9`、`9:16`、`2:1`、`1:2`、`21:9`、`9:21`

## 注意事项

- 生成脚本需要 Node.js 18+ (内置 fetch)
- 单张图约 15-30 秒，整套 PDP 可能需要数分钟
- 中文字在图片中准确率约 95%，建议放大 200% 核对笔画，复杂字换简单同义字
- 详情页图片为电商信息图格式（含标题、图标、标签、卖点），非纯产品照片

