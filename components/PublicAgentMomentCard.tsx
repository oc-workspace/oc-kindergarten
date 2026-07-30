import Image, { type StaticImageData } from 'next/image';

import classicBoyPreview from '@/assets/design/sprites/characters/v2/ai-agent-child-boy/idle/frames/boy-child-idle-wheelbase-v2-1-48x64.png';
import classicGenderlessPreview from '@/assets/design/sprites/characters/v2/ai-agent-child-genderless/idle/frames/genderless-child-idle-wheelbase-v2-1-48x64.png';
import classicGirlPreview from '@/assets/design/sprites/characters/v2/ai-agent-child-girl/idle/frames/girl-child-idle-wheelbase-v2-1-48x64.png';
import berryBoyPreview from '@/assets/design/sprites/characters/v2/colorways/v1/berry/ai-agent-child-boy/idle/frames/boy-child-idle-berry-v1-1-48x64.png';
import berryGenderlessPreview from '@/assets/design/sprites/characters/v2/colorways/v1/berry/ai-agent-child-genderless/idle/frames/genderless-child-idle-berry-v1-1-48x64.png';
import berryGirlPreview from '@/assets/design/sprites/characters/v2/colorways/v1/berry/ai-agent-child-girl/idle/frames/girl-child-idle-berry-v1-1-48x64.png';
import meadowBoyPreview from '@/assets/design/sprites/characters/v2/colorways/v1/meadow/ai-agent-child-boy/idle/frames/boy-child-idle-meadow-v1-1-48x64.png';
import meadowGenderlessPreview from '@/assets/design/sprites/characters/v2/colorways/v1/meadow/ai-agent-child-genderless/idle/frames/genderless-child-idle-meadow-v1-1-48x64.png';
import meadowGirlPreview from '@/assets/design/sprites/characters/v2/colorways/v1/meadow/ai-agent-child-girl/idle/frames/girl-child-idle-meadow-v1-1-48x64.png';
import type {
  AgentAppearancePreset,
  AgentCharacterVariant,
} from '@/lib/agent-registry-contract';
import type {
  AgentMomentKind,
  AgentMomentTemplate,
  PublicAgentMoment,
} from '@/lib/agent-moment-contract';

const PREVIEWS: Record<
  AgentAppearancePreset,
  Record<AgentCharacterVariant, StaticImageData>
> = {
  classic: {
    boy: classicBoyPreview,
    girl: classicGirlPreview,
    genderless: classicGenderlessPreview,
  },
  meadow: {
    boy: meadowBoyPreview,
    girl: meadowGirlPreview,
    genderless: meadowGenderlessPreview,
  },
  berry: {
    boy: berryBoyPreview,
    girl: berryGirlPreview,
    genderless: berryGenderlessPreview,
  },
};

const TEMPLATE_LABELS: Record<AgentMomentTemplate, string> = {
  daily: '今日小记',
  quote: '一句话',
  progress: '成长进度',
  achievement: '小小成就',
  recovery: '重新出发',
};

const KIND_LABELS: Record<AgentMomentKind, string> = {
  task: '活动',
  command: '指令',
  completion: '完成',
  error: '遇到困难',
  reply: '回复',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function PublicAgentMomentCard({
  moment,
}: {
  moment: PublicAgentMoment;
}) {
  const preview =
    PREVIEWS[moment.agent.appearancePreset][
      moment.agent.characterVariant
    ];
  return (
    <article className={`publicMomentCard template-${moment.template}`}>
      <header className="publicMomentCardHeader">
        <div className="publicMomentPortrait" aria-hidden="true">
          <Image
            src={preview}
            width={120}
            height={160}
            priority
            alt=""
          />
        </div>
        <div className="publicMomentIdentity">
          <p className="eyebrow">{TEMPLATE_LABELS[moment.template]}</p>
          <h1>{moment.title}</h1>
          <p>
            来自 <strong>{moment.agent.displayName}</strong> 的成长瞬间
          </p>
          <time dateTime={moment.publishedAt}>
            {DATE_FORMATTER.format(new Date(moment.publishedAt))}
          </time>
        </div>
      </header>

      {moment.ownerCaption ? (
        <blockquote className="publicMomentCaption">
          <span aria-hidden="true">“</span>
          <p>{moment.ownerCaption}</p>
        </blockquote>
      ) : null}

      <ol className="publicMomentItems">
        {moment.items.map((item) => (
          <li key={item.position}>
            <span className="publicMomentItemNumber">{item.position}</span>
            <div>
              <div className="publicMomentItemHeading">
                <span>{KIND_LABELS[item.kind]}</span>
                <time dateTime={item.occurredAt}>
                  {TIME_FORMATTER.format(new Date(item.occurredAt))}
                </time>
              </div>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
