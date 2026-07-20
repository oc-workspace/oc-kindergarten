# OC Kindergarten Operations

## Recoverable archive rollout

可恢复归档不新增数据库 migration。部署前仍必须创建 PostgreSQL custom-format 备份、备份
mode `0600` 的 `.env`，并保留旧 app/migrator image tag。

```bash
./scripts/backup-database.sh
docker compose build oc-kindergarten migrate
docker compose run --rm migrate
docker compose up -d --no-build --no-deps --force-recreate oc-kindergarten
./scripts/verify-enrollment-api.sh
```

验收脚本使用自动清理的 verification parent/Agent，覆盖 active archive、重复 archive、
Registry/latest 清理、归档期间事件拒绝、跨家长认领拒绝、owner restore、重复 restore、恢复到
`suspended` 和显式 resume。脚本结束后必须确认临时 parent、enrollment、profile、binding、
event、cursor、latest state、outbox 和 command 均无残留。

自动化通过后，使用可丢弃的 `kg-archive-acceptance-*` OpenClaw Agent 验证真实 Casdoor
pairing、归档、双标签 Registry/SSE 移除、OpenClaw event 拒绝、恢复到暂停、显式恢复入园和
下一条真实 event 重新入场。不得使用需要保留的真实 Agent。

回滚只恢复旧 app/migrator image，不删除或改写数据库 volume。旧应用会继续隐藏已经归档的
记录，但不提供 restore；重新部署新应用后仍可恢复。不得通过清空 binding 的 `agent_id`
绕过审计关系。

## Secret and token rotation

所有新值使用密码管理器或受保护的 stdin 写入，不放入命令参数、shell history、日志、Git 或
`NEXT_PUBLIC_*`。轮换前备份 `.env` 到 root-only 目录并保持 `0600`，记录当前 image tag；
验收通过后再按保留策略销毁旧值。

### Admin token

同时轮换 `OC_KINDERGARTEN_ADMIN_TOKEN` 和
`OC_KINDERGARTEN_ADMIN_SESSION_SECRET`，再 force-recreate Web。验证旧 Bearer token 和
现有管理员 cookie 均返回 `401`，新凭据可以执行只读管理员请求。回滚时必须同时恢复两个
旧值，不能混用新旧组合。

### Agent event token

当前协议只接受一个 `OC_KINDERGARTEN_AGENT_EVENT_TOKEN`，因此使用受控短暂停机：

1. 暂停 OpenClaw Gateway 事件发送；
2. 在服务器 `.env` 写入新值并 recreate Web；
3. 把同一值写入 `plugins.entries.oc-kindergarten-bridge.config.token`；
4. 重启 Gateway，确认插件 loaded 且 `plugins doctor` 无错误；
5. 验证旧 token 返回 `401`，并用专用 Agent 验证 discovery、presence 和 state event。

服务器和 Gateway 任一侧失败时恢复两侧旧值，禁止只恢复一侧。

### Parent authentication secrets

轮换 `NEXTAUTH_SECRET` 会立即使全部家长 JWT session 失效，只在计划维护或安全事件中执行。
recreate Web 后验证旧 cookie 为 `401`，并重新完成 Casdoor 登录、callback、`/api/me` 和 owner
权限验收。

轮换 `CASDOOR_CLIENT_SECRET` 时先在 Casdoor 的 `oc-kindergarten` Application 建立新 secret，
再更新服务器 `.env` 并 recreate Web。验收新登录后撤销旧 secret，同时确认 organization、
精确 callback、空 `defaultGroup` 和 `isShared=false` 未改变。
