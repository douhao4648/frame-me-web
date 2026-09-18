# frame-me-web 文档导航

`frame-me-web` 是管理后台前端脚手架（parent）：`packages/` 发包共享层 + `templates/admin` UI 壳模板 + `packages/create` 生成器。

## 文档地图

| 文档 | 回答的问题 |
|---|---|
| [../CLAUDE.md](../CLAUDE.md) | 项目身份、结构、命令、关键约定（入口） |
| [../README.md](../README.md) | 业务侧怎么用（npm init @frame-me）、开发本仓、发包流程 |
| [../templates/admin/README.md](../templates/admin/README.md) | 生成出的业务工程如何本地联调（sso/RP/audit 地址与 env） |

## 关键决策记录

1. **只做管理后台**：C 端到时候重做；微信小程序将来独立子工程（Taro）。
2. **UI 壳进模板、稳定层发包**：布局/菜单/登录每个项目都要改（Ant Design Pro 从依赖退回模板的教训）；config/request/api-types/create 稳定可版本化。
3. **api-types 打包的是「约定」**：多服务拆分、result.ts 辅助类型、命名规范；工具本体是 openapi-typescript。
4. **发包而非 file:/相对路径**：业务独立成仓，相对路径在 CI/Docker 必炸、无版本号漂移不可见。
5. **版本兼容链**（2026-09 实测）：TS 锁 6.0.3（typescript-eslint peer `<6.1.0`，TS 7 不可用）；ProComponents 用 v3 beta 锁 `3.1.14-7`（stable 2.x 官方仅支持 antd 4/5）；Node ≥22.12（Vite 8 engines），推荐 24 LTS。
6. **命名定为 frame-me-web**（2026-09-18，否掉 frame-me-builder/admin）：与 frame-me-parent 对仗；工程主体是端无关共享包（request/api-types 可被未来 C 端、小程序工程复用），不是纯构建器；包名 `@frame-me/*` 与目录名解耦，目录改名不影响已发布包。
