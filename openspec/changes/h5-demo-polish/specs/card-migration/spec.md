## ADDED Requirements

### Requirement: 手动迁移入口
卡片库中正确的事和规律的长按操作菜单 SHALL 包含"迁移"选项（替代当前的 disabled 状态）。

#### Scenario: 点击迁移
- **WHEN** 用户长按卡片并选择"迁移"
- **THEN** 弹出迁移弹窗，展示目标分类选择列表（排除当前分类）

### Requirement: 迁移执行
迁移 SHALL 在目标分类下创建原卡片的副本，原卡片保留不变。副本的统计数据（exec_count、success_count 等）归零。

#### Scenario: 迁移正确的事
- **WHEN** 用户选择目标分类并确认迁移
- **THEN** 在目标分类下创建该动作的副本（名称、描述、权重保留，统计归零），原动作不变，迁移记录写入 migrate_log

#### Scenario: 迁移规律
- **WHEN** 用户对规律执行迁移
- **THEN** 在目标分类下创建该规律的副本（描述、类型保留，trigger_count 归零），原规律不变

### Requirement: 迁移记录
每次迁移 SHALL 生成一条迁移记录，包含源卡片 ID、类型、目标分类、迁移时间。

#### Scenario: 查看迁移记录
- **WHEN** 迁移完成
- **THEN** migrate_log 中新增一条记录，包含 source_card_id、source_card_type、target_category_id、migrate_type=1（手动）、migrate_time

### Requirement: 智能迁移推荐展示
首页待办区的"迁移推荐"提醒 SHALL 支持点击展开查看推荐列表。

#### Scenario: 展开推荐列表
- **WHEN** 用户点击首页"今日有 N 条迁移推荐"待办卡片
- **THEN** 弹出迁移推荐弹窗，展示推荐列表（源卡片名称、推荐目标分类、相似度百分比）

### Requirement: 采纳迁移推荐
用户 SHALL 可以一键采纳推荐，执行迁移。

#### Scenario: 采纳推荐
- **WHEN** 用户点击推荐项的"采纳"按钮
- **THEN** 执行迁移（同手动迁移逻辑），migrate_type=2（智能），记录 similarity_score

#### Scenario: 忽略推荐
- **WHEN** 用户点击推荐项的"忽略"按钮
- **THEN** 该推荐从列表中移除，不执行迁移

### Requirement: 规律编辑
卡片库中规律的长按操作菜单 SHALL 包含"编辑"选项，点击后弹出编辑弹窗。

#### Scenario: 编辑规律
- **WHEN** 用户长按规律卡片并选择"编辑"
- **THEN** 弹出编辑弹窗，预填当前规律的描述、分类、关联动作、适用场景、权重，用户修改后保存

#### Scenario: 保存编辑
- **WHEN** 用户修改字段后点击"保存"
- **THEN** 规律数据更新，弹窗关闭，列表刷新
