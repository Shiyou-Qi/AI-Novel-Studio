# AI 小说创作工坊 (AI Novel Studio)

🚀 **AI 小说创作工坊** 是一款专为创作者打造的 AI 辅助小说写作平台。通过集成 DeepSeek 大模型，它能帮助你从灵感一现到完成详尽的小说大纲，极大地提升创作效率。

![项目预览](public/placeholder.jpg)

## ✨ 核心特性

- 📝 **智能项目管理**：集中管理你的所有小说创意，支持设定目标字数、章节数等。
- 🌍 **AI 架构生成**：只需输入标题和核心创意，AI 即可为你生成完整的故事背景、世界观设定、核心梗概及主题。
- 📜 **章节大纲规划**：基于已生成的小说架构，AI 能自动规划每一章节的详细情节，确保故事逻辑连贯。
- 👥 **深度角色系统**：内置精细化的角色管理，支持定义性格、动机和外貌，角色信息将直接影响 AI 的大纲生成。
- 🎨 **现代 UI/UX**：基于 Next.js 16 和 Tailwind CSS 构建，拥有极致流畅的响应式体验。
- 🔐 **云端同步**：集成 Supabase 实时数据库，你的灵感永不丢失。

## 🛠️ 技术栈

- **前端框架**: [Next.js 16 (App Router)](https://nextjs.org/)
- **后端服务**: [Supabase](https://supabase.com/) (Database & Auth)
- **AI 引擎**: [DeepSeek API](https://www.deepseek.com/) (通过 [Vercel AI SDK](https://sdk.vercel.ai/) 集成)
- **样式处理**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs/)
- **UI 组件库**: [Shadcn UI](https://ui.shadcn.com/)
- **表单校验**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/qishiyou/AI-Novel-Studio.git
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

项目提供了初始化脚本，在 Supabase SQL Editor 中执行以下文件内容以创建表结构：

- `scripts/001_create_tables.sql`

### 5. 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可开始创作。

## 📁 项目结构

```text
├── app/                # Next.js 路由与 API
│   ├── api/            # AI 生成接口
│   └── project/        # 项目编辑页面
├── components/         # 可复用 React 组件
│   ├── project/        # 编辑器核心组件
│   └── ui/             # Shadcn 基础组件
├── hooks/              # 自定义 Hooks
├── lib/                # 工具函数与类型定义
├── public/             # 静态资源
├── scripts/            # 数据库脚本与测试工具
└── styles/             # 全局样式
```

## 🤝 联系我

如果你有任何问题、建议或合作意向，欢迎通过以下方式联系：

- **微信**: `BEISHAN5678`
- **GitHub**: [qishiyou](https://github.com/qishiyou)

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 协议开源。

---

*让 AI 成为你创作的羽翼，书写无限可能。*
