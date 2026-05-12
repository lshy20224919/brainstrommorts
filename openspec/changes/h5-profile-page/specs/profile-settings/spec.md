## ADDED Requirements

### Requirement: 用户信息展示
页面顶部 SHALL 展示用户信息卡片，包含头像（深墨蓝圆形背景 + 白色文字"我"）、昵称"方法论进化者"、使用天数（从 mock 数据中的注册时间计算）。

#### Scenario: 正常展示用户信息
- **WHEN** 用户进入个人中心页面
- **THEN** 页面顶部展示头像、昵称和"使用 N 天"文案

### Requirement: 数据概览展示
用户信息卡片下方 SHALL 展示数据概览条，包含三个指标：总动作数、总规律数、累计打卡次数。数据从 mock 数据层聚合计算。

#### Scenario: 数据概览正确聚合
- **WHEN** 页面加载完成
- **THEN** 总动作数 = mock actions 中 status=0 的数量，总规律数 = mock laws 的数量，累计打卡次数 = 所有 actions 的 exec_count 之和

### Requirement: 智能迁移开关
通用设置区 SHALL 包含"智能迁移推荐"开关，默认开启。切换后状态保存到 mock 数据层。

#### Scenario: 关闭智能迁移
- **WHEN** 用户关闭智能迁移开关
- **THEN** 开关状态变为关闭，mock 数据中 smart_migrate_on 更新为 false

### Requirement: 避雷弹窗开关
通用设置区 SHALL 包含"负向避雷提醒"开关，默认开启。切换后状态保存到 mock 数据层。

#### Scenario: 关闭避雷提醒
- **WHEN** 用户关闭避雷弹窗开关
- **THEN** 开关状态变为关闭，mock 数据中 warning_popup_on 更新为 false

### Requirement: 深色模式选择器
通用设置区 SHALL 包含深色模式三档选择器（浅色/深色/跟随系统），默认"跟随系统"。选择后状态保存到 mock 数据层，但不触发实际主题切换。

#### Scenario: 切换深色模式选项
- **WHEN** 用户选择"深色"选项
- **THEN** 选择器高亮"深色"，mock 数据中 dark_mode 更新为 1
