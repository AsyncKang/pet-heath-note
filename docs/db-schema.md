## 宠康记（PetHealthNote）数据库设计（V1.0）

> 更新时间：2025-11。以下表结构已在当前版本实现，若新增字段/索引请在下一个里程碑同步更新。

### 1. 命名约定

- 库名：`pet_health_note`
- 统一使用 `snake_case` 命名表与字段。
- 所有表建议包含以下公共字段：
  - `id`：主键，自增
  - `created_at`：创建时间
  - `updated_at`：更新时间
  - `is_deleted`：逻辑删除标记（0-未删除，1-已删除）

---

### 2. 用户表 `user`

记录小程序用户信息。

- `id` BIGINT PK
- `openid` VARCHAR(64) 微信 openid（唯一）
- `unionid` VARCHAR(64) 微信 unionid（可选）
- `nickname` VARCHAR(50) 昵称
- `avatar_url` VARCHAR(255) 头像地址
- `mobile` VARCHAR(20) 手机号（可选）
- `gender` TINYINT 性别（0未知 1男 2女）
- `notify_vaccine` TINYINT 是否接收疫苗提醒（1是 0否，默认1）
- `notify_deworm` TINYINT 是否接收驱虫提醒（1是 0否，默认1）
- `created_at` DATETIME
- `updated_at` DATETIME
- `is_deleted` TINYINT

---

### 3. 宠物表 `pet`

记录用户管理的宠物基础信息。

- `id` BIGINT PK
- `user_id` BIGINT 所属用户 ID（FK -> user.id）
- `name` VARCHAR(50) 宠物名字
- `species` VARCHAR(50) 宠物种类（狗/猫/其他）
- `breed` VARCHAR(100) 品种
- `gender` TINYINT 性别（0未知 1公 2母）
- `birth_date` DATE 出生日期（可选）
- `weight_kg` DECIMAL(5,2) 当前体重（kg，可选）
- `avatar_url` VARCHAR(255) 宠物头像
- `remark` VARCHAR(255) 备注
- `created_at` DATETIME
- `updated_at` DATETIME
- `is_deleted` TINYINT

---

### 4. 健康记录表 `pet_health_record`

记录日常健康相关数据。

- `id` BIGINT PK
- `pet_id` BIGINT 宠物 ID（FK -> pet.id）
- `record_date` DATE 记录日期
- `weight_kg` DECIMAL(5,2) 体重
- `temperature_c` DECIMAL(4,1) 体温
- `appetite` TINYINT 食欲（自定义枚举：1差 2一般 3良好）
- `spirit` TINYINT 精神状态
- `stool` TINYINT 排泄情况
- `note` VARCHAR(500) 备注描述
- `created_at` DATETIME
- `updated_at` DATETIME
- `is_deleted` TINYINT

---

### 5. 医疗记录表 `pet_medical_record`

记录就诊、检查、手术等医疗信息。

- `id` BIGINT PK
- `pet_id` BIGINT 宠物 ID
- `visit_date` DATE 就诊日期
- `hospital_name` VARCHAR(100) 医院名称
- `doctor_name` VARCHAR(50) 医生姓名（可选）
- `diagnosis` VARCHAR(500) 诊断结果
- `treatment` VARCHAR(500) 治疗方案
- `medicine` VARCHAR(500) 用药信息
- `cost` DECIMAL(10,2) 费用
- `attachment_urls` VARCHAR(1000) 附件（就诊单、化验单等，JSON 或分隔）
- `created_at` DATETIME
- `updated_at` DATETIME
- `is_deleted` TINYINT

---

### 6. 疫苗记录表 `pet_vaccine_record`

记录疫苗接种和驱虫等。

- `id` BIGINT PK
- `pet_id` BIGINT 宠物 ID
- `vaccine_name` VARCHAR(100) 疫苗名称
- `vaccine_type` VARCHAR(50) 疫苗类型（如：狂犬、五联等）
- `dose` VARCHAR(50) 剂量说明
- `injection_date` DATE 接种日期
- `next_injection_date` DATE 下次接种日期（用于提醒）
- `hospital_name` VARCHAR(100) 接种机构（可选）
- `remark` VARCHAR(255) 备注
- `created_at` DATETIME
- `updated_at` DATETIME
- `is_deleted` TINYINT

---

### 7. 提醒表 `reminder`

记录与宠物相关的提醒事项。

- `id` BIGINT PK
- `user_id` BIGINT 用户 ID
- `pet_id` BIGINT 宠物 ID（可选，为空表示与用户相关的通用提醒）
- `reminder_type` VARCHAR(50) 提醒类型（如：VACCINE, DEWORMING, CHECKUP, MEDICINE）
- `title` VARCHAR(100) 标题
- `content` VARCHAR(255) 内容描述
- `remind_time` DATETIME 提醒时间
- `status` TINYINT 状态（0待提醒 1已提醒 2已完成）
- `source_type` VARCHAR(50) 来源业务类型（如：VACCINE_RECORD、DEWORM_RECORD）
- `source_id` BIGINT 来源业务ID（如：对应的疫苗/驱虫记录ID）
- `last_notify_date` DATE 最近一次发送订阅消息的日期（防重复）
- `created_at` DATETIME
- `updated_at` DATETIME
- `is_deleted` TINYINT

---

### 9. 遛弯记录表 `pet_walk_record`

记录宠物遛弯的时间、距离与环境。

- `id` BIGINT PK
- `pet_id` BIGINT 宠物 ID（FK -> pet.id）
- `walk_date` DATE 遛弯日期
- `start_time` DATETIME 开始时间
- `end_time` DATETIME 结束时间
- `duration_minutes` INT 时长（分钟）
- `distance_km` DECIMAL(6,2) 距离（km）
- `location` VARCHAR(100) 地点
- `weather_desc` VARCHAR(100) 天气情况
- `mood` VARCHAR(50) 心情状态
- `remark` VARCHAR(255) 备注
- `path_points` TEXT 轨迹点（JSON 数组）
- `created_at` DATETIME
- `updated_at` DATETIME
- `is_deleted` TINYINT

---

### 8. 后续补充表（占位）

- `pet_photo`：宠物照片相册表
- `user_settings`：用户偏好设置
- `operation_log`：操作日志（如需要）

> 后续阶段将在实际开发中根据 PRD 与业务细化各字段含义、索引设计与约束（唯一索引、外键约束等），并补充建表 SQL 文件。


