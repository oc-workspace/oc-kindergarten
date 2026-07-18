import { agentEventBus } from '@/lib/agent-event-bus';
import { AgentRuntimeEvent } from '@/lib/agent-event-contract';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const encoder = new TextEncoder();

function encodeEvent(event: AgentRuntimeEvent): Uint8Array {
  return encoder.encode(`id: ${event.eventId}\ndata: ${JSON.stringify(event)}\n\n`);
}

export async function GET(request: Request) {
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(': Agent Event API v1\n\n'));
      unsubscribe = agentEventBus.subscribe((event) => {
        try {
          controller.enqueue(encodeEvent(event));
        } catch {
          unsubscribe();
        }
      });
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        } catch {
          if (heartbeat) clearInterval(heartbeat);
          unsubscribe();
        }
      }, 15000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe();
    },
  });

  request.signal.addEventListener('abort', () => {
    if (heartbeat) clearInterval(heartbeat);
    unsubscribe();
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
