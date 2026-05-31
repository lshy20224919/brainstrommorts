## Tasks

### Phase 1: 数据层变更

- [x] 1. mock.js 灵感数据模型新增 `direction` 字段（positive/negative），更新默认数据
- [x] 2. CreateInspirationModal 新增方向选择（正向/负向 pill 按钮）

### Phase 2: 页面结构重构

- [x] 3. CardLibPage 一级 Tab 改为三项：行为、规律、灵感
- [x] 4. 新增二级 pill 切换组件，行为下切换正确的事/错误的事
- [x] 5. 规律 Tab 下二级切换正向/负向（复用现有 laws 的 law_type 筛选）
- [x] 6. 灵感 Tab 下二级切换正向/负向（按 direction 字段筛选）

### Phase 3: 卡片视觉统一

- [x] 7. 重构 ActionCard 为统一三行骨架，去掉滑动手势和"左划查看详情"提示
- [x] 8. 重构 MistakeCard 为统一三行骨架
- [x] 9. 重构 LawCard 为统一三行骨架
- [x] 10. 重构灵感卡片为统一三行骨架，正向/负向不同色条

### Phase 4: 交互与筛选

- [x] 11. 统一交互：所有卡片点击进详情，长按出菜单
- [x] 12. 筛选栏统一为 [分类] [排序] 两个 select，排序选项因 Tab 而异
- [x] 13. 去掉状态筛选器，归档内容默认不显示

### Phase 5: 样式清理

- [x] 14. 清理 App.css 中废弃的滑动相关样式（swipe-*、action-card-detail-tip 等）
- [x] 15. 新增二级 pill 切换样式
