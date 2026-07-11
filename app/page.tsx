const modules = [
  { title: 'Enrollment', note: 'Track children, guardians, class assignment, and onboarding state.' },
  { title: 'Attendance', note: 'Prepare daily check-in, absence, late arrival, and pickup workflows.' },
  { title: 'Communication', note: 'Keep family notices, teacher notes, and follow-up reminders in one place.' },
  { title: 'Operations', note: 'Leave room for meals, activities, incidents, permissions, and audit history.' },
];

export default function HomePage() {
  return (
    <main className="appShell">
      <header className="topbar">
        <div className="topbarInner">
          <div>
            <h1 className="brandTitle">OC Kindergarten</h1>
            <p className="brandSub">Internal kindergarten operations workspace</p>
          </div>
          <div className="statusStrip">
            <span className="pill pillStrong">Project scaffold</span>
            <span className="pill">Next.js standalone</span>
            <span className="pill">Docker compose ready</span>
          </div>
        </div>
      </header>
      <section className="kindergartenHero">
        <div>
          <p className="eyebrow">First project baseline</p>
          <h2>Build the operating surface before adding product-specific workflows.</h2>
          <p>这个新项目先保持干净骨架：沿用 rococo-outreach 的 Next.js + Docker 部署结构，但不复制 outreach 的业务状态和联系人模块。</p>
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
