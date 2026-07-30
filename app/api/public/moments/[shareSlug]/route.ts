import { getPublicAgentMoment } from '@/lib/agent-moments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PUBLIC_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};

function publicJson(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: PUBLIC_HEADERS,
  });
}

export async function GET(
  _request: Request,
  context: { params: { shareSlug: string } },
) {
  const moment = await getPublicAgentMoment(context.params.shareSlug);
  return moment
    ? publicJson({ ok: true, moment })
    : publicJson({ ok: false, error: '成长瞬间不存在' }, 404);
}
