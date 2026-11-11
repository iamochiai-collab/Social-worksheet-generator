// 使い方: node tools/test/firstopen.js docs/index.html
// メニューからはじめて開いたときと、「作成」を押したときで、ページ分けが同じになるか
const { chromium } = require((() => { try { return require.resolve('playwright'); } catch (e) { return require('child_process').execSync('npm root -g').toString().trim() + '/playwright'; } })());
(async () => {
  const file = process.argv[2];
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 1000 } });
  const sig = () => pg.evaluate(() => [...document.querySelectorAll('#preview article.sheet')].map(a => [...a.querySelectorAll('.body > .block')].map(x => x.dataset.sec + ':' + x.querySelectorAll('li.item').length).join(',') + '|' + [...a.querySelectorAll('.figure')].map(f => f.style.zoom || '1').join(',')).join(' / '));
  let bad = 0, n = 0;
  for (const [g, unit, kind] of [[4, 'e4-01', 'figure'], [3, 'e3-01', 'figure'], [5, 'e5-03', 'figure'], [2, 'e2-02', 'word'], [6, 'e6-02', 'test'], [1, 'e1-01', 'figure'], [7, 'ct-02', 'drill'], [8, 'rk-08', 'figure'], [9, 'km-10', 'test'], [24, 's24-05', 'figure'], [5, 'e5-07', 'practice']]) {
    await pg.goto('file://' + require('path').resolve(file)); await pg.waitForTimeout(300);
    await pg.evaluate((g) => { localStorage.clear(); }, g);
    await pg.evaluate(([g, unit, kind]) => {
      // メニューの学年をえらんで、単元のボタンをおす
      const hb = document.querySelector(`.hg[data-grade="${g}"]`);
      if (!hb) { document.getElementById('tkBanner').click(); }
      document.querySelector(`.hg[data-grade="${g}"]`).click();
      document.querySelector(`.uk[data-unit="${unit}"][data-kind="${kind}"]`).click();
    }, [g, unit, kind]);
    await pg.waitForTimeout(300);
    const a = await sig();
    await pg.click('#btnMake'); await pg.waitForTimeout(300);
    const c = await sig(); n++;
    if (a !== c) { bad++; console.log('DIFF', unit, '\n  first:', a.slice(0, 200), '\n  make :', c.slice(0, 200)); }
  }
  console.log(`checked ${n}, different ${bad}`); await b.close();
})();
