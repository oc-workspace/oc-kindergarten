import { NextResponse } from 'next/server';

import { authorizeAgentEventRequest } from '@/lib/agent-event-auth';
import { agentEventBus } from '@/lib/agent-event-bus';
import { parseAgentRuntimeEvent } from '@/lib/agent-event-contract';
import { agentRegistry } from '@/lib/agent-registry';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    schemaVersion: 1,
    events: agentEventBus.snapshot(),
  });
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

  const candidate =
    typeof input === 'object' && input !== null && 'event' in input
      ? (input as { event: unknown }).event
      : input;
  const parsed = parseAgentRuntimeEvent(candidate);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  if (!agentRegistry.has(parsed.event.agentId)) {
    return NextResponse.json(
      { ok: false, error: 'Agent 尚未注册' },
      { status: 409 },
    );
  }
  agentEventBus.publish(parsed.event);
  return NextResponse.json({ ok: true, accepted: 1, event: parsed.event });
}
