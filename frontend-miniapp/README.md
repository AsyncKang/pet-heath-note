## 宠康记（PetHealthNote）微信小程序前端（规划）

当前版本已提供基础的登录、宠物/健康记录等页面，后续将继续扩展疫苗、提醒、统计等模块。

### 目录结构

- `miniprogram/`
  - `app.js / app.json / app.wxss`
  - `pages/login`：调用 `wx.login` + 后端 `/api/auth/login` 完成模拟登录
  - 底部 Tab 页面：
    - `pages/index`（宠物）：宠物列表，可跳转详情、进入“新增宠物”
    - `pages/walk`（遛弯）：可一键开始/结束遛弯，自动记录轨迹、时长、天气并生成记录
    - `pages/profile`：个人中心（用户信息、功能入口、设置）
  - 业务页面：
    - `pages/pet-form`、`pages/pet-detail`
    - `pages/walk-form`
    - `pages/health-record-form`
    - `pages/vaccine-list`、`pages/vaccine-form`
    - `pages/reminder-list`、`pages/reminder-form`
    - `pages/help`、`pages/about`
  - `services/`：与后端对接的 API 封装（`auth/pet/health/user/...`）
  - `utils/request.js`：统一请求封装，自动注入 `Authorization` 头

### 启动步骤

1. 使用微信开发者工具打开本目录（`frontend-miniapp`），`appid` 如为个人测试可使用 `touristappid`。
2. 如需修改后端地址，更新 `miniprogram/app.js` 中的 `DEFAULT_BASE_URL`。
3. 运行后默认进入“登录”页面，点击“微信一键登录”将调用 `wx.login + /api/auth/login` 并缓存 token。
4. 登录成功后自动切换至“宠物” Tab。底部导航提供“宠物 / 遛弯 / 我的”三个入口，其余业务页面通过按钮跳转。所有页面进入时都会检查登录状态，未登录则重定向至登录页。

### 后续可扩展页面

- 医疗记录、新建宠物、疫苗/提醒等模块
- 登录授权、统一状态管理、表单校验
- UI 升级为自定义组件库（WeUI、Vant Weapp 等）


