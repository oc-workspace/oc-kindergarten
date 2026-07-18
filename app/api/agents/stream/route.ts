import { agentRegistry, AgentRegistryChange } from '@/lib/agent-registry';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const encoder = new TextEncoder();

function encodeChange(change: AgentRegistryChange): Uint8Array {
  return encoder.encode(
    `id: registry:${change.revision}\ndata: ${JSON.stringify(change)}\n\n`,
  );
}

export async function GET(request: Request) {
  let unsubscribe = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(': Agent Registry API v1\n\n'));
      for (const profile of agentRegistry.snapshot()) {
        controller.enqueue(
          encodeChange({
            type: 'agent.profile.upserted',
            agentId: profile.agentId,
            profile,
            revision: profile.revision,
            observedAt: profile.updatedAt,
          }),
        );
      }
      unsubscribe = agentRegistry.subscribe((change) => {
        try {
          controller.enqueue(encodeChange(change));
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
