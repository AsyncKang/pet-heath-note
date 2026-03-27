## 宠康记（PetHealthNote）微信小程序

宠康记是一款面向宠物主人的微信小程序，用于记录和管理宠物的健康信息（档案、健康记录、医疗记录、疫苗接种、提醒等），后端采用 **Spring Boot Cloud + MyBatis Plus** 技术栈。

本仓库按照 `docs/开发计划.md` 的阶段性路线迭代，当前已经完成 **第三阶段（登录 + 疫苗/提醒 + 遛弯等能力）** 的开发与联调，进入整体收尾阶段。

### 仓库结构（规划）

- `backend/`：后端服务代码（Spring Boot Cloud + MyBatis Plus）
- `frontend-miniapp/`：微信小程序前端代码
- `docs/`：所有项目文档（架构、数据库、接口、部署、计划、进度、PRD 等）

### 技术栈（后端）

- Java 8（当前约束）
- Spring Boot 2.7.x（基础框架）
- Spring Cloud 2021.x（服务治理与配置，按需引入组件）
- MyBatis Plus（ORM 持久层）
- MySQL（关系型数据库）
- Redis（缓存，可在后续阶段引入）

### 启动步骤

#### 开发环境

1. 安装 JDK 8、Maven 3.6+、MySQL。
2. 克隆本仓库并进入 `backend/pet-health-note` 目录。
3. 创建数据库（名称建议：`pet_health_note`），并在 `application.yml` 中配置连接信息。
4. 执行：
   ```bash
   mvn spring-boot:run
   ```
5. 后端默认监听端口：`8080`。

#### 生产环境部署

当前仓库聚焦于本地开发与真机联调，若需要线上部署，请结合自身基础设施（Nginx、SSL、systemd 等）制定方案。
### 小程序前端

1. 使用微信开发者工具打开 `frontend-miniapp`，`app.json` 默认进入 `pages/login`。
2. 本地联调时请将后端地址改为局域网可访问的 IP：在 `miniprogram/app.js`、`utils/request.js` 与登录页中调整 `DEFAULT_BASE_URL`，保持与后端 `application.yml` 中的端口一致。
3. 登录页“微信一键登录”会调用 `/api/auth/login` 模拟授权；成功后会缓存 token，并自动跳转首页，其他页面会统一校验登录状态。
4. 已实现的核心业务页面：宠物档案、健康记录、疫苗记录、提醒列表、遛弯记录、个人中心/帮助/关于等，可直接在 TabBar 中体验。

### 文档索引

- 架构设计：`docs/architecture.md`
- 数据库设计：`docs/db-schema.md`
- 接口设计：`docs/api-design.md`
- 开发计划：`docs/开发计划.md`
- 进度报告：`docs/开发进度报告.md`
- PRD：`docs/宠康记（PetHealthNote）微信小程序需求文档（PRD）_副本.pdf`


