## ADDED Requirements

### Requirement: Toast 动效
Toast 组件 SHALL 以从顶部滑入的动画出现，消失时向上滑出并淡出。

#### Scenario: Toast 出现
- **WHEN** Toast 被触发
- **THEN** 从页面顶部以 slide-down 动画进入，持续时间 200ms

#### Scenario: Toast 消失
- **WHEN** Toast 计时结束
- **THEN** 以 slide-up + fade-out 动画退出，持续时间 200ms

### Requirement: 打卡成功动画
打卡成功后 SHALL 显示一个短暂的成功动画反馈（绿色对勾 + 放大缩小效果）。

#### Scenario: 打卡成功
- **WHEN** 用户完成打卡（点击确认且执行成功）
- **THEN** 弹窗关闭后，页面中央显示绿色对勾动画（scale 0→1.2→1），持续 800ms 后消失

### Requirement: 卡片入场动画
新增卡片 SHALL 以淡入 + 向下展开的动画进入列表。

#### Scenario: 新增卡片
- **WHEN** 用户成功创建正确的事或规律
- **THEN** 新卡片以 fade-in + slide-down 动画出现在列表中，持续时间 300ms

### Requirement: 操作菜单动效
ActionSheet 组件 SHALL 以从底部滑入的动画出现，关闭时向下滑出。

#### Scenario: 菜单出现
- **WHEN** ActionSheet 被触发
- **THEN** 从底部以 slide-up 动画进入，遮罩层同时 fade-in

#### Scenario: 菜单关闭
- **WHEN** 用户关闭 ActionSheet
- **THEN** 向下 slide-down 退出，遮罩层 fade-out
