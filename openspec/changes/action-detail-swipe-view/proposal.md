## Why

当前 H5 版已经支持“正确的事”卡片右划打卡和长按操作菜单，但缺少查看单条动作历史执行记录的入口。对于“证券”“投资”等高复盘价值场景，用户需要快速查看某个动作的具体打卡记录（何时执行、成功/失败、备注），否则无法从卡片库直接完成细节复盘。

## What Changes

- 为“正确的事”卡片新增左划查看详情手势
- 仅“正确的事”卡片支持左划查看详情，规律卡片保持现状
- 保留现有右划快速打卡和长按操作菜单
- 在“正确的事”卡片右侧增加常驻箭头和浅灰提示文案，提示用户可左划查看详情
- 新增全屏右侧滑入的详情页/详情面板
- 详情页第一版包含：基础概览、打卡记录时间线、关联规律列表
- 新增针对单条动作的打卡记录查询 API（按动作 ID 倒序返回记录）
- 优化卡片手势冲突处理：横向位移优先于长按，左右滑按阈值区分，纵向滚动优先页面滚动

## Capabilities

### New Capabilities
- `action-detail-view`: 正确的事卡片左划查看详情，包括详情面板、打卡记录时间线和关联规律展示
- `gesture-conflict-control`: 卡片左右滑、长按、纵向滚动的手势冲突控制与阈值判定

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- 主要修改文件：`methodology-evolver-h5/src/pages/CardLibPage.jsx`
- 可能新增文件：`methodology-evolver-h5/src/components/ActionDetailPanel.jsx`
- 可能修改文件：`methodology-evolver-h5/src/mock.js`（新增按动作获取打卡记录 API）
- 可能修改文件：`methodology-evolver-h5/src/App.css`（新增左划提示与详情页滑入动画样式）
- 不涉及新依赖，不影响现有 SOP、复盘、个人中心页面
