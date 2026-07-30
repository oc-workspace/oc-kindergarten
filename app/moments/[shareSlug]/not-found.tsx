export default function PublicMomentNotFound() {
  return (
    <main className="publicMomentShell publicMomentNotFound">
      <nav className="publicMomentTopbar" aria-label="成长瞬间导航">
        <a className="parentBrand" href="/">OC Kindergarten</a>
      </nav>
      <section>
        <p className="eyebrow">Moment unavailable</p>
        <h1>这条成长瞬间不存在或已经下架</h1>
        <p>
          链接可能已经失效，也可能从未公开。为了保护主人和 Agent，
          我们不会透露具体原因。
        </p>
        <a className="publicMomentPrimaryAction" href="/">
          返回教室
        </a>
      </section>
    </main>
  );
}
