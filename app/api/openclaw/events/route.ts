import { NextResponse } from 'next/server';

import { authorizeAgentEventRequest } from '@/lib/agent-event-auth';
import { agentEventBus } from '@/lib/agent-event-bus';
import { openClawAdapterRuntime } from '@/lib/openclaw-adapter-runtime';
import { agentRegistry } from '@/lib/agent-registry';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  if (!authorizeAgentEventRequest(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: '请求体必须是 JSON' }, { status: 400 });
  }

  const result =
    isRecord(input) && input.kind === 'star.snapshot'
      ? openClawAdapterRuntime.starFallback.adapt(input.snapshot, {
          classroomAgentId:
            typeof input.classroomAgentId === 'string'
              ? input.classroomAgentId
              : '',
          snapshotId:
            typeof input.snapshotId === 'string' ? input.snapshotId : undefined,
        })
      : openClawAdapterRuntime.native.adapt(input);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  const unregistered = result.events.find(
    (event) => !agentRegistry.has(event.agentId),
  );
  if (unregistered) {
    return NextResponse.json(
      { ok: false, error: `Agent 尚未注册：${unregistered.agentId}` },
      { status: 409 },
    );
  }
  for (const event of result.events) agentEventBus.publish(event);
  return NextResponse.json({
    ok: true,
    accepted: result.events.length,
    ignored: result.ignored,
    events: result.events,
  });
}
