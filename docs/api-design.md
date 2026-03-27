## 宠康记（PetHealthNote）API 设计（V1.0）

> 更新时间：2025-11，对应当前已交付的小程序能力（登录、用户/宠物管理、健康/医疗/疫苗记录、提醒、遛弯、收藏地点、天气服务等）。如无特殊说明，所有接口基于 `https://{host}/api`，采用 REST/JSON，前端需携带 `Authorization: Bearer {token}`。

### 1. 统一约定

- 基础路径（规划）：`/api`
- 统一返回结构（示例）：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

- `code`：
  - `0`：成功
  - `400xx`：客户端错误（参数校验、业务异常）
  - `500xx`：服务端错误

---

### 2. 登录认证（Auth）

#### 2.1 微信登录

- `POST /api/auth/login`
- 请求体示例：

```json
{
  "code": "微信 login 返回的 code",
  "nickname": "示例昵称",
  "avatarUrl": "https://example.com/avatar.png"
}
```

- 响应示例：

```json
{
  "token": "token-1-1699999999999",
  "user": {
    "id": 1,
    "openid": "xxxx",
    "nickname": "示例昵称",
    "avatarUrl": "https://example.com/avatar.png"
  }
}
```

#### 2.2 说明

- 当前实现为模拟版：直接使用小程序 `wx.login` 返回的 `code` 作为 `openid`。后续接入真实微信服务时，可在服务器端通过 `code2Session` 获取真实 `openid/session_key` 并替换。
- 客户端需在成功后持久化 `token` 与 `user`，并在后续请求中通过 `Authorization` 头部传递。

---

### 3. 用户管理（User）

> 登录接口会自动创建/更新用户信息；后台仍保留基础 CRUD 以便运营管理。

#### 2.1 创建用户

- `POST /api/users`
- 请求示例：

```json
{
  "openid": "mock-openid-001",
  "unionid": "mock-unionid-001",
  "nickname": "测试用户",
  "avatarUrl": "",
  "mobile": "13800000000",
  "gender": 1
}
```

#### 2.2 更新用户

- `PUT /api/users/{id}`

#### 2.3 获取用户

- `GET /api/users/{id}`

#### 2.4 用户列表

- `GET /api/users?page=1&size=10&nickname=xxx`

#### 2.5 删除用户

- `DELETE /api/users/{id}`

---

### 4. 宠物管理（Pet）

#### 3.1 创建宠物

- `POST /api/pets`
- 请求示例：

```json
{
  "name": "小黑",
  "species": "dog",
  "breed": "柴犬",
  "gender": 1,
  "birthDate": "2023-01-01",
  "weightKg": 5.2,
  "avatarUrl": ""
}
```

#### 3.2 获取宠物列表

- `GET /api/pets`
- 描述：返回当前用户的宠物列表。

#### 3.3 获取宠物详情

- `GET /api/pets/{petId}`

#### 3.4 更新宠物信息

- `PUT /api/pets/{petId}`

#### 3.5 删除宠物

- `DELETE /api/pets/{petId}`

---

### 5. 健康记录（Health Record）

#### 4.1 创建健康记录

- `POST /api/pets/{petId}/health-records`
- 请求示例：

```json
{
  "recordDate": "2025-01-01",
  "weightKg": 5.3,
  "temperatureC": 38.5,
  "appetite": 3,
  "spirit": 3,
  "stool": 2,
  "note": "状态良好"
}
```

#### 4.2 获取健康记录列表

- `GET /api/pets/{petId}/health-records`
- 支持分页、按日期区间筛选。

#### 4.3 获取健康记录详情

- `GET /api/health-records/{id}`

#### 4.4 更新健康记录

- `PUT /api/health-records/{id}`

#### 4.5 删除健康记录

- `DELETE /api/health-records/{id}`

---

### 6. 医疗记录（Medical Record）

#### 5.1 创建医疗记录

- `POST /api/pets/{petId}/medical-records`

#### 5.2 获取医疗记录列表

- `GET /api/pets/{petId}/medical-records`

#### 5.3 获取医疗记录详情

