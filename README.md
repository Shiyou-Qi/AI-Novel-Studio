# AI 小说创作工坊 (AI Novel Studio)

🚀 **AI 小说创作工坊** 是一款为网文创作者打造的 AI 辅助写作平台。它不只是"一键生成"，而是内置了一套多 Agent 创作流水线——从故事架构、大纲节奏到逐章正文，每一步都有专门的 Agent 负责打磨，目标是让 AI 写出的小说真正具备"黄金三章"抓人、悬念钩子密集、人物设定前后一致、伏笔有回收的网文爆款潜质。

## ✨ 核心特性

### 🧠 Agent 创作流水线（核心能力）

- **架构师 Agent（Architect）**：不止生成世界观和角色，还会规划贴合目标篇幅的**主角目标阶梯**（阶段性目标/阻碍/爽点）、**对立势力**分布、结合小说类型自动匹配的**类型元素**（如玄幻的金手指流、都市的扮猪吃虎），并给出多个**备选书名 + 一句话简介**，一键采用。
- **大纲/节奏 Agent（Outline & Pacing）**：为每一章标注节拍类型（铺垫/上升/爽点/悬念/反转/悬念钩子），按设定频率强制安排悬念与爽点密度，对**黄金三章**（第 1-3 章）执行更严格的开篇规则，并自动埋设与回收**伏笔**（情节线追踪）。
- **章节质量流水线**：每章正文默认经过起草 → （精品模式下）**结尾钩子医生** → **连贯性审校** → **质量评分** → 必要时**自动修订**（最多 2 轮）。
  - **快速模式**：起草 + 静默连贯性检查，速度快、成本低，仍会维护角色状态与世界观事实。
  - **精品模式**：完整流水线。结尾钩子医生专门检查本章结尾是否具备悬念/危机/反转/期待感，不合格则重写；连贯性审校对照"故事圣经"（已确立的世界观事实、角色实时状态、未回收伏笔）挑出前后矛盾；质量评分从钩子强度、节奏、爽点密度、对话自然度、show-vs-tell 五个维度打分，低于阈值自动进入修订，修订后重新评分。
  - 流水线状态、每一步的执行日志与质量分都会持久化，永不卡死——即使多轮修订后仍不达标，也会以"待人工复核"标记完成，而不是无限重试。

### 📝 创作全流程

- **智能项目管理**：设定标题、核心创意、类型、目标章节数、每章字数与创作指导。
- **深度角色系统**：角色设定（性格/外貌/动机）与运行时角色状态分离存储，"重新生成架构"不会误删已积累的角色成长记录。
- **章节大纲规划**：支持长篇分批生成（每批最多 10 章）与断点续传。
- **多格式导出**：支持 TXT、Markdown、JSON、Word (.docx)，支持单章或整本导出。
- **云端同步**：基于 Supabase 的账号体系与实时数据库，创作进度随时保存。

## 🛠️ 技术栈

- **前端框架**：[Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **后端服务**：[Supabase](https://supabase.com/)（Postgres 数据库、Auth、Row Level Security）
- **AI 引擎**：[DeepSeek API](https://www.deepseek.com/)（`deepseek-v4-flash` / `deepseek-v4-pro`），通过 [Vercel AI SDK](https://sdk.vercel.ai/)（`ai` + `@ai-sdk/openai`）统一封装结构化输出与流式生成
- **样式处理**：Tailwind CSS 4
- **UI 组件库**：shadcn/ui（基于 Radix UI）
- **数据校验**：Zod（对每个 Agent 的结构化输出做 schema 校验，异常字段自动降级为安全默认值，避免单个字段问题导致整批生成失败）

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Shiyou-Qi/AI-Novel-Studio.git
cd AI-Novel-Studio
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

在根目录创建 `.env.local` 文件，并填写以下配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY

# DeepSeek API 配置
DEEPSEEK_API_KEY=你的_DEEPSEEK_API_KEY
```

### 4. 数据库初始化

在 Supabase SQL Editor 中**按顺序**执行以下脚本以创建/升级表结构（均可安全重复执行）：

1. `scripts/001_create_tables.sql` — 基础表结构（项目、架构、角色、章节）
2. `scripts/002_agent_pipeline.sql` — Agent 流水线所需的表结构（故事圣经、角色实时状态、伏笔追踪、Agent 运行日志）

### 5. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可开始创作。

## 📁 项目结构

```text
├── app/
│   ├── api/
│   │   ├── generate-structure/  # 架构师 Agent
│   │   ├── generate-outline/    # 大纲/节奏 Agent
│   │   ├── generate-chapter/    # 起草 Agent
│   │   └── agents/              # 钩子医生 / 连贯性审校 / 质量评分 / 修订 Agent
│   ├── create/                  # 新建项目
│   ├── dashboard/                # 项目仪表盘
│   └── project/[id]/edit/       # 创作工作台
├── components/
│   ├── project/                 # 编辑器核心组件
│   └── ui/                      # shadcn/ui 基础组件
├── hooks/
│   └── use-chapter-pipeline.ts  # 章节 Agent 流水线编排
├── lib/
│   ├── ai/                      # AI 客户端、schema 校验、各 Agent 的 prompt
│   ├── genres.ts                # 类型体系（与生成流程共用同一套 slug）
│   └── supabase/                # Supabase 客户端封装
├── scripts/                     # 数据库脚本与开发调试脚本
└── styles/                      # 全局样式
```

## 🤝 联系我

如果你有任何问题、建议或合作意向，欢迎通过以下方式联系：

- **微信**: `BEISHAN5678`
- **GitHub**: [Shiyou-Qi](https://github.com/Shiyou-Qi)

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。

---

*让 AI 成为你创作的羽翼，书写读者追更不停的故事。*
