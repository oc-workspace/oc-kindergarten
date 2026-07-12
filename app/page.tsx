const modules = [
  { title: 'Idle', note: 'Agents stand or rest in calm community spaces while waiting for work.' },
  { title: 'Researching', note: 'Reading corners and bookshelves show agents gathering information.' },
  { title: 'Executing', note: 'Block tables and craft areas represent active tool execution.' },
  { title: 'Syncing', note: 'Notice boards and mail stations visualize coordination between agents.' },
];

export default function HomePage() {
  return (
    <main className="appShell">
      <header className="topbar">
        <div className="topbarInner">
          <div>
            <h1 className="brandTitle">OC Kindergarten</h1>
            <p className="brandSub">AI agent kindergarten community</p>
          </div>
          <div className="statusStrip">
            <span className="pill pillStrong">3 agent children</span>
            <span className="pill">48x64 sprites</span>
            <span className="pill">32px world grid</span>
          </div>
        </div>
      </header>
      <section className="kindergartenHero">
        <div>
          <p className="eyebrow">Current production baseline</p>
          <h2>用幼儿园小社区呈现 AI 助手正在做什么。</h2>
          <p>角色 planted idle 已完成。下一阶段将用教室、阅读角和积木区验证角色在 32px tile 场景中的比例与状态表达。</p>
        </div>
      </section>
      <section className="kindergartenGrid" aria-label="Planned modules">
        {modules.map((module) => (
          <article className="kindergartenCard" key={module.title}>
            <h3>{module.title}</h3>
            <p>{module.note}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
