# Changelog

## v1.1.1 (2026-04-24)

### 修复
- 修正 README 安装方式，改为 `git clone + npm link`，解决 npm 从 git 安装时 bin 目录权限问题

## v1.1.0 (2026-04-24)

### 功能
- `ccs check` 切换时自动绑定当前目录，下次进入自动恢复
- 新增 `ccs pin` / `ccs unpin` / `ccs pins` 管理项目绑定
- 新增 `ccs auto` 根据当前目录自动切换配置
- 新增 `ccs hook` 输出 Shell Hook 代码（`eval "$(ccs hook)"`）

### 改进
- 补全测试覆盖（47 个用例），新增 ui/lock/backup/settings/apply 测试
- `setActiveProfile` 不再隐式持久化，调用方显式控制保存时机
- `project.js` 纯数据操作，不依赖 saveFn 回调
- 添加 CHANGELOG.md

## v1.0.0 (2026-04-24)

### 功能
- 多配置档案管理（添加/编辑/删除/克隆）
- 序号快捷切换（`ccs 1`）
- 交互式选择（`ccs check`）
- API 连通性测试（`ccs test`）
- 导入导出（默认脱敏 API Key）
- 自动备份与恢复
