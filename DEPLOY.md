# 时光修复师 - 部署指南

## 项目概述

AI老照片修复工具，支持：
- 基础修复（去除折痕、污渍、划痕）
- 高清放大（2倍/4倍超分辨率）
- 智能上色（黑白照片转彩色）

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS
- Vercel Postgres 数据库
- Replicate AI API
- 自定义认证系统

## 部署步骤

### 1. 准备环境变量

在 Vercel 控制台或本地 `.env.local` 中配置以下环境变量：

```env
# Replicate API Token (必需)
# 获取方式：访问 https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Vercel Postgres 数据库 (必需)
# 获取方式：在 Vercel 控制台创建 Postgres 数据库
POSTGRES_URL=your_postgres_connection_string
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url

# NextAuth Secret (用于加密)
NEXTAUTH_SECRET=your_random_secret_key
```

### 2. 部署到 Vercel

#### 方式一：通过 Git 部署（推荐）

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 控制台导入项目
3. 配置环境变量
4. 点击部署

#### 方式二：通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 3. 初始化数据库

首次部署后，访问以下 URL 初始化数据库表：

```
https://your-domain.com/api/init-db
```

### 4. 验证部署

访问首页，测试以下功能：
1. 用户注册
2. 用户登录
3. 上传图片
4. 选择修复功能
5. 下载修复后的图片

## 文件结构

```
photo-restoration/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts          # 登录认证
│   │   │   ├── register/route.ts      # 用户注册
│   │   │   ├── process/route.ts       # AI处理
│   │   │   ├── upload/route.ts        # 图片上传
│   │   │   └── init-db/route.ts       # 数据库初始化
│   │   ├── page.tsx                    # 首页
│   │   ├── login/page.tsx             # 登录页
│   │   ├── register/page.tsx          # 注册页
│   │   ├── layout.tsx                 # 根布局
│   │   ├── globals.css                # 全局样式
│   │   └── providers.tsx              #  providers
│   ├── lib/
│   │   ├── auth.ts                    # 认证工具
│   │   ├── db.ts                      # 数据库工具
│   │   └── replicate.ts               # Replicate API
│   ├── components/ui/                  # UI组件
│   └── types/
│       └── next-auth.d.ts             # 类型定义
├── .env.local                         # 环境变量
├── next.config.ts                     # Next.js配置
├── vercel.json                        # Vercel配置
└── package.json                       # 依赖
```

## 注意事项

1. **Replicate API Token**：必须配置有效的 Replicate API Token，否则 AI 处理功能无法使用
2. **数据库**：首次使用需要访问 `/api/init-db` 初始化数据库表
3. **免费次数**：新用户默认有 3 次免费使用次数
4. **图片格式**：支持 JPG、PNG、HEIC，最大 20MB
5. **处理时间**：AI 处理通常需要 15-30 秒

## 故障排查

### 构建失败
- 检查 Node.js 版本 >= 18
- 删除 `node_modules` 和 `.next` 目录后重新安装依赖

### API 调用失败
- 检查 `REPLICATE_API_TOKEN` 是否有效
- 检查数据库连接字符串是否正确

### 数据库错误
- 确保已访问 `/api/init-db` 初始化数据库
- 检查 Postgres 连接字符串是否正确

## 技术说明

### 认证系统
项目使用自定义认证系统（非 NextAuth.js）：
- 用户注册时密码使用 bcrypt 加密存储
- 登录成功后返回用户信息，前端存储在 localStorage
- API 调用时通过 `x-user-email` 请求头传递用户身份

### AI 模型
- **基础修复**：tencentarc/gfpgan (GFPGAN)
- **高清放大**：xinntao/realesrgan (Real-ESRGAN)
- **智能上色**：arielreplicate/deoldify_image (DeOldify)

### 数据库表
- **users**：用户表（id, email, password, name, free_credits, created_at, updated_at）
- **images**：图片处理记录表（id, user_id, original_url, restored_url, upscaled_url, colorized_url, operation, scale, status, created_at, updated_at）
