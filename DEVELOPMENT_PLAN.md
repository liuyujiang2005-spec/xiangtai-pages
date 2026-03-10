# 达人短视频分发 APP - 开发计划书

> 基于思维导图整理 | 计划已确认 | 待执行

---

## 一、项目概述

**项目名称**：达人短视频分发 APP  
**核心定位**：连接客户、达人与管理员的短视频任务分发与数据管理平台  
**技术偏好**：通过 API 调用直接获取短视频数据呈现在 APP 中

### 已确认技术选型

| 项目 | 选型 |
|------|------|
| **前端** | Vue 3 + Vite |
| **后端** | 自建后端 |
| **用户体系** | 三端各自独立登录（Admin / Client / Influencer 三套独立账号） |

---

## 二、三端架构与核心模块

| 端口 | 角色 | 核心职责 |
|------|------|----------|
| **管理员端** | Admin | 审核、积分管理、云端链接、AI 解析 |
| **客户端** | Client | 视频管理、下载、积分充值、API 数据展示 |
| **达人端** | Influencer | 接任务、上传视频、产品类型选择 |

---

## 三、详细开发步骤清单（To-do List）

### 阶段 0：前期准备 ✅ 已完成
- [x] **0.1** 技术栈：Vue 3 + Vite + 自建后端
- [x] **0.2** API 数据源：自建后端提供
- [ ] **0.3** 业务细节待后续迭代澄清（露脸/讲解视频区分、兼职绑定、按组下载规则）

---

### 阶段 1：MVP 基础架构（第一阶段）

#### 1.1 项目初始化 ✅
- [x] **1.1.1** 创建项目目录结构
- [x] **1.1.2** 配置开发环境（Vue 3 + Vite、Pinia、Vue Router、Axios）
- [x] **1.1.3** 配置路由与三端入口（Admin / Client / Influencer）

#### 1.2 通用基础设施 ✅
- [x] **1.2.1** 设计并实现 API 服务层（统一请求、鉴权、错误处理）
- [x] **1.2.2** 实现用户认证与角色权限（三端独立登录、登出、Token 管理）
- [x] **1.2.3** 积分系统数据模型与基础接口

#### 1.3 客户端 MVP（优先满足「API 展示短视频数据」）✅
- [x] **1.3.1** 客户端首页 / 视频列表页
- [x] **1.3.2** **API 接口对接**：调用短视频数据 API，展示「视频单量」「视频播放量」
- [x] **1.3.3** 视频卡片组件（链接、投流码、AI 解析结果展示）
- [x] **1.3.4** 积分充值入口（充值得积分）

#### 1.4 达人端 MVP ✅
- [x] **1.4.1** 达人任务列表（产品类型、视频下载链接）
- [x] **1.4.2** 视频上传功能（上传到云端/存储）

#### 1.5 管理员端 MVP ✅
- [x] **1.5.1** 审核达人列表与操作
- [x] **1.5.2** 积分管理（达人积分、客户积分）
- [x] **1.5.3** 审核动作（通过动作加积分）

---

### 阶段 2：核心业务完善 ✅

- [x] **2.1** 下载视频功能
  - 露脸视频：费用较高、兼职绑定（客户代码与达人代码一对一）
  - 讲解视频：按组下载、防关联
- [x] **2.2** 管理员：上传云端链接、AI 解析（防达人提前删除）
- [x] **2.3** 视频投流码展示与管理
- [x] **2.4** 积分兑换规则（1 积分 = 1 泰铢）的完整实现

---

### 阶段 3：增强与优化 ✅

- [x] **3.1** 达人任务领取限制（防止一天领太多任务）
- [x] **3.2** 发布视频查重机制
- [x] **3.3** 数据统计与报表
- [x] **3.4** 性能优化与安全加固

---

### 阶段 4：可选后续 ✅ 已完成

- [x] **4.1** 持久化：SQLite 数据库，表结构含用户/视频/任务/领取/绑定/积分
- [x] **4.2** 鉴权升级：JWT 签发与校验，按端 requireAuth(role)
- [x] **4.3** 部署：前端 vercel.json + DEPLOY.md（Vercel/Netlify + 后端 Railway/Render 说明）
- [x] **4.4** 业务澄清落地：视频类型 face/explain、兼职绑定 client_influencer_bindings、按组下载默认 5 最大 20
- [x] **4.5** 文件存储：上传服务抽象、UPLOAD_DIR/UPLOAD_PUBLIC_URL、.env 预留 S3 配置与文档

---

