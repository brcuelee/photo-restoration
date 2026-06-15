# 时光修复师 - AI老照片修复工具

## 项目简介

「时光修复师」是一款基于AI技术的老照片修复工具，帮助用户一键修复珍贵的老照片，让回忆重现光彩。

## 核心功能

### 1. 基础修复
- 自动识别并去除照片中的折痕、污渍、划痕、噪点
- 保持原始照片的颗粒感、光影和纹理细节
- 修复处与周围区域自然融合，无明显修补痕迹

### 2. 高清放大
- 支持2倍或4倍超分辨率放大
- 增强清晰度，让模糊的五官和细节变清楚
- 物体边缘保持锐利，无过度处理

### 3. 智能上色
- 自动为黑白照片渲染逼真色彩
- 肤色红润自然，天空、军装等符合历史常识
- 可随时切换查看黑白/彩色效果

## 技术架构

- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Next.js API Routes
- **AI模型**: 
  - 修复: GFPGAN (tencentarc/gfpgan)
  - 放大: Real-ESRGAN (xinntao/realesrgan)
  - 上色: DeOldify (arielreplicate/deoldify_image)
- **数据库**: Vercel Postgres
- **认证**: NextAuth.js
- **部署**: Vercel

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 配置环境变量
创建 `.env.local` 文件：
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
REPLICATE_API_TOKEN=your-replicate-token
POSTGRES_URL=your-postgres-url
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 初始化数据库
```bash
curl http://localhost:3000/api/init-db
```

## 部署指南

详见 [DEPLOY.md](./DEPLOY.md)

## 项目结构

```
photo-restoration/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth.js 配置
│   │   │   ├── init-db/       # 数据库初始化
│   │   │   ├── process/       # 图片处理API
│   │   │   ├── register/      # 用户注册API
│   │   │   └── upload/        # 图片上传API
│   │   ├── login/             # 登录页面
│   │   ├── register/          # 注册页面
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页（修复工具）
│   │   └── providers.tsx      # 全局Providers
│   ├── components/
│   │   └── ui/                # shadcn/ui 组件
│   ├── lib/
│   │   ├── auth.ts            # 认证相关函数
│   │   ├── db.ts              # 数据库操作
│   │   ├── replicate.ts       # Replicate API封装
│   │   └── utils.ts           # 工具函数
│   └── types/
│       └── next-auth.d.ts     # NextAuth类型扩展
├── .env.local                 # 环境变量（本地）
├── DEPLOY.md                  # 部署文档
├── README.md                  # 项目说明
├── vercel.json               # Vercel配置
└── package.json              # 依赖配置
```

## 使用流程

1. **注册/登录**: 使用邮箱注册账户，获得3次免费试用
2. **上传照片**: 支持JPG、PNG、HEIC格式，最大20MB
3. **选择功能**: 
   - 基础修复：去除瑕疵
   - 高清放大：2x/4x放大
   - 智能上色：黑白照片上色
4. **查看效果**: 左右滑动对比原图和修复效果
5. **下载保存**: 下载修复后的高清图片

## 注意事项

1. **API Token**: 需要有效的 Replicate API Token
2. **免费额度**: 新用户有3次免费修复机会
3. **处理时间**: 单张照片通常需要15-30秒
4. **图片质量**: 建议上传清晰度较高的原图以获得最佳效果

## 后续优化

- [ ] 接入云存储服务
- [ ] 添加Google登录
- [ ] 实现付费套餐
- [ ] 批量处理功能
- [ ] 任务队列优化
- [ ] 移动端适配优化

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈。