- `GET /api/medical-records/{id}`

#### 5.4 更新医疗记录

- `PUT /api/medical-records/{id}`

#### 5.5 删除医疗记录

- `DELETE /api/medical-records/{id}`

---

### 7. 疫苗记录（Vaccine Record）

#### 6.1 创建疫苗记录

- `POST /api/pets/{petId}/vaccine-records`
- 请求示例：

```json
{
  "vaccineName": "狂犬疫苗",
  "vaccineType": "狂犬",
  "dose": "1ml",
  "injectionDate": "2025-11-17",
  "nextInjectionDate": "2026-11-17",
  "hospitalName": "乐宠动物医院",
  "remark": "状态良好"
}
```

#### 6.2 获取疫苗记录列表

- `GET /api/pets/{petId}/vaccine-records?page=1&size=10`

#### 6.3 获取疫苗记录详情

- `GET /api/vaccine-records/{id}`

#### 6.4 更新疫苗记录

- `PUT /api/vaccine-records/{id}`

#### 6.5 删除疫苗记录

- `DELETE /api/vaccine-records/{id}`

---

### 8. 提醒（Reminder）

#### 7.1 创建提醒

- `POST /api/reminders`
- 请求示例：

```json
{
  "userId": 1,
  "petId": 2,
  "reminderType": "VACCINE",
  "title": "三联疫苗",
  "content": "带小黑去接种三联",
  "remindTime": "2025-12-01 10:00:00"
}
```

#### 7.2 获取提醒列表

- `GET /api/reminders?page=1&size=10&userId=1&reminderType=VACCINE&status=0`

#### 7.3 更新提醒状态

- `PUT /api/reminders/{id}/status`

#### 7.4 编辑提醒

- `PUT /api/reminders/{id}`

#### 7.5 删除提醒

- `DELETE /api/reminders/{id}`

---

### 9. 遛弯记录（Walk Record）

#### 9.1 创建遛弯记录

- `POST /api/pets/{petId}/walk-records`
- 请求示例：

```json
{
  "walkDate": "2025-11-17",
  "startTime": "2025-11-17 08:30:00",
  "endTime": "2025-11-17 08:55:00",
  "durationMinutes": 25,
  "distanceKm": 1.8,
  "location": "小区花园",
  "weatherDesc": "晴 12℃",
  "mood": "开心",
  "remark": "遇到其他宠物一起玩",
  "pathPoints": [
    {
      "latitude": 31.2304,
      "longitude": 121.4737,
      "timestamp": "2025-11-17 08:30:05"
    }
  ]
}
```

#### 9.2 获取遛弯记录列表

- `GET /api/pets/{petId}/walk-records?page=1&size=20`

#### 9.3 获取遛弯记录统计

- `GET /api/pets/{petId}/walk-records/stats`

---

### 10. 常用地点收藏（Favorite Place）

主要供遛弯或提醒选择既有地点/医生。

- `GET /api/favorites`：按用户列出收藏地点，可通过 `type`（HOSPITAL/PLAYGROUND/etc.）筛选。
- `POST /api/favorites`：创建收藏，字段示例：`name`、`type`、`address`、`latitude`、`longitude`、`remark`。
- `PUT /api/favorites/{id}`：编辑收藏。
- `DELETE /api/favorites/{id}`：删除收藏。

### 11. 天气服务（Weather）

> 由后端统一调用第三方天气接口，遛弯模块和其他业务可共享。

- `GET /api/weather/current?lat=..&lng=..`：根据经纬度返回当前天气文案、温度、风速等。
- `GET /api/weather/by-city?city=上海`（可选）：按城市名称查询。

### 12. 统一说明

- 所有列表类接口均支持 `page` / `size`，部分模块支持条件过滤（`petId`、`reminderType`、`status` 等）。
- 响应对象默认遵循：
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {...}
  }
  ```
- Token 由登录接口生成，前端需存储并在请求头传递；后端已提供简单拦截器校验，可在后续阶段替换为正式鉴权方案。
- 若需要导出或批量能力，请在后续需求阶段补充具体数据结构，本版本暂未实现。


