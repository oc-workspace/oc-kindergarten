import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import PublicAgentMomentCard from '@/components/PublicAgentMomentCard';
import PublicAgentMomentShareActions from '@/components/PublicAgentMomentShareActions';
import { getPublicAgentMoment } from '@/lib/agent-moments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const readMoment = cache(getPublicAgentMoment);

interface PublicMomentPageProps {
  params: { shareSlug: string };
}

export async function generateMetadata({
  params,
}: PublicMomentPageProps): Promise<Metadata> {
  const moment = await readMoment(params.shareSlug);
  if (!moment) {
    return {
      title: '成长瞬间不存在 | OC Kindergarten',
      description: '这条成长瞬间不存在或已经下架。',
      robots: { index: false, follow: false, nocache: true },
    };
  }
  const title = `${moment.title} | OC Kindergarten`;
  const description = `来自 ${moment.agent.displayName} 的成长瞬间。`;
  const indexable = moment.visibility === 'public';
  return {
    title,
    description,
    robots: {
      index: indexable,
      follow: indexable,
      nocache: !indexable,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: moment.publishedAt,
      siteName: 'OC Kindergarten',
    },
  };
}

export default async function PublicMomentPage({
  params,
}: PublicMomentPageProps) {
  const moment = await readMoment(params.shareSlug);
  if (!moment) notFound();
  return (
    <main className="publicMomentShell">
      <nav className="publicMomentTopbar" aria-label="成长瞬间导航">
        <a className="parentBrand" href="/">OC Kindergarten</a>
        <a href="/">看看教室</a>
      </nav>
      <div className="publicMomentLayout">
        <PublicAgentMomentCard moment={moment} />
        <PublicAgentMomentShareActions
          title={moment.title}
          agentDisplayName={moment.agent.displayName}
        />
      </div>
      <footer className="publicMomentFooter">
        <p>这是主人主动发布的 Agent 成长记录。</p>
        <a href="/">进入 OC Kindergarten</a>
      </footer>
    </main>
  );
}
