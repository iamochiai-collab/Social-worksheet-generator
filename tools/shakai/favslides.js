const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('file://' + process.cwd() + '/docs/index.html');
  await p.waitForTimeout(600);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload(); await p.waitForTimeout(600);
  // 4年 都道府県チャレンジ の 地図・資料
  await p.click('.hg[data-g="4"], button.hg:has-text("4")').catch(() => {});
  await p.waitForTimeout(300);
  await p.click('.uk[data-unit="e4-22"][data-kind="figure"]');
  await p.waitForTimeout(900);
  const ring = async (sel, tag, tagBelow = true) => p.evaluate(([sel, tag, tagBelow]) => {
    document.querySelectorAll('.zz').forEach((e) => e.remove());
    const r = document.querySelector(sel).getBoundingClientRect();
    const d = document.createElement('div'); d.className = 'zz';
    Object.assign(d.style, { position: 'fixed', left: r.left - 5 + 'px', top: r.top - 5 + 'px', width: r.width + 10 + 'px', height: r.height + 10 + 'px', border: '4px solid #e0464e', borderRadius: '12px', boxShadow: '0 0 0 6px rgba(224,70,78,.18)', zIndex: 9999, boxSizing: 'border-box', pointerEvents: 'none' });
    document.body.appendChild(d);
    if (tag) {
      const t = document.createElement('div'); t.className = 'zz'; t.textContent = tag;
      Object.assign(t.style, { position: 'fixed', top: (tagBelow ? r.bottom + 10 : r.top - 40) + 'px', left: Math.min(r.left + r.width / 2, 300) + 'px', transform: 'translateX(-50%)', background: '#e0464e', color: '#fff', font: '700 15px sans-serif', padding: '7px 14px', borderRadius: '999px', zIndex: 10000, whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,.2)' });
      document.body.appendChild(t);
    }
  }, [sel, tag, tagBelow]);
  await p.evaluate(() => window.scrollTo(0, 0));
  await ring('#btnFav', '☆ を おす');
  await p.screenshot({ path: '/tmp/f1.png', clip: { x: 0, y: 0, width: 390, height: 250 } });
  await p.evaluate(() => document.querySelectorAll('.zz').forEach((e) => e.remove()));
  await p.click('#btnFav'); await p.waitForTimeout(500);
  await ring('#btnFav', null);
  const msgSel = await p.evaluate(() => { const els = [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /お気に入りに 入れました/.test(e.textContent)); if (!els.length) return null; els[0].id = els[0].id || 'zzmsg'; return '#' + els[0].id; });
  await p.evaluate((ms) => { const r = document.querySelector(ms).getBoundingClientRect(); const d = document.createElement('div'); d.className = 'zz'; Object.assign(d.style, { position: 'fixed', left: r.left - 6 + 'px', top: r.top - 4 + 'px', width: r.width + 12 + 'px', height: r.height + 8 + 'px', border: '4px solid #e0464e', borderRadius: '12px', zIndex: 9999, boxSizing: 'border-box' }); document.body.appendChild(d); }, msgSel);
  await p.screenshot({ path: '/tmp/f2.png', clip: { x: 0, y: 0, width: 390, height: 250 } });
  await p.evaluate(() => document.querySelectorAll('.zz').forEach((e) => e.remove()));
  // ホームへ
  await p.click('.btn-home, button:has-text("メニュー")'); await p.waitForTimeout(800);
  await p.evaluate(() => window.scrollTo(0, 0));
  await ring('.fv-chip', 'おすと すぐ つくれる');
  await p.screenshot({ path: '/tmp/f3.png', clip: { x: 0, y: 0, width: 390, height: 250 } });
  await b.close();
})();
