// 地図のデータ(日本の都道府県・世界の国)を、図に入れる SVG の path にして content/s0map.js に書き出す
//   node tools/shakai/makemap.js
// もと: jpn-atlas(国土地理院 地球地図日本)、world-atlas(Natural Earth)
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
const req = (m) => require(path.join(root, 'node_modules', m));
const topo = req('topojson-client'), simp = req('topojson-simplify'), d3 = req('d3-geo');

const NAMES = "北海道,青森県,岩手県,宮城県,秋田県,山形県,福島県,茨城県,栃木県,群馬県,埼玉県,千葉県,東京都,神奈川県,新潟県,富山県,石川県,福井県,山梨県,長野県,岐阜県,静岡県,愛知県,三重県,滋賀県,京都府,大阪府,兵庫県,奈良県,和歌山県,鳥取県,島根県,岡山県,広島県,山口県,徳島県,香川県,愛媛県,高知県,福岡県,佐賀県,長崎県,熊本県,大分県,宮崎県,鹿児島県,沖縄県".split(",");
const r1 = (v) => Math.round(v * 10) / 10;
function pathOf(geo, proj) {
  const ctx = { s: "", moveTo(x, y) { this.s += `M${r1(x)} ${r1(y)}`; }, lineTo(x, y) { this.s += `L${r1(x)} ${r1(y)}`; }, closePath() { this.s += "Z"; }, arc() {} };
  d3.geoPath(proj, ctx)(geo);
  // 同じ点のくりかえしをけす
  return ctx.s.replace(/L([\d.\-]+) ([\d.\-]+)(?=L\1 \2)/g, "");
}
// ===== 日本 =====
let jp = req('jpn-atlas/japan/japan.json');
jp = simp.presimplify(jp);
const minW = Number(process.env.JPW || 0.6);
jp = simp.simplify(jp, minW);
const prefs = topo.feature(jp, jp.objects.prefectures).features;
// 小さい島(面積が小さいもの)はけす(沖縄・離島の大きいものはのこす)
const W = 120; // mm
const [x0, y0, x1, y1] = jp.bbox;
const k = W / (x1 - x0);
const proj = d3.geoTransform({ point(x, y) { this.stream.point((x - x0) * k, (y - y0) * k); } });
const pg = d3.geoPath(proj);
function dropSmall(f, minA) {
  const g = f.geometry;
  if (g.type !== "MultiPolygon") return f;
  const polys = g.coordinates.filter((c) => pg.area({ type: "Polygon", coordinates: c }) >= minA);
  return { ...f, geometry: { type: "MultiPolygon", coordinates: polys.length ? polys : [g.coordinates[0]] } };
}
const cy = (c) => pg.centroid({ type: "Polygon", coordinates: c })[1];
const cut = prefs.map((f) => {
  let ff = dropSmall(f, f.id === "47" ? 0.15 : 0.6);
  // 鹿児島県の南の島(奄美など)はのぞく(種子島・屋久島はのこす)
  if (f.id === "46" && ff.geometry.type === "MultiPolygon") ff = { ...ff, geometry: { type: "MultiPolygon", coordinates: ff.geometry.coordinates.filter((c) => cy(c) < 67) } };
  return ff;
});
// 沖縄県は、左上のわくの中に入れる(ふつうの白地図と同じ)
const mainB = cut.filter((f) => f.id !== "47").map((f) => pg.bounds(f)).reduce((a, b) => [[Math.min(a[0][0], b[0][0]), Math.min(a[0][1], b[0][1])], [Math.max(a[1][0], b[1][0]), Math.max(a[1][1], b[1][1])]]);
const okB = pg.bounds(cut[46]);
const OKX = mainB[0][0] - 2 - okB[0][0] + 3, OKY = mainB[0][1] + 6 - okB[0][1];
const MX = Number(process.env.JPMAIN || 96);
const KX = MX / (mainB[1][0] - mainB[0][0] + 6);
const fx = (x) => (x - mainB[0][0] + 3) * KX, fy = (y) => (y - mainB[0][1] + 2) * KX;
const projJ = (isOk) => d3.geoTransform({ point(x, y) { let X = (x - x0) * k, Y = (y - y0) * k; if (isOk) { X += OKX; Y += OKY; } this.stream.point(fx(X), fy(Y)); } });
const pref = cut.map((f, i) => {
  const pj = projJ(f.id === "47"), gp = d3.geoPath(pj);
  const c = gp.centroid(f), b = gp.bounds(f);
  return { n: NAMES[i], d: pathOf(f, pj), c: [r1(c[0]), r1(c[1])], b: b.map((p) => p.map(r1)) };
});
// となりの都道府県(陸でさかいを接する)と、海に面しているか
const nbr = topo.neighbors(jp.objects.prefectures.geometries).map((l) => l.map((k) => Number(jp.objects.prefectures.geometries[k].id) - 1).sort((a, b) => a - b));
const arcsOf = (geo) => { const out = []; const walk = (a) => (Array.isArray(a) ? a.forEach(walk) : out.push(a < 0 ? ~a : a)); walk(geo.arcs); return out; };
const arcCnt = {};
jp.objects.prefectures.geometries.forEach((g) => arcsOf(g).forEach((a) => (arcCnt[a] = (arcCnt[a] || 0) + 1)));
jp.objects.prefectures.geometries.forEach((g) => { const i = Number(g.id) - 1; pref[i].nb = nbr[jp.objects.prefectures.geometries.indexOf(g)]; pref[i].sea = arcsOf(g).some((a) => arcCnt[a] === 1) ? 1 : 0; });
const okFrame = (() => { const b = pref[46].b; return [r1(b[0][0] - 2), r1(b[0][1] - 2), r1(b[1][0] - b[0][0] + 4), r1(b[1][1] - b[0][1] + 4)]; })();
const H = r1(fy(mainB[1][1]) + 2), W2 = r1(fx(mainB[1][0]) + 3);
// ===== 世界 =====
const wa = req('world-atlas/countries-110m.json');
const countries = topo.feature(wa, wa.objects.countries).features;
const AF = "Algeria,Angola,Benin,Botswana,Burkina Faso,Burundi,Cameroon,Central African Rep.,Chad,Congo,Dem. Rep. Congo,Côte d'Ivoire,Djibouti,Egypt,Eq. Guinea,Eritrea,eSwatini,Ethiopia,Gabon,Gambia,Ghana,Guinea,Guinea-Bissau,Kenya,Lesotho,Liberia,Libya,Madagascar,Malawi,Mali,Mauritania,Morocco,Mozambique,Namibia,Niger,Nigeria,Rwanda,Senegal,Sierra Leone,Somalia,Somaliland,South Africa,S. Sudan,Sudan,Tanzania,Togo,Tunisia,Uganda,W. Sahara,Zambia,Zimbabwe".split(",");
const EU = "Albania,Austria,Belarus,Belgium,Bosnia and Herz.,Bulgaria,Croatia,Czechia,Denmark,Estonia,Finland,France,Germany,Greece,Hungary,Iceland,Ireland,Italy,Kosovo,Latvia,Lithuania,Luxembourg,Macedonia,North Macedonia,Moldova,Montenegro,Netherlands,Norway,Poland,Portugal,Romania,Russia,Serbia,Slovakia,Slovenia,Spain,Sweden,Switzerland,Ukraine,United Kingdom".split(",");
const NA = "Bahamas,Belize,Canada,Costa Rica,Cuba,Dominican Rep.,El Salvador,Greenland,Guatemala,Haiti,Honduras,Jamaica,Mexico,Nicaragua,Panama,Puerto Rico,Trinidad and Tobago,United States of America".split(",");
const SA = "Argentina,Bolivia,Brazil,Chile,Colombia,Ecuador,Falkland Is.,Guyana,Paraguay,Peru,Suriname,Uruguay,Venezuela,Fr. S. Antarctic Lands".split(",");
const OC = "Australia,Fiji,New Caledonia,New Zealand,Papua New Guinea,Solomon Is.,Vanuatu".split(",");
const contOf = (n) => n === "Antarctica" ? "an" : AF.includes(n) ? "af" : EU.includes(n) ? "eu" : NA.includes(n) ? "na" : SA.includes(n) ? "sa" : OC.includes(n) ? "oc" : n === "France" ? "eu" : "as";
// 日本が まん中(経度150°を中心)の地図。はば 160mm
const WW = 160;
const wproj = d3.geoEquirectangular().rotate([-150, 0]).fitWidth(WW, { type: "Sphere" });
const sph = d3.geoPath(wproj).bounds({ type: "Sphere" });
const keep = countries.filter((f) => f.properties.name !== "Antarctica");
const world = { w: WW, h: r1(sph[1][1] - sph[0][1]), c: {} };
for (const f of keep) {
  const k2 = contOf(f.properties.name);
  (world.c[k2] = world.c[k2] || []).push(pathOf(f, wproj));
}
for (const k2 of Object.keys(world.c)) world.c[k2] = world.c[k2].join("");
// 国(州の地図・国の場所をきく問題用)。名前は英語(よく出る国だけ日本語の名前をつける)
const JA = { "China": "中国", "India": "インド", "Japan": "日本", "Russia": "ロシア", "United States of America": "アメリカ合衆国", "Canada": "カナダ", "Brazil": "ブラジル", "Australia": "オーストラリア", "Saudi Arabia": "サウジアラビア", "South Korea": "韓国", "North Korea": "北朝鮮", "Mongolia": "モンゴル", "Indonesia": "インドネシア", "Thailand": "タイ", "Vietnam": "ベトナム", "Philippines": "フィリピン", "Malaysia": "マレーシア", "Egypt": "エジプト", "South Africa": "南アフリカ共和国", "Nigeria": "ナイジェリア", "Kenya": "ケニア", "Ghana": "ガーナ", "Côte d'Ivoire": "コートジボワール", "France": "フランス", "Germany": "ドイツ", "United Kingdom": "イギリス", "Italy": "イタリア", "Spain": "スペイン", "Netherlands": "オランダ", "Sweden": "スウェーデン", "Norway": "ノルウェー", "Mexico": "メキシコ", "Argentina": "アルゼンチン", "Chile": "チリ", "Peru": "ペルー", "New Zealand": "ニュージーランド", "Turkey": "トルコ", "Iran": "イラン", "Iraq": "イラク", "Pakistan": "パキスタン", "Bangladesh": "バングラデシュ", "Poland": "ポーランド", "Ukraine": "ウクライナ", "Greece": "ギリシャ", "Kazakhstan": "カザフスタン", "Colombia": "コロンビア", "Venezuela": "ベネズエラ", "Ethiopia": "エチオピア", "Myanmar": "ミャンマー", "Cuba": "キューバ", "Switzerland": "スイス" };
world.n = {};
for (const f of keep) {
  const nm = JA[f.properties.name];
  if (!nm) continue;
  const c = d3.geoPath(wproj).centroid(f);
  world.n[nm] = { d: pathOf(f, wproj), c: [r1(c[0]), r1(c[1])], k: contOf(f.properties.name) };
}
// 経線・緯線(30°ごと)の位置
world.grid = { lon: [], lat: [] };
for (let lo = -180; lo <= 180; lo += 30) world.grid.lon.push([lo, r1(wproj([lo, 0])[0])]);
for (let la = -60; la <= 90; la += 30) world.grid.lat.push([la, r1(wproj([150, la])[1])]);
world.p = (lo, la) => wproj([lo, la]);
const pts = {};
for (const [nm, lo, la] of [["太平洋", -150, 5], ["太平洋2", 175, 25], ["大西洋", -35, 15], ["インド洋", 75, -20], ["ユーラシア", 90, 52], ["アフリカ", 20, 5], ["北アメリカ", -100, 45], ["南アメリカ", -60, -12], ["オーストラリア", 134, -25], ["南極", 150, -80], ["日本", 138, 37], ["赤道", 150, 0]]) pts[nm] = wproj([lo, la]).map(r1);
world.pts = pts;
delete world.p;
const out = `// 地図のデータ(tools/shakai/makemap.js で作る。手で直さない)
// 日本: jpn-atlas(国土地理院「地球地図日本」をもとにしたもの)  世界: world-atlas(Natural Earth、パブリックドメイン)
var s00map = [];
var SMAP = ${JSON.stringify({ jp: { w: W2, h: H, pref, ok: okFrame }, world })};
`;
fs.mkdirSync(path.join(root, 'src', 'generators', 's00map'), { recursive: true });
fs.writeFileSync(path.join(root, 'src', 'generators', 's00map', 'part1.js'), out);
console.log('s0map.js', (out.length / 1024).toFixed(0), 'KB', 'jp h', H, 'world h', world.h);
