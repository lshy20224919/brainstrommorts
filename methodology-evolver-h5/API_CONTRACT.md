# 后端状态说明

## 当前状态

纯前端 Mock 实现，所有数据通过 `localStorage` 持久化（见 `src/mock.js`）。无真实后端服务。

## API 资源清单

| 资源 | 方法 | 说明 |
|------|------|------|
| categories | GET / POST / PUT / DELETE | 分类 CRUD |
| actions | GET / POST / PUT / DELETE | 正确的事 CRUD + 打卡 + 归档 |
| laws | GET / POST / PUT / DELETE | 规律 CRUD |
| mistakes | GET / POST / PUT / DELETE | 错误的事 CRUD |
| inspirations | GET / POST / PUT / DELETE | 灵感 CRUD + 转化 |
| records | GET | 打卡记录（按 action_id 查询） |
| sops | GET / POST / PUT / DELETE | SOP 模板 CRUD + 执行 |
| reviews | GET | 复盘记录 |
| settings | GET / PUT | 用户设置 |
| rankConfig | GET / PUT | 榜单配置 |

## 数据持久化

- 存储 key: `methodology_evolver_data`
- 版本号: `DATA_VERSION = 4`
- 首次加载写入默认数据，后续读写 localStorage

## 迁移路径

当需要接入真实后端时：

1. 保持 `api` 对象的方法签名不变
2. 将 `mock.js` 中的实现替换为 HTTP 请求（fetch / axios）
3. 移除 localStorage 持久化逻辑
4. 后端需实现相同的数据结构和筛选参数
5. 认证方案待定（微信小程序 openid / H5 token）
