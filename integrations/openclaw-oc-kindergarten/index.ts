import { randomUUID } from "node:crypto";

type BridgeConfig = {
  endpoint?: string;
  token?: string;
  defaultAgentId?: string;
  agentMap?: Record<string, string>;
  unmappedAgentPolicy?: "skip" | "default";
};

type HookContext = {
  agentId?: string;
  runId?: string;
  sessionKey?: string;
  sessionId?: string;
};

const DEFAULT_ENDPOINT = "http://127.0.0.1:3000/api/openclaw/events";
const DEFAULT_AGENT_ID = "agent-scout";

function contextFields(context: HookContext) {
  return {
    ...(context.runId ? { runId: context.runId } : {}),
    ...(context.sessionKey ? { sessionKey: context.sessionKey } : {}),
    ...(context.sessionId ? { sessionId: context.sessionId } : {}),
  };
}

const plugin = {
  id: "oc-kindergarten-bridge",
  name: "OC Kindergarten Bridge",
  description: "Projects OpenClaw lifecycle hooks into Agent Event API v1.",
  register(api) {
    const config = (api.pluginConfig ?? {}) as BridgeConfig;
    const endpoint = config.endpoint?.trim() || DEFAULT_ENDPOINT;
    const token = config.token?.trim();
    const defaultAgentId = config.defaultAgentId?.trim() || DEFAULT_AGENT_ID;
    const agentMap = config.agentMap ?? {};
    const unmappedAgentPolicy = config.unmappedAgentPolicy ?? "skip";
    const gatewayInstanceId = randomUUID();
    const sessionAgentMap = new Map<string, string>();
    const warnedUnmappedAgentIds = new Set<string>();
    let bridgeSequence = 0;
    let deliveryQueue = Promise.resolve();

    const resolveClassroomAgentId = (
      context: HookContext,
    ): string | undefined => {
      if (context.agentId) {
        const mappedAgentId = agentMap[context.agentId]?.trim();
        if (mappedAgentId) return mappedAgentId;
        if (unmappedAgentPolicy === "default") return defaultAgentId;
        if (!warnedUnmappedAgentIds.has(context.agentId)) {
          warnedUnmappedAgentIds.add(context.agentId);
          api.logger.warn(
            `OC Kindergarten bridge skipped unmapped OpenClaw Agent: ${context.agentId}`,
          );
        }
        return undefined;
      }
      if (context.sessionKey && sessionAgentMap.has(context.sessionKey)) {
        return sessionAgentMap.get(context.sessionKey);
      }
      return defaultAgentId;
    };

    const post = async (payload: Record<string, unknown>) => {
      let lastError: unknown;
      for (const delayMs of [0, 250, 750]) {
        if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
          return;
        } catch (error) {
          lastError = error;
        } finally {
          clearTimeout(timeout);
        }
      }
      throw lastError instanceof Error ? lastError : new Error(String(lastError));
    };

    const enqueue = (payload: Record<string, unknown>) => {
      deliveryQueue = deliveryQueue
        .then(() => post(payload))
        .catch((error: unknown) => {
          api.logger.warn(
            `OC Kindergarten bridge delivery failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        });
      return deliveryQueue;
    };

    const emit = (
      hook: string,
      context: HookContext,
      data: Record<string, unknown>,
      forcedClassroomAgentId?: string,
    ) => {
      const classroomAgentId =
        forcedClassroomAgentId ?? resolveClassroomAgentId(context);
      if (!classroomAgentId) return;
      bridgeSequence += 1;
      if (context.sessionKey) {
        sessionAgentMap.set(context.sessionKey, classroomAgentId);
      }
      return enqueue({
        bridgeVersion: 1,
        kind: "openclaw.hook",
        bridgeEventId: `openclaw:${gatewayInstanceId}:${bridgeSequence}`,
        hook,
        classroomAgentId,
        observedAt: new Date().toISOString(),
        ...(context.agentId ? { nativeAgentId: context.agentId } : {}),
        ...contextFields(context),
        data,
      });
    };

    const configuredClassroomAgents = () =>
      [...new Set([defaultAgentId, ...Object.values(agentMap)].filter(Boolean))];

    api.on("gateway_start", (event) => {
      for (const classroomAgentId of configuredClassroomAgents()) {
        void emit("gateway_start", {}, { port: event.port }, classroomAgentId);
      }
    });

    // OpenClaw 2026.3.x calls this hook before_agent_start. The bridge keeps
    // the provider-neutral v1 wire name before_agent_run for compatibility
    // with the server adapter and newer Gateway releases.
    api.on("before_agent_start", (_event, context) => {
      void emit("before_agent_run", context, {});
    });

    api.on("before_tool_call", (event, context) => {
      void emit("before_tool_call", context, {
        toolName: event.toolName,
        ...(event.toolCallId ? { toolCallId: event.toolCallId } : {}),
      });
    });

    api.on("after_tool_call", (event, context) => {
      void emit("after_tool_call", context, {
        toolName: event.toolName,
        ...(event.toolCallId ? { toolCallId: event.toolCallId } : {}),
        ...(event.error ? { error: "tool_failed" } : {}),
        ...(event.durationMs !== undefined ? { durationMs: event.durationMs } : {}),
      });
    });

    api.on("agent_end", (event, context) => {
      void emit("agent_end", context, {
        success: event.success,
        ...(event.error ? { error: "agent_failed" } : {}),
        ...(event.durationMs !== undefined ? { durationMs: event.durationMs } : {}),
      });
    });

    api.on("message_sending", (_event, context) => {
      void emit("message_sending", context, {});
    });

    api.on("message_sent", (event, context) => {
      void emit("message_sent", context, {
        success: event.success,
        ...(event.error ? { error: "message_failed" } : {}),
      });
    });

    api.on("gateway_stop", async (event) => {
      for (const classroomAgentId of configuredClassroomAgents()) {
        await emit(
          "gateway_stop",
          {},
          { ...(event.reason ? { reason: event.reason } : {}) },
          classroomAgentId,
        );
      }
      await deliveryQueue;
    });
  },
};

export default plugin;
