// 見た目の検査:文字が かさなっていないか・はみ出していないか・下が あきすぎていないか
// 使い方: node tools/test/overlap.js [docs/index.html] [結果.json] [学年(7 や 7,8,9)] [sub=1 で 小単元も]
//  - 図(SVG)の 中の 字どうしの かさなり / 図の わくから 字が 出ている
//  - 問題(li.item)の 字が 問題の わくから 横に 出ている
//  - 問題どうしが かさなっている
//  - 1まいだけの プリントで 下が 35% より あいている / さいごの ページが 65% より あいている
const { chromium } = require('playwright');
(async () => {
  const [file0 = 'docs/index.html', outJson, only, subMode] = process.argv.slice(2);
  const file = require('path').resolve(file0);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  const errs = []; pg.on('pageerror', (e) => errs.push(String(e)));
  await pg.emulateMedia({ media: 'print' });
  await pg.goto('file://' + file);
  await pg.waitForTimeout(400);
  const grades = only ? only.split(',') : await pg.$$eval('#grade option', (os) => os.map((o) => o.value));
  const rows = [];
  for (const g of grades) {
    const combos = await pg.evaluate(({ g, subMode }) => {
      const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change')); };
      set('grade', g);
      const out = [];
      for (const uo of [...document.getElementById('unit').options].filter((o) => !o.disabled)) {
        set('unit', uo.value);
        const subs = subMode === '1' && !document.getElementById('subWrap').hidden ? ['0', ...[...document.getElementById('subunit').options].map((x) => x.value).filter((v) => v !== '0')] : ['0'];
        for (const s of subs) {
          set('subunit', s);
          for (const k of [...document.getElementById('kind').options].filter((x) => !x.disabled)) out.push([uo.value, s, k.value]);
        }
      }
      return out;
    }, { g, subMode });
    for (const [u, s, k] of combos) {
      const lvls = s === '0' ? ['basic', 'challenge'] : ['normal'];
      for (const lv of lvls) {
        const r = await pg.evaluate(({ g, u, s, k, lv }) => {
          const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change')); };
          set('grade', g); set('unit', u);
          if (!document.getElementById('subWrap').hidden) set('subunit', s);
          set('kind', k); document.getElementById('level').value = lv;
          document.getElementById('seed').value = '7';
          document.getElementById('btnMake').click();
          const msg = document.getElementById('msg').textContent;
          const probs = [...document.querySelectorAll('#preview article.sheet:not(.answers)')];
          const all = [...document.querySelectorAll('#preview article.sheet')];
          const P = [];
          const inter = (a, c, pad = 0.8) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left) - pad) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) - pad);
          all.forEach((sh, pi) => {
            const ans = sh.classList.contains('answers') ? 'A' : 'P';
            // 図の中の 字
            for (const svg of sh.querySelectorAll('svg')) {
              const sr = svg.getBoundingClientRect();
              if (sr.width < 2) continue;
              const ts = [...svg.querySelectorAll('text')].map((t) => ({ t, r: t.getBoundingClientRect(), s: t.textContent.trim() })).filter((x) => x.r.width > 0.5 && x.s);
              for (let i = 0; i < ts.length; i++) {
                const a = ts[i].r;
                if (a.left < sr.left - 1.5 || a.right > sr.right + 1.5 || a.top < sr.top - 1.5 || a.bottom > sr.bottom + 1.5) P.push(`${ans}${pi + 1} 図の外:「${ts[i].s}」`);
                for (let j = i + 1; j < ts.length; j++) {
                  const c = ts[j].r, ov = inter(a, c);
                  if (ov > 0.25 * Math.min(a.width * a.height, c.width * c.height)) P.push(`${ans}${pi + 1} 字が かさなる:「${ts[i].s}」と「${ts[j].s}」`);
                }
              }
            }
            const body = sh.querySelector('.body');
            if (!body) return;
            const brr = body.getBoundingClientRect();
            // 問題の 字が わくの 外へ
            const items = [...sh.querySelectorAll('ol.items > li')];
            for (const li of items) {
              const lr = li.getBoundingClientRect();
              const tw = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
              let n;
              while ((n = tw.nextNode())) {
                if (!n.textContent.trim() || n.parentElement.closest('svg')) continue;
                const rg = document.createRange(); rg.selectNodeContents(n);
                const nonblankOut = (lim) => { const tx = n.textContent; for (let ci = tx.length - 1; ci >= 0; ci--) { if (/\s|\u3000/.test(tx[ci])) continue; const r1 = document.createRange(); r1.setStart(n, ci); r1.setEnd(n, ci + 1); for (const q of r1.getClientRects()) if (q.right > lim.r || q.left < lim.l) return true; } return false; };
                for (const rr of rg.getClientRects()) {
                  if (rr.width < 1) continue;
                  if ((rr.right > Math.max(lr.right, brr.right) + 2 || rr.left < Math.min(lr.left, brr.left) - 2) && nonblankOut({ r: Math.max(lr.right, brr.right) + 2, l: Math.min(lr.left, brr.left) - 2 })) { P.push(`${ans}${pi + 1} 字が はみ出す:「${n.textContent.trim().slice(0, 12)}」`); break; }
                }
              }
              // 答えの 四角から 字が はみ出す
              for (const bx of li.querySelectorAll('.abox')) if (bx.scrollWidth > bx.clientWidth + 2) P.push(`${ans}${pi + 1} 四角から はみ出す:「${bx.textContent.trim().slice(0, 12)}」`);
            }
            // 問題どうしが かさなる
            for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
              const a = items[i].getBoundingClientRect(), c = items[j].getBoundingClientRect();
              if (inter(a, c, 2) > 4) P.push(`${ans}${pi + 1} 問題が かさなる`);
            }
          });
          // 下の あき(問題の ページ)
          const free = probs.map((p) => {
            const body = p.querySelector('.body'), br = body.getBoundingClientRect();
            let bot = br.top;
            for (const li of body.querySelectorAll('ol.items > *')) { const r = li.getBoundingClientRect(); bot = Math.max(bot, r.bottom - (parseFloat(li.style.paddingBottom) || 0)); }
            for (const bl of body.children) if (!bl.querySelector('ol.items')) bot = Math.max(bot, bl.getBoundingClientRect().bottom);
            return Math.round((br.bottom - bot) / br.height * 100);
          });
          return { msg, P: [...new Set(P)], free, cnt: document.getElementById('count').value };
        }, { g, u, s, k, lv });
        rows.push({ id: `${g}/${u}/${s}/${k}/${lv}`, ...r });
      }
    }
  }
  if (outJson) require('fs').writeFileSync(outJson, JSON.stringify(rows));
  const bad = rows.filter((r) => r.P.length || r.msg);
  const space = rows.filter((r) => r.free.length && ((r.free.length === 1 && r.free[0] > 35) || (r.free.length > 1 && r.free[r.free.length - 1] > 65)));
  console.log('cases', rows.length, 'problems', bad.length, 'space', space.length, 'pageerrors', errs.length);
  for (const r of bad.slice(0, 60)) console.log(' ', r.id, r.msg || '', r.P.slice(0, 3).join(' / '));
  await b.close();
})();