### 阶段 5：上线前检查与建议

- [ ] **5.1** 本地联调：前后端同时启动，三端各登录一次并走通主流程（视频列表、领取任务、上传、下载、报表）
- [ ] **5.2** 生产环境：设置 `JWT_SECRET`、修改种子账号密码或禁用种子、按 DEPLOY.md 部署
- [ ] **5.3** 安全与体验：生产环境收紧 CORS 为前端域名、HTTPS、敏感信息仅用环境变量

---

## 四、目录与文件结构

### 4.1 前端（Vue 3 + Vite）

```
xiangtai-video-app/
├── README.md
├── package.json
├── vite.config.js
├── .env.example                       # VITE_API_BASE_URL 等
│
├── src/
│   ├── main.js
│   ├── App.vue
│   │
│   ├── api/                           # API 服务层
│   │   ├── client.js                  # 封装 axios
│   │   ├── video.js                   # 短视频 API
│   │   ├── points.js                  # 积分 API
│   │   ├── auth-admin.js              # 管理员登录
│   │   ├── auth-client.js             # 客户端登录
│   │   └── auth-influencer.js         # 达人端登录（三端独立）
│   │
│   ├── stores/                        # Pinia 状态管理
│   │   ├── user.js
│   │   └── video.js
│   │
│   ├── router/
│   │   └── index.js                   # 三端路由（独立入口）
│   │
│   ├── layouts/
│   │   ├── AdminLayout.vue
│   │   ├── ClientLayout.vue
│   │   └── InfluencerLayout.vue
│   │
│   ├── views/
│   │   ├── admin/
│   │   │   ├── InfluencerReview.vue
│   │   │   ├── PointsManage.vue
│   │   │   ├── ActionReview.vue
│   │   │   └── CloudUpload.vue
│   │   │
│   │   ├── client/
│   │   │   ├── VideoList.vue          # 达人已发布视频 + API 数据
│   │   │   ├── VideoDownload.vue
│   │   │   └── PointsRecharge.vue
│   │   │
│   │   └── influencer/
│   │       ├── TaskList.vue
│   │       └── VideoUpload.vue
│   │
│   ├── components/
│   │   ├── VideoCard.vue              # 视频卡片（含 API 数据）
│   │   ├── VideoPlayer.vue
│   │   └── common/
│   │
│   └── utils/
│       ├── auth.js
│       └── constants.js
│
└── public/
```

### 4.2 后端（自建）

```
xiangtai-video-api/                    # 建议独立仓库或 monorepo 子目录
├── package.json
├── .env.example
│
├── src/
│   ├── index.js                       # 入口（Express/Koa/Fastify）
│   ├── config/
│   │   └── db.js                      # 数据库配置
│   │
│   ├── routes/
│   │   ├── admin/                     # 管理员 API
│   │   ├── client/                    # 客户端 API
│   │   └── influencer/                # 达人端 API
│   │
│   ├── controllers/
│   ├── models/                        # 数据模型
│   │   ├── Admin.js
│   │   ├── Client.js
│   │   ├── Influencer.js
│   │   ├── Video.js
│   │   └── Points.js
│   │
│   ├── middleware/
│   │   └── auth.js                   # 三端独立鉴权
│   │
│   └── services/
│       └── video.js                   # 短视频数据逻辑
│
└── database/                          # 迁移脚本等
```

---

## 五、待后续澄清的业务细节（可边开发边确认）

- **Q4**：「露脸视频」与「讲解视频」的区分逻辑？是否由管理员在上传时标记？
- **Q5**：「兼职绑定」具体指什么？客户代码与达人代码的一对一绑定，是在哪个环节完成？
- **Q6**：「按组形式下载、防关联」——组的大小、规则是否有具体要求？

---

## 六、MVP 第一阶段交付物

1. 可运行的三端骨架（路由、布局、基础导航）
2. 客户端「达人已发布视频」列表页，**通过 API 展示视频单量、播放量**
3. 基础登录 / 角色切换
4. 积分充值入口（可先做静态页或简单表单）

---

---

## 七、本地运行说明

**首次运行前请先安装依赖：**

```bash
# 前端
cd xiangtai-video-app
npm install
npm run dev

# 后端（另开终端）
cd xiangtai-video-api
npm install
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

---

**当前状态**：阶段 1～4 已全部完成（含持久化、JWT、部署说明、业务细化、存储抽象）。  
**下一步**：执行阶段 5 本地联调与上线前检查，或按 DEPLOY.md 直接部署。
