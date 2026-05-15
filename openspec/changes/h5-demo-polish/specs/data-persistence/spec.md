## ADDED Requirements

### Requirement: Mock 数据 localStorage 持久化
系统 SHALL 在启动时从 localStorage 加载 mock 数据，每次数据变更后自动保存到 localStorage。

#### Scenario: 首次启动
- **WHEN** localStorage 中无数据或版本不匹配
- **THEN** 使用默认 mock 数据初始化，并写入 localStorage

#### Scenario: 后续启动
- **WHEN** localStorage 中有有效数据且版本匹配
- **THEN** 从 localStorage 恢复数据，不使用默认值

#### Scenario: 数据变更自动保存
- **WHEN** 任何 API 调用修改了 mock 数据（新增/编辑/删除/打卡等）
- **THEN** 自动将完整 mockApi 对象序列化写入 localStorage

#### Scenario: 重置数据
- **WHEN** 用户在个人中心点击"重置数据"
- **THEN** 清除 localStorage，恢复默认 mock 数据，页面刷新

### Requirement: 数据版本检测
系统 SHALL 在 localStorage 数据中包含版本号，当代码中数据结构变更时自动检测并重置。

#### Scenario: 版本不匹配
- **WHEN** localStorage 中的版本号与代码中定义的版本号不一致
- **THEN** 丢弃旧数据，使用默认数据重新初始化

### Requirement: 表单草稿自动保存
所有录入弹窗 SHALL 在用户输入时自动保存草稿到 localStorage，弹窗重新打开时恢复。

#### Scenario: 输入时保存草稿
- **WHEN** 用户在新增正确的事弹窗中输入名称"低吸"后关闭弹窗
- **THEN** 草稿保存到 localStorage（key: draft_create_action）

#### Scenario: 重新打开恢复草稿
- **WHEN** 用户再次打开新增正确的事弹窗
- **THEN** 表单自动填充上次保存的草稿内容

#### Scenario: 提交后清除草稿
- **WHEN** 用户成功提交表单
- **THEN** 对应的草稿从 localStorage 中清除

#### Scenario: 草稿 debounce
- **WHEN** 用户连续快速输入
- **THEN** 草稿保存以 500ms debounce 执行，避免频繁写入
