## ADDED Requirements

### Requirement: Modal 组件
系统 SHALL 提供统一的 Modal 组件，支持标题、内容区、底部操作按钮，点击遮罩层关闭。所有页面的弹窗 MUST 使用此组件。

#### Scenario: 显示 Modal
- **WHEN** 组件接收 visible=true
- **THEN** 显示遮罩层和弹窗内容，弹窗居中显示

#### Scenario: 点击遮罩关闭
- **WHEN** 用户点击遮罩层（弹窗外部区域）
- **THEN** 触发 onClose 回调，弹窗关闭

#### Scenario: 阻止冒泡
- **WHEN** 用户点击弹窗内部区域
- **THEN** 不触发关闭

### Requirement: ActionSheet 组件
系统 SHALL 提供底部弹出式操作菜单组件，支持操作项列表和取消按钮。

#### Scenario: 显示操作菜单
- **WHEN** 组件接收 visible=true 和 actions 数组
- **THEN** 从底部滑入显示操作菜单，每个 action 渲染为一行按钮

#### Scenario: 禁用项
- **WHEN** action 项设置 disabled=true
- **THEN** 该项显示为灰色不可点击状态

#### Scenario: 危险项
- **WHEN** action 项设置 danger=true
- **THEN** 该项文字显示为红色

### Requirement: Toast 组件
系统 SHALL 提供全局 Toast 提示，支持 success/error/info 三种类型，自动消失。

#### Scenario: 显示成功 Toast
- **WHEN** 调用 toast.success('操作成功')
- **THEN** 页面顶部显示绿色成功提示，2 秒后自动消失

#### Scenario: 显示错误 Toast
- **WHEN** 调用 toast.error('操作失败')
- **THEN** 页面顶部显示红色错误提示，3 秒后自动消失

#### Scenario: 多条 Toast 堆叠
- **WHEN** 连续触发多条 Toast
- **THEN** 新 Toast 在已有 Toast 下方堆叠显示，各自独立计时消失

### Requirement: ConfirmDialog 组件
系统 SHALL 提供确认对话框组件，用于高危操作的二次确认。

#### Scenario: 确认操作
- **WHEN** 用户点击"确认"按钮
- **THEN** 触发 onConfirm 回调，对话框关闭

#### Scenario: 取消操作
- **WHEN** 用户点击"取消"按钮或遮罩层
- **THEN** 触发 onCancel 回调，对话框关闭

### Requirement: Loading Skeleton
系统 SHALL 在页面数据加载期间显示骨架屏占位，避免白屏闪烁。

#### Scenario: 数据加载中
- **WHEN** 页面发起数据请求且尚未返回
- **THEN** 显示灰色骨架屏动画占位

#### Scenario: 数据加载完成
- **WHEN** 数据请求返回
- **THEN** 骨架屏消失，显示真实内容

### Requirement: 共享打卡弹窗
系统 SHALL 提供统一的打卡弹窗组件，HomePage 和 CardLibPage MUST 共用同一组件。

#### Scenario: 从首页打卡
- **WHEN** 用户在首页点击"打卡"快捷按钮
- **THEN** 弹出打卡弹窗，需先选择正确的事，再选择成功/失败

#### Scenario: 从卡片库打卡
- **WHEN** 用户在卡片库右滑或长按菜单选择打卡
- **THEN** 弹出打卡弹窗，已预选当前动作，只需选择成功/失败

### Requirement: 共享新增弹窗
系统 SHALL 提供统一的新增正确的事弹窗和新增规律弹窗，多页面共用。

#### Scenario: 从首页新增
- **WHEN** 用户在首页点击快捷操作按钮
- **THEN** 弹出对应的新增弹窗（正确的事/正向规律/负向规律）

#### Scenario: 从卡片库新增
- **WHEN** 用户在卡片库点击 FAB 按钮
- **THEN** 弹出相同的新增弹窗组件
