## 1. Mock 数据层扩展

- [x] 1.1 在 mock.js 中新增 settings 对象（smart_migrate_on、warning_popup_on、dark_mode、register_time）
- [x] 1.2 新增 api.settings.get() 和 api.settings.update(patch) 方法
- [x] 1.3 新增 api.categories.add(name)、api.categories.rename(id, name)、api.categories.remove(id)、api.categories.reorder(id, direction) 方法

## 2. ProfilePage 基础结构

- [x] 2.1 重写 ProfilePage.jsx，搭建页面骨架（用户信息卡片 + 数据概览 + 设置分组容器）
- [x] 2.2 实现用户信息卡片组件（头像、昵称、使用天数计算）
- [x] 2.3 实现数据概览条组件（总动作数、总规律数、累计打卡次数，从 mock 聚合）

## 3. 通用设置模块

- [x] 3.1 实现智能迁移开关（toggle + 状态同步到 mock）
- [x] 3.2 实现避雷弹窗开关（toggle + 状态同步到 mock）
- [x] 3.3 实现深色模式三档选择器（radio group：浅色/深色/跟随系统）

## 4. 分类管理模块

- [x] 4.1 实现分类管理行的展开/折叠交互
- [x] 4.2 实现分类列表渲染（名称 + 操作按钮：改名、上移、下移、删除）
- [x] 4.3 实现新增分类功能（底部输入框 + 确认按钮 + 非空校验）
- [x] 4.4 实现分类改名功能（点击改名进入编辑模式，确认保存）
- [x] 4.5 实现分类排序功能（上移/下移按钮交换位置）
- [x] 4.6 实现删除分类功能（系统默认分类禁止删除，自定义分类需确认）

## 5. 数据管理模块

- [x] 5.1 实现云端备份模拟交互（确认弹窗 → loading 1.5s → 成功提示）
- [x] 5.2 实现数据还原模拟交互（风险确认弹窗 → loading 1.5s → 成功提示）
- [x] 5.3 实现数据统计行（显示"N 条记录"）

## 6. 关于与样式

- [x] 6.1 实现关于区（版本号 v1.0.0）
- [x] 6.2 在 App.css 中添加 ProfilePage 相关样式，与现有页面风格一致
