# 算数プリントの新しいホーム(タブ・お気に入り・あたらしくなったこと・分野べつ など)を入れたあとの、社会プリント用の書きかえ
# (src/template.html を 算数の template と 3-way マージしたあとに 1回だけあてる。HANDOFF.md の「算数の template を新しくしたとき」)
import pathlib, re
p = pathlib.Path('src/template.html')
s = p.read_text(encoding='utf-8')
def R(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)
# 分野べつ:特別支援(知的障害)社会の内容 ア〜カ
R('var DOMAINS = ["数量の基礎", "数と計算", "図形", "測定", "変化と関係", "データの活用"];', 'var DOMAINS = ["社会参加ときまり", "公共施設と制度", "地域の安全", "産業と生活", "我が国の地理や歴史", "外国の様子"];')
i = s.index('  var DOMAIN_SUBS = {')
j = s.index('  // 単元の分野(「A 数と計算」→「数と計算」)')
s = s[:i] + '  // 社会:小分類はまだない\n  var DOMAIN_SUBS = {};\n' + s[j:]
R('var domainOf = (g3, u2) => g3 === 29 ? "測定" : g3 === 30 ? "数と計算" : g3 === 28 ? null : String(u2.domain || "").replace(/^[A-ZＡ-Ｚ]\\s*/, "");', 'var domainOf = (g3, u2) => String(u2.domain || "").replace(/^[ア-カA-ZＡ-Ｚ]\\s*/, "");')
R('var DOMAIN_ICON = { "数量の基礎": "{{UI:dm_kiso}}", "数と計算": "{{UI:dm_keisan}}", "図形": "{{UI:dm_zukei}}", "測定": "{{UI:dm_sokutei}}", "変化と関係": "{{UI:dm_henka}}", "データの活用": "{{UI:dm_data}}" };', 'var DOMAIN_ICON = { "社会参加ときまり": "{{UI:dm_kimari}}", "公共施設と制度": "{{UI:dm_shisetsu}}", "地域の安全": "{{UI:dm_anzen}}", "産業と生活": "{{UI:dm_sangyo}}", "我が国の地理や歴史": "{{UI:dm_chiri}}", "外国の様子": "{{UI:dm_gaikoku}}" };')
i = s.index('  var DSUB_ICON = {')
j = s.index('\n', i)
s = s[:i] + '  var DSUB_ICON = {};' + s[j:]
R('homeDomain = t === "domain" ? (DOMAINS.includes(store.get("domain")) ? store.get("domain") : "数と計算") : null;', 'homeDomain = t === "domain" ? (DOMAINS.includes(store.get("domain")) ? store.get("domain") : DOMAINS[0]) : null;')
s = s.replace('上の「長さ」「かけ算」などで、もっと しぼれます。', '')
# タブ
R('{ id: "grade", label: "学年べつ", sub: "ようじ・小学校・中学・高校", icon: "{{UI:tab_grade}}" },', '{ id: "grade", label: "学年べつ", sub: "小学校・中学(地理・歴史・公民)", icon: "{{UI:tab_grade}}" },')
# あたらしく なったこと(社会プリント)
i = s.index('  var CHANGES = [')
j = s.index('  ].slice(0, 10);', i)
s = s[:i] + '''  var CHANGES = [
    { d: "26/11/26", t: "ホームを 算数プリントと おなじ 形に(ロゴ・3つの タブ・お気に入り・カードの 見本・うごく UI)", tag: "ホーム" },
    { d: "26/11/26", t: "分野べつ:特別支援の 内容を ア〜カの 分野ごとに 見られる", domain: "我が国の地理や歴史" },
    { d: "26/11/26", t: "まとめて作る:「画面に 出す」・プリント画面の 下に ページの ボタン", tag: "プリント" },
    { d: "26/11/20", t: "メニューの 上に、ほかの 教科(国語・算数・理科)へ 移れる ボタン", tag: "ホーム" },
    { d: "26/11/12", t: "地図・資料の 答えは 問いの うしろの 四角に(長い 線を やめた)", g: 4, unit: "e4-22", sub: 1, kind: "figure" },
    { d: "26/11/11", t: "都道府県チャレンジ:都道府県の ようす(県の 地図と ポイント)", g: 4, unit: "e4-21", sub: 1, kind: "figure" },
    { d: "26/11/11", t: "都道府県チャレンジ:内陸にある 都道府県", g: 4, unit: "e4-22", sub: 2, kind: "figure" },
    { d: "26/11/11", t: "都道府県チャレンジ:動物の 漢字が つく 都道府県(県の 形)", g: 4, unit: "e4-23", sub: 2, kind: "figure" },
    { d: "26/11/11", t: "都道府県チャレンジ:特産物と 産地", g: 4, unit: "e4-24", sub: 2, kind: "figure" },
    { d: "26/11/11", t: "社会プリント 第1版(小1・2 さきどり社会〜中学 地理・歴史・公民)", g: 5, unit: "e5-03", sub: 2, kind: "figure" }
''' + s[j:]
p.write_text(s, encoding='utf-8')
print('ok')
# 2回目にあてるとき用(1回目のあとに足した分)
s = p.read_text(encoding='utf-8')
s = s.replace('drill: "計算問題", word: "基本問題", figure: "図・実験"', 'drill: "一問一答", word: "基本問題", figure: "地図・資料"')
s = s.replace('(れい:グラフ、時計、分数)', '(れい:地図記号、都道府県、江戸時代)')
s = s.replace('第1版(2026-11-11)', '第2版(2026-11-26)')
p.write_text(s, encoding='utf-8')
s = p.read_text(encoding='utf-8')
a = '@media print { .xsite { display: none !important; } }\n'
if '.xsite-a { padding: 3px 9px' not in s:
    s = s.replace(a, a + '@media (max-width: 440px) { .xsite { gap: 4px 5px; flex-wrap: nowrap; } .xsite-a { padding: 3px 9px; font-size: 13px; } .xsite-lbl { font-size: 12px; } }\n')
p.write_text(s, encoding='utf-8')
