# 理科プリントの template.html を 社会プリント 用に書きかえる(1回だけ使う)
import pathlib, re
p = pathlib.Path('src/template.html')
s = p.read_text(encoding='utf-8')
def R(a, b, n=None):
    global s
    c = s.count(a)
    assert c >= 1 and (n is None or c == n), (c, a[:80])
    s = s.replace(a, b)
V = '第1版(2026-11-11)'
R('第1版(2026-11-04)', V)
R('<title>理科プリント</title>', '<title>社会プリント</title>')
R('小学1・2年の生活科から中学3年の理科まで、単元ごとの理科プリントを作って印刷できます。', '小学3年から中学(地理・歴史・公民)まで、単元ごとの社会プリントを作って印刷できます。')
R('content="理科プリント"', 'content="社会プリント"')
R('Science-worksheet-generator', 'Social-worksheet-generator')
R('<h1>理科プリント<span class="version" id="versionHome"></span></h1>', '<h1>社会プリント<span class="version" id="versionHome"></span></h1>')
i = s.index('<p>小学校1・2年(生活科) ・ 小学校3〜6年の理科')
j = s.index('</p>', i)
s = s[:i] + '<p>小学校1・2年のさきどり社会 ・ 小学校3〜6年の社会 ・ 中学の地理・歴史・公民。単元は教科書でよくある順にならべています。学年をえらんで、単元のボタンをおすとプリントができます。</p>' + s[j + 4:]
R('<h1>理科プリント</h1>', '<h1>社会プリント</h1>')
R('<span class="subtitle" id="subtitle">小学校3〜6年 理科</span>', '<span class="subtitle" id="subtitle">小学校3〜6年 社会</span>')
R('理科プリント.html を長押し', '社会プリント.html を長押し')
R('<footer class="site-footer">理科プリント', '<footer class="site-footer">社会プリント')
s = s.replace('(小学部は生活、中学部・高等部は理科)', '(小学部は生活、中学部・高等部は社会)')
s = s.replace('理科プリントでは、まだヒントのある問題はほとんどありません', '社会プリントでは、まだヒントのある問題はほとんどありません')
s = s.replace('「基本問題」「図・実験」', '「基本問題」「地図・資料」')
s = s.replace('単元まで、単元ごとの理科プリントを作って印刷できます。', '単元まで、単元ごとの社会プリントを作って印刷できます。')
# 種類
R('drill: { label: "計算問題", sheetLabel: "{計算|けいさん}{問題|もんだい}", counts: [6, 10, 15], defaultCount: 10 },', 'drill: { label: "一問一答", sheetLabel: "{一問一答|いちもんいっとう}", counts: [10, 15, 20], defaultCount: 10 },')
R('figure: { label: "図・実験", sheetLabel: "{図|ず}・{実験|じっけん}", counts: [1, 2, 3, 4], defaultCount: 2 },', 'figure: { label: "地図・資料", sheetLabel: "{地図|ちず}・{資料|しりょう}", counts: [1, 2, 3, 4], defaultCount: 2 },')
s = re.sub(r'var SUB_KIND = \{[^}]*\};', 'var SUB_KIND = { drill: "一問一答", word: "基本", figure: "地図・資料", yoji: "え" };', s)
s = s.replace('var KIND_SHORT = { drill: "計算問題", word: "基本問題", figure: "図・実験",', 'var KIND_SHORT = { drill: "一問一答", word: "基本問題", figure: "地図・資料",')
# 学年(3〜6:小学校、7:地理、8:歴史、9:公民)
i = s.index('  var GRADES = Object.fromEntries(')
j = s.index('\n', i)
G = {1: 'e1Grade', 2: 'e2Grade', 3: 'e3Grade', 4: 'e4Grade', 5: 'e5Grade', 6: 'e6Grade', 7: 'ctGrade', 8: 'rkGrade', 9: 'kmGrade'}
s = s[:i] + '  var GRADES = Object.fromEntries(Object.entries({ ' + ', '.join(f'{k}: typeof {v} !== "undefined" ? {v} : null' for k, v in G.items()) + ' }).filter(([, v]) => v));' + s[j:]
R('g3 >= 7 ? `中${g3 - 6}` : `${g3}年`);', 'g3 >= 7 ? CHU_NAMES[g3] : `${g3}年`);')
R('  var isStage = (g3) => Number(g3) >= 21;', '  var isStage = (g3) => Number(g3) >= 21;\n  // 社会:中学は 7=地理、8=歴史、9=公民\n  var CHU_NAMES = { 7: "中学 地理", 8: "中学 歴史", 9: "中学 公民" };\n  var CHU_SHORT = { 7: "地理", 8: "歴史", 9: "公民" };')
R('g3 >= 7 ? `<small>中</small>${g3 - 6}`', 'g3 >= 7 ? `<small>中</small>${CHU_SHORT[g3]}`')
R('return `中${g3 - 6}の問題に<br>ちょうせんしよう！`;', 'return `${CHU_NAMES[g3]}の問題に<br>ちょうせんしよう！`;')
i = s.index('$("subtitle").textContent = gN >= 21 ?')
j = s.index('\n', i)
s = s[:i] + '$("subtitle").textContent = gN >= 21 ? "特別支援学校(知的障害) ・ 学習指導要領の段階と内容(生活・社会)" : gN >= 7 ? `${CHU_NAMES[gN]} ・ 学習指導要領の内容の順` : gN <= 2 ? "小学校1・2年 さきどり社会(生活科とつながる内容)" : "小学校3〜6年 社会 ・ 教科書の単元順";' + s[j:]
s = s.replace('GRADES[Number(store.get("grade"))] ? Number(store.get("grade")) : 3;', 'GRADES[Number(store.get("grade"))] ? Number(store.get("grade")) : 3;')
R('"rika-print:pub"', '"shakai-print:pub"')
R('"sansu-print:" + k', '"shakai-print:" + k')
# 中学の学年のボタン:「中」のあとに 地理・歴史・公民 が入るので字を小さく
s = s.replace('</style>', '.hg.g7, .hg.g8, .hg.g9 { font-size: 0.82em; }\n</style>', 1)
p.write_text(s, encoding='utf-8')
print('ok')
