# OC Kindergarten OpenClaw Bridge

This local-development OpenClaw plugin observes typed runtime hooks and posts a
small bridge payload to OC Kindergarten. It never sends tool parameters,
complete prompts, or session history. For the classroom status and speech
bubble, it sends only the bounded final assistant message; a Telegram router
may separately send the bounded original user message plus display-only sender
context through the `message_received` bridge hook.

Install it from the OpenClaw host:

```bash
openclaw plugins install --link /absolute/path/to/oc-kindergarten/integrations/openclaw-oc-kindergarten
openclaw plugins enable oc-kindergarten-bridge
```

Configure `plugins.entries.oc-kindergarten-bridge.config` in `openclaw.json`:

```json5
{
  endpoint: "http://127.0.0.1:3001/api/openclaw/events",
  token: "replace-with-the-same-server-token",
  defaultAgentId: "agent-scout",
  agentMap: {
    main: "agent-scout",
    writer: "agent-bloom",
    builder: "agent-spark",
  },
  unmappedAgentPolicy: "skip",
}
```

`agentMap` 的目标 ID 必须已经存在于 Agent Registry。默认策略会跳过未映射的
OpenClaw 原生 Agent，避免把多个身份合并到同一个教室角色；只有旧系统兼容时才设置
`unmappedAgentPolicy: "default"`。

普通生命周期 payload 只包含 hook、Agent/会话标识、工具名、耗时、成功与否等运行元数据。
Bridge 不会把 `before_agent_start` 的完整 prompt 当作用户消息；消息正文只允许通过明确的
`message_received` 事件发送，并限制为 280 个字符。工具参数、原始错误文本和会话历史不会
离开 Gateway。

Set the same token as `OC_KINDERGARTEN_AGENT_EVENT_TOKEN` for the Next.js
server, restart both processes, then verify the live plugin registration:

```bash
openclaw plugins inspect oc-kindergarten-bridge --runtime --json
```

For Star-Office-UI compatibility without the native plugin, run:

```bash
STAR_OFFICE_STATE_FILE=/path/to/state.json \
OC_KINDERGARTEN_AGENT_ID=agent-scout \
OC_KINDERGARTEN_OPENCLAW_ENDPOINT=http://127.0.0.1:3001/api/openclaw/events \
node push-star-state.mjs
```
