// このファイルは tools/rika/annotate.js が content/s0lib2.js から作ったもの。直すときは content/s0lib2.js を直して作りなおす。
// 社会プリントの図の道具 SD(地図記号・方位・日本地図・世界地図・雨温図・グラフ・三権分立 など)
// 図の中のことばは、かならず T(x, y, ことば) で書く(SVG に日本語を直接書かない)
var s0lib2 = [];
var SD = (() => {
  const { T, fig, line, arrow, rect, circle, path, poly, C, LET, noRuby } = RK;
  const r1 = (v) => Math.round(v * 100) / 100;
  // ===== 地図記号(国土地理院の記号をもとに、線でかく)。cx, cy は中心、s は大きさ(mm) =====
  const SYM = {
    "{市役所|しやくしょ}": (x, y, s) => circle(x, y, s * 0.42, { w: 0.45 }) + circle(x, y, s * 0.24, { w: 0.45 }),
    "{町村|ちょうそん}{役場|やくば}": (x, y, s) => circle(x, y, s * 0.42, { w: 0.45 }) + `<circle cx="${x}" cy="${y}" r="${s * 0.07}" fill="#000"/>`,
    "{学校|がっこう}": (x, y, s) => SYMTXT(x, y, s, "{文|ぶん}"),
    "{高等|こうとう}{学校|がっこう}": (x, y, s) => circle(x, y, s * 0.46, { w: 0.45 }) + SYMTXT(x, y, s * 0.78, "{文|ぶん}"),
    "{郵便|ゆうびん}{局|きょく}": (x, y, s) => circle(x, y, s * 0.44, { w: 0.45 }) + line(x - s * 0.22, y - s * 0.17, x + s * 0.22, y - s * 0.17, { w: 0.5 }) + line(x - s * 0.22, y - s * 0.02, x + s * 0.22, y - s * 0.02, { w: 0.5 }) + line(x, y - s * 0.02, x, y + s * 0.3, { w: 0.5 }),
    "{交番|こうばん}": (x, y, s) => line(x - s * 0.3, y - s * 0.3, x + s * 0.3, y + s * 0.3, { w: 0.6 }) + line(x + s * 0.3, y - s * 0.3, x - s * 0.3, y + s * 0.3, { w: 0.6 }),
    "{警察|けいさつ}{署|しょ}": (x, y, s) => circle(x, y, s * 0.44, { w: 0.45 }) + line(x - s * 0.25, y - s * 0.25, x + s * 0.25, y + s * 0.25, { w: 0.55 }) + line(x + s * 0.25, y - s * 0.25, x - s * 0.25, y + s * 0.25, { w: 0.55 }),
    "{消防署|しょうぼうしょ}": (x, y, s) => path(`M${x - s * 0.3} ${y - s * 0.38}L${x - s * 0.3} ${y - s * 0.1}Q${x - s * 0.3} ${y + s * 0.05} ${x} ${y + s * 0.05}Q${x + s * 0.3} ${y + s * 0.05} ${x + s * 0.3} ${y - s * 0.1}L${x + s * 0.3} ${y - s * 0.38}M${x} ${y + s * 0.05}L${x} ${y + s * 0.42}`, { w: 0.6 }),
    "{病院|びょういん}": (x, y, s) => circle(x, y, s * 0.44, { w: 0.45 }) + line(x - s * 0.28, y, x + s * 0.28, y, { w: 0.9 }) + line(x, y - s * 0.28, x, y + s * 0.28, { w: 0.9 }),
    "{神社|じんじゃ}": (x, y, s) => line(x - s * 0.42, y - s * 0.3, x + s * 0.42, y - s * 0.3, { w: 0.7 }) + line(x - s * 0.3, y - s * 0.12, x + s * 0.3, y - s * 0.12, { w: 0.5 }) + line(x - s * 0.2, y - s * 0.3, x - s * 0.24, y + s * 0.38, { w: 0.6 }) + line(x + s * 0.2, y - s * 0.3, x + s * 0.24, y + s * 0.38, { w: 0.6 }),
    "{寺院|じいん}": (x, y, s) => { const a = s * 0.3; return path(`M${x} ${y - a}L${x} ${y + a}M${x - a} ${y}L${x + a} ${y}M${x} ${y - a}L${x + a} ${y - a}M${x + a} ${y}L${x + a} ${y + a}M${x} ${y + a}L${x - a} ${y + a}M${x - a} ${y}L${x - a} ${y - a}`, { w: 0.55 }); },
    "{図書館|としょかん}": (x, y, s) => path(`M${x} ${y + s * 0.25}L${x - s * 0.42} ${y + s * 0.05}L${x - s * 0.42} ${y - s * 0.3}L${x} ${y - s * 0.1}L${x + s * 0.42} ${y - s * 0.3}L${x + s * 0.42} ${y + s * 0.05}Z M${x} ${y - s * 0.1}L${x} ${y + s * 0.25}`, { w: 0.5 }),
    "{博物館|はくぶつかん}": (x, y, s) => path(`M${x - s * 0.42} ${y - s * 0.12}L${x} ${y - s * 0.4}L${x + s * 0.42} ${y - s * 0.12}Z M${x - s * 0.3} ${y - s * 0.08}L${x - s * 0.3} ${y + s * 0.3}M${x} ${y - s * 0.08}L${x} ${y + s * 0.3}M${x + s * 0.3} ${y - s * 0.08}L${x + s * 0.3} ${y + s * 0.3}M${x - s * 0.44} ${y + s * 0.34}L${x + s * 0.44} ${y + s * 0.34}`, { w: 0.5 }),
    "{老人|ろうじん}ホーム": (x, y, s) => path(`M${x - s * 0.4} ${y + s * 0.38}L${x - s * 0.4} ${y - s * 0.05}L${x - s * 0.05} ${y - s * 0.38}L${x + s * 0.3} ${y - s * 0.05}L${x + s * 0.3} ${y + s * 0.38}Z M${x + s * 0.42} ${y + s * 0.38}L${x + s * 0.42} ${y - s * 0.12}Q${x + s * 0.42} ${y - s * 0.28} ${x + s * 0.3} ${y - s * 0.24}`, { w: 0.5 }),
    "{工場|こうじょう}": (x, y, s) => { let d = ""; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d += line(x + Math.cos(a) * s * 0.28, y + Math.sin(a) * s * 0.28, x + Math.cos(a) * s * 0.44, y + Math.sin(a) * s * 0.44, { w: 0.8 }); } return d + circle(x, y, s * 0.28, { w: 0.5 }) + circle(x, y, s * 0.1, { w: 0.4 }); },
    "{発電|はつでん}{所|しょ}": (x, y, s) => { let d = ""; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d += line(x + Math.cos(a) * s * 0.28, y + Math.sin(a) * s * 0.28, x + Math.cos(a) * s * 0.42, y + Math.sin(a) * s * 0.42, { w: 0.7 }); } return d + circle(x, y, s * 0.28, { w: 0.5 }) + path(`M${x + s * 0.06} ${y - s * 0.2}L${x - s * 0.08} ${y + s * 0.02}L${x + s * 0.08} ${y + s * 0.02}L${x - s * 0.06} ${y + s * 0.22}`, { w: 0.45 }); },
    "{灯台|とうだい}": (x, y, s) => { let d = `<circle cx="${x}" cy="${y}" r="${s * 0.1}" fill="#000"/>`; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; d += line(x + Math.cos(a) * s * 0.2, y + Math.sin(a) * s * 0.2, x + Math.cos(a) * s * 0.42, y + Math.sin(a) * s * 0.42, { w: 0.45 }); } return d; },
    "{温泉|おんせん}": (x, y, s) => path(`M${x - s * 0.36} ${y - s * 0.05}Q${x - s * 0.36} ${y + s * 0.38} ${x} ${y + s * 0.38}Q${x + s * 0.36} ${y + s * 0.38} ${x + s * 0.36} ${y - s * 0.05}`, { w: 0.55 }) + [-0.18, 0, 0.18].map((dx) => path(`M${x + dx * s} ${y + s * 0.12}Q${x + dx * s - s * 0.08} ${y - s * 0.04} ${x + dx * s} ${y - s * 0.18}Q${x + dx * s + s * 0.08} ${y - s * 0.3} ${x + dx * s} ${y - s * 0.44}`, { w: 0.45 })).join(""),
    "{城跡|じょうせき}": (x, y, s) => path(`M${x - s * 0.42} ${y + s * 0.3}L${x - s * 0.42} ${y - s * 0.3}L${x - s * 0.22} ${y - s * 0.3}L${x - s * 0.22} ${y - s * 0.1}L${x + s * 0.22} ${y - s * 0.1}L${x + s * 0.22} ${y - s * 0.3}L${x + s * 0.42} ${y - s * 0.3}L${x + s * 0.42} ${y + s * 0.3}`, { w: 0.55 }),
    "{港|みなと}": (x, y, s) => circle(x, y - s * 0.32, s * 0.08, { w: 0.45 }) + path(`M${x} ${y - s * 0.24}L${x} ${y + s * 0.38}M${x - s * 0.18} ${y - s * 0.1}L${x + s * 0.18} ${y - s * 0.1}M${x - s * 0.38} ${y + s * 0.08}Q${x - s * 0.3} ${y + s * 0.38} ${x} ${y + s * 0.38}Q${x + s * 0.3} ${y + s * 0.38} ${x + s * 0.38} ${y + s * 0.08}`, { w: 0.5 }),
    "{田|た}": (x, y, s) => line(x - s * 0.12, y - s * 0.25, x - s * 0.12, y + s * 0.25, { w: 0.55 }) + line(x + s * 0.12, y - s * 0.25, x + s * 0.12, y + s * 0.25, { w: 0.55 }),
    "{畑|はたけ}": (x, y, s) => path(`M${x - s * 0.24} ${y - s * 0.25}Q${x - s * 0.05} ${y - s * 0.05} ${x} ${y + s * 0.28}Q${x + s * 0.05} ${y - s * 0.05} ${x + s * 0.24} ${y - s * 0.25}`, { w: 0.55 }),
    "{果樹|かじゅ}{園|えん}": (x, y, s) => circle(x, y + s * 0.08, s * 0.2, { w: 0.5 }) + line(x, y - s * 0.12, x, y - s * 0.34, { w: 0.5 }) + line(x - s * 0.12, y - s * 0.34, x + s * 0.12, y - s * 0.34, { w: 0.5 }),
    "{茶畑|ちゃばたけ}": (x, y, s) => circle(x, y - s * 0.22, s * 0.09, { w: 0.5 }) + circle(x - s * 0.22, y + s * 0.16, s * 0.09, { w: 0.5 }) + circle(x + s * 0.22, y + s * 0.16, s * 0.09, { w: 0.5 }),
    "{広葉樹|こうようじゅ}{林|りん}": (x, y, s) => path(`M${x} ${y + s * 0.38}L${x} ${y + s * 0.08}M${x} ${y + s * 0.08}C${x - s * 0.36} ${y + s * 0.08} ${x - s * 0.36} ${y - s * 0.38} ${x} ${y - s * 0.38}C${x + s * 0.36} ${y - s * 0.38} ${x + s * 0.36} ${y + s * 0.08} ${x} ${y + s * 0.08}`, { w: 0.5 }),
    "{針葉樹|しんようじゅ}{林|りん}": (x, y, s) => path(`M${x - s * 0.28} ${y + s * 0.12}L${x} ${y - s * 0.38}L${x + s * 0.28} ${y + s * 0.12}M${x} ${y - s * 0.38}L${x} ${y + s * 0.38}`, { w: 0.5 }),
    "{自然|しぜん}{災害|さいがい}{伝承|でんしょう}{碑|ひ}": (x, y, s) => path(`M${x - s * 0.18} ${y + s * 0.38}L${x - s * 0.18} ${y - s * 0.12}L${x} ${y - s * 0.32}L${x + s * 0.18} ${y - s * 0.12}L${x + s * 0.18} ${y + s * 0.38}M${x - s * 0.36} ${y + s * 0.38}L${x + s * 0.36} ${y + s * 0.38}`, { w: 0.5 }) + `<circle cx="${x}" cy="${y + s * 0.08}" r="${s * 0.06}" fill="#000"/>`
  };
  // 文字の記号(文)は、ことばではなく線でかく(ふりがなが入らないように)
  function SYMTXT(x, y, s, ch) {
    // 「文」の形
    const a = s * 0.36;
    return path(`M${x} ${y - a}L${x} ${y - a * 0.7}M${x - a} ${y - a * 0.62}L${x + a} ${y - a * 0.62}M${x - a * 0.6} ${y - a * 0.5}Q${x - a * 0.2} ${y + a * 0.4} ${x + a} ${y + a}M${x + a * 0.6} ${y - a * 0.5}Q${x + a * 0.2} ${y + a * 0.4} ${x - a} ${y + a}`, { w: 0.6 });
  }
  const plainKeys = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [noRuby(k), v]));
  const SYMK = plainKeys(SYM);
  // 記号の名前(ふりがなつき)。plain → ふりがなつき
  const SYM_NAMES = Object.keys(SYM);
  const SYM_R0 = Object.fromEntries(SYM_NAMES.map((k) => [noRuby(k), k]));
  const symName = (n) => SYM_R0[noRuby(n)] || n;
  // 記号が何を表しているか(もとになったもの)
  const SYM_FROM = {
    "{消防署|しょうぼうしょ}": "{昔|むかし}の{火消|ひけ}しが{使|つか}った{道具|どうぐ}(さすまた)", "{交番|こうばん}": "{警察官|けいさつかん}が{持|も}つ{警棒|けいぼう}を2{本|ほん}{交差|こうさ}させた{形|かたち}", "{警察|けいさつ}{署|しょ}": "{交番|こうばん}の{記号|きごう}を{丸|まる}でかこんだ{形|かたち}", "{郵便|ゆうびん}{局|きょく}": "{郵便|ゆうびん}を{表|あらわ}すマーク(〒)", "{学校|がっこう}": "「{文|ぶん}」の{字|じ}", "{工場|こうじょう}": "{機械|きかい}の{歯車|はぐるま}", "{発電|はつでん}{所|しょ}": "{歯車|はぐるま}と{電気|でんき}", "{神社|じんじゃ}": "{神社|じんじゃ}の{入|い}り{口|くち}にある{鳥居|とりい}", "{寺院|じいん}": "{仏教|ぶっきょう}で{使|つか}われる{卍|まんじ}(まんじ)", "{田|た}": "いねをかりとったあとのかぶ", "{畑|はたけ}": "{植物|しょくぶつ}のふた{葉|は}", "{果樹|かじゅ}{園|えん}": "りんごやなしなどの{実|み}", "{茶畑|ちゃばたけ}": "{茶|ちゃ}の{実|み}", "{図書館|としょかん}": "{開|ひら}いた{本|ほん}", "{博物館|はくぶつかん}": "{博物館|はくぶつかん}の{建物|たてもの}", "{老人|ろうじん}ホーム": "{建物|たてもの}とつえ", "{温泉|おんせん}": "{湯|ゆ}つぼと{湯気|ゆげ}", "{灯台|とうだい}": "{光|ひかり}が{四方|しほう}に{出|で}るようす", "{港|みなと}": "{船|ふね}のいかり", "{病院|びょういん}": "{病院|びょういん}の{十字|じゅうじ}のしるし", "{城跡|じょうせき}": "{城|しろ}のかべ({石|いし}がき)", "{針葉樹|しんようじゅ}{林|りん}": "とがった{葉|は}の{木|き}", "{広葉樹|こうようじゅ}{林|りん}": "{丸|まる}い{葉|は}の{木|き}"
  };
  const SYM_FROM_K = plainKeys(SYM_FROM);
  const symFrom = (n) => SYM_FROM_K[noRuby(n)];
  const sym = (name, x, y, s = 9) => SYMK[noRuby(name)](x, y, s);
  // 記号のカードをならべる(下に ア・イ…)
  function symRow(names, o = {}) {
    const S = o.size || 15, gap = 4;
    let raw = "";
    const lab = [];
    names.forEach((n, i) => {
      const x = 2 + i * (S + gap);
      raw += rect(x, 2, S, S, { r: 1.5, c: "#7aa", w: 0.35 }) + sym(n, x + S / 2, 2 + S / 2, S * 0.72);
      if (o.letters !== false) lab.push(T(x + S / 2, S + 8, o.labels ? o.labels[i] : LET[i], 3.8, { bold: true }));
    });
    return fig(4 + names.length * (S + gap) - gap, S + (o.letters === false ? 4 : 11), raw, lab, 1.1);
  }

  // ===== 方位 =====
  const DIR8 = ["{北|きた}", "{北東|ほくとう}", "{東|ひがし}", "{南東|なんとう}", "{南|みなみ}", "{南西|なんせい}", "{西|にし}", "{北西|ほくせい}"];
  // 8方位の図。blank: 空らんにする方位(番号)→ 記号
  function compass(blank = {}, o = {}) {
    const cx = 32, cy = 30, R = 18;
    let raw = circle(cx, cy, 4, { w: 0.4 });
    const lab = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * 45 - 90) * Math.PI / 180, L = i % 2 ? R * 0.72 : R;
      raw += line(cx, cy, cx + Math.cos(a) * L, cy + Math.sin(a) * L, { w: i % 2 ? 0.4 : 0.7 });
      const tx = cx + Math.cos(a) * (L + 6), ty = cy + Math.sin(a) * (L + 6) + 1.3;
      if (blank[i] !== undefined) lab.push(T(tx, ty, `（${blank[i]}）`, 3.4, { bold: true }));
      else lab.push(T(tx, ty, DIR8[i], 3.4));
    }
    raw += poly([[cx, cy - R - 0.5], [cx - 2, cy - R + 5], [cx + 2, cy - R + 5]], { f: "#000" });
    return fig(64, 60, raw, lab, o.k || 1.1);
  }

  // ===== 日本地図(白地図) =====
  // 都道府県名と都道府県庁所在地(ふりがなをつけるため、ここに書く)
  const PREF_R = "{北海道|ほっかいどう},{青森|あおもり}{県|けん},{岩手|いわて}{県|けん},{宮城|みやぎ}{県|けん},{秋田|あきた}{県|けん},{山形|やまがた}{県|けん},{福島|ふくしま}{県|けん},{茨城|いばらき}{県|けん},{栃木|とちぎ}{県|けん},{群馬|ぐんま}{県|けん},{埼玉|さいたま}{県|けん},{千葉|ちば}{県|けん},{東京|とうきょう}{都|と},{神奈川|かながわ}{県|けん},{新潟|にいがた}{県|けん},{富山|とやま}{県|けん},{石川|いしかわ}{県|けん},{福井|ふくい}{県|けん},{山梨|やまなし}{県|けん},{長野|ながの}{県|けん},{岐阜|ぎふ}{県|けん},{静岡|しずおか}{県|けん},{愛知|あいち}{県|けん},{三重|みえ}{県|けん},{滋賀|しが}{県|けん},{京都|きょうと}{府|ふ},{大阪|おおさか}{府|ふ},{兵庫|ひょうご}{県|けん},{奈良|なら}{県|けん},{和歌山|わかやま}{県|けん},{鳥取|とっとり}{県|けん},{島根|しまね}{県|けん},{岡山|おかやま}{県|けん},{広島|ひろしま}{県|けん},{山口|やまぐち}{県|けん},{徳島|とくしま}{県|けん},{香川|かがわ}{県|けん},{愛媛|えひめ}{県|けん},{高知|こうち}{県|けん},{福岡|ふくおか}{県|けん},{佐賀|さが}{県|けん},{長崎|ながさき}{県|けん},{熊本|くまもと}{県|けん},{大分|おおいた}{県|けん},{宮崎|みやざき}{県|けん},{鹿児島|かごしま}{県|けん},{沖縄|おきなわ}{県|けん}".split(",");
  const CAP_R = "{札幌|さっぽろ}{市|し},{青森|あおもり}{市|し},{盛岡|もりおか}{市|し},{仙台|せんだい}{市|し},{秋田|あきた}{市|し},{山形|やまがた}{市|し},{福島|ふくしま}{市|し},{水戸|みと}{市|し},{宇都宮|うつのみや}{市|し},{前橋|まえばし}{市|し},さいたま{市|し},{千葉|ちば}{市|し},{東京|とうきょう}({新宿|しんじゅく}{区|く}),{横浜|よこはま}{市|し},{新潟|にいがた}{市|し},{富山|とやま}{市|し},{金沢|かなざわ}{市|し},{福井|ふくい}{市|し},{甲府|こうふ}{市|し},{長野|ながの}{市|し},{岐阜|ぎふ}{市|し},{静岡|しずおか}{市|し},{名古屋|なごや}{市|し},{津|つ}{市|し},{大津|おおつ}{市|し},{京都|きょうと}{市|し},{大阪|おおさか}{市|し},{神戸|こうべ}{市|し},{奈良|なら}{市|し},{和歌山|わかやま}{市|し},{鳥取|とっとり}{市|し},{松江|まつえ}{市|し},{岡山|おかやま}{市|し},{広島|ひろしま}{市|し},{山口|やまぐち}{市|し},{徳島|とくしま}{市|し},{高松|たかまつ}{市|し},{松山|まつやま}{市|し},{高知|こうち}{市|し},{福岡|ふくおか}{市|し},{佐賀|さが}{市|し},{長崎|ながさき}{市|し},{熊本|くまもと}{市|し},{大分|おおいた}{市|し},{宮崎|みやざき}{市|し},{鹿児島|かごしま}{市|し},{那覇|なは}{市|し}".split(",");
  const PREF = PREF_R;
  const prefNo = (n) => PREF.map(noRuby).indexOf(noRuby(n));
  const REG7 = [["{北海道|ほっかいどう}{地方|ちほう}", [0]], ["{東北|とうほく}{地方|ちほう}", [1, 2, 3, 4, 5, 6]], ["{関東|かんとう}{地方|ちほう}", [7, 8, 9, 10, 11, 12, 13]], ["{中部|ちゅうぶ}{地方|ちほう}", [14, 15, 16, 17, 18, 19, 20, 21, 22]], ["{近畿|きんき}{地方|ちほう}", [23, 24, 25, 26, 27, 28, 29]], ["{中国|ちゅうごく}・{四国|しこく}{地方|ちほう}", [30, 31, 32, 33, 34, 35, 36, 37, 38]], ["{九州|きゅうしゅう}{地方|ちほう}", [39, 40, 41, 42, 43, 44, 45, 46]]];
  const regionOf = (i) => REG7.find((r) => r[1].includes(i))[0];
  const CAP = { "{北海道|ほっかいどう}": "{札幌|さっぽろ}{市|し}", "{岩手|いわて}{県|けん}": "{盛岡|もりおか}{市|し}", "{宮城|みやぎ}{県|けん}": "{仙台|せんだい}{市|し}", "{茨城|いばらき}{県|けん}": "{水戸|みと}{市|し}", "{栃木|とちぎ}{県|けん}": "{宇都宮|うつのみや}{市|し}", "{群馬|ぐんま}{県|けん}": "{前橋|まえばし}{市|し}", "{埼玉|さいたま}{県|けん}": "さいたま{市|し}", "{東京|とうきょう}{都|と}": "{東京|とうきょう}({新宿|しんじゅく}{区|く})", "{神奈川|かながわ}{県|けん}": "{横浜|よこはま}{市|し}", "{石川|いしかわ}{県|けん}": "{金沢|かなざわ}{市|し}", "{山梨|やまなし}{県|けん}": "{甲府|こうふ}{市|し}", "{愛知|あいち}{県|けん}": "{名古屋|なごや}{市|し}", "{三重|みえ}{県|けん}": "{津|つ}{市|し}", "{滋賀|しが}{県|けん}": "{大津|おおつ}{市|し}", "{兵庫|ひょうご}{県|けん}": "{神戸|こうべ}{市|し}", "{島根|しまね}{県|けん}": "{松江|まつえ}{市|し}", "{香川|かがわ}{県|けん}": "{高松|たかまつ}{市|し}", "{愛媛|えひめ}{県|けん}": "{松山|まつやま}{市|し}", "{沖縄|おきなわ}{県|けん}": "{那覇|なは}{市|し}" };
  const CAPK = plainKeys(CAP);
  const capOf = (n) => CAP_R[prefNo(n)] || CAPK[noRuby(n)] || noRuby(n).replace(/[{都道府県|とどうふけん}]$/, "") + "{市|し}";
  // mark: [[都道府県の番号(0〜46), 記号], …]。fill: {番号: 色}。w: はば(mm)
  function jpMap(o = {}) {
    const J = SMAP.jp, W = o.w || 100, k = W / J.w, H = J.h * k;
    const fill = o.fill || {};
    let raw = `<g transform="scale(${r1(k)})">`;
    J.pref.forEach((p, i) => { raw += `<path d="${p.d}" fill="${fill[i] || "#fff"}" stroke="#000" stroke-width="${r1(0.22 / k)}" stroke-linejoin="round"/>`; });
    if (o.regions) {
      // 地方のさかいを太く
      raw += "";
    }
    raw += `<rect x="${J.ok[0]}" y="${J.ok[1]}" width="${J.ok[2]}" height="${J.ok[3]}" fill="none" stroke="#000" stroke-width="${r1(0.3 / k)}"/>`;
    raw += "</g>";
    const lab = [];
    // 記号:小さい県は、外に引き出し線をつける
    const used = [];
    const CAND = [[11, 7], [12, -3], [-11, -7], [-12, 3], [7, 12], [-7, 11], [13, 13], [-13, -1], [3, -11], [14, 2]];
    const far = (x, y) => used.every(([a, b]) => Math.hypot(a - x, b - y) >= 6.5) && x > 3 && x < W - 3 && y > 3 && y < H - 2;
    // 大きい県(記号を中に書く県)を先に場所をとっておく
    for (const [i, , out] of o.mark || []) {
      const p = J.pref[i];
      if (!out && (p.b[1][0] - p.b[0][0]) * k >= 7) used.push([p.c[0] * k, p.c[1] * k]);
    }
    for (const [i, s, out] of o.mark || []) {
      const p = J.pref[i], cx = p.c[0] * k, cy = p.c[1] * k;
      const bw = (p.b[1][0] - p.b[0][0]) * k;
      if (out || bw < 7) {
        const [dx, dy] = out || CAND.find(([a, b]) => far(cx + a, cy + b)) || CAND[0];
        used.push([cx + dx, cy + dy]);
        raw += line(cx, cy, cx + dx, cy + dy, { w: 0.3 }) + `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="0.6" fill="#000"/>`;
        lab.push(T(cx + dx + (dx >= 0 ? 2.2 : -2.2), cy + dy + 1.4, s, 3.6, { bold: true }));
      } else lab.push(T(cx, cy + 1.4, s, 3.6, { bold: true }));
    }
    for (const L of o.text || []) lab.push(L);
    return fig(W, H, raw, lab, o.kk || 1.12);
  }
  // 都道府県の形だけを大きくかく(x, y, はば w, 高さ h のわくに入れる)
  function prefShape(i, x, y, w, h, o = {}) {
    const p = SMAP.jp.pref[i], [[bx0, by0], [bx1, by1]] = p.b;
    const k = Math.min(w / (bx1 - bx0), h / (by1 - by0));
    const dx = x + (w - (bx1 - bx0) * k) / 2 - bx0 * k, dy = y + (h - (by1 - by0) * k) / 2 - by0 * k;
    return `<g transform="translate(${r1(dx)},${r1(dy)}) scale(${r1(k)})"><path d="${p.d}" fill="${o.f || "#f4dfa0"}" stroke="#000" stroke-width="${r1(0.5 / k)}" stroke-linejoin="round"/></g>`;
  }
  // 地方を大きくかく。labels: {都道府県の番号: 記号}。others: まわりの県もうすくかく
  function regionZoom(ids, labels = {}, o = {}) {
    const J = SMAP.jp, P = J.pref;
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (const i of ids) { const b = P[i].b; bx0 = Math.min(bx0, b[0][0]); by0 = Math.min(by0, b[0][1]); bx1 = Math.max(bx1, b[1][0]); by1 = Math.max(by1, b[1][1]); }
    const pad = 1.5;
    bx0 -= pad; by0 -= pad; bx1 += pad; by1 += pad;
    const W = o.w || 100, k = Math.min(W / (bx1 - bx0), (o.maxH || 92) / (by1 - by0)), H = (by1 - by0) * k, WW = (bx1 - bx0) * k;
    // わくの外にはみ出す県は切りとる(clipPath の id は図ごとにかえる)
    const cid = "rz" + ids.join("_") + "w" + Math.round(WW * 10) + "h" + Math.round(H * 10);
    let raw = `<defs><clipPath id="${cid}"><rect x="0" y="0" width="${r1(WW)}" height="${r1(H)}"/></clipPath></defs><g clip-path="url(#${cid})"><g transform="scale(${r1(k)}) translate(${r1(-bx0)},${r1(-by0)})">`;
    P.forEach((p, i) => {
      if (i === 46 && !ids.includes(46)) return;
      const inR = ids.includes(i);
      raw += `<path d="${p.d}" fill="${inR ? (o.fill && o.fill[i]) || "#fff" : "#e6e6e6"}" stroke="${inR ? "#000" : "#999"}" stroke-width="${r1((inR ? 0.35 : 0.2) / k)}" stroke-linejoin="round"/>`;
    });
    raw += `</g></g>` + rect(0, 0, WW, H, { w: 0.4 });
    const lab = [];
    for (const [i, s] of Object.entries(labels)) {
      const c = P[i].c, X = (c[0] - bx0) * k, Y = (c[1] - by0) * k;
      if (X < 2 || X > WW - 2 || Y < 2 || Y > H - 1) continue;
      raw += `<circle cx="${r1(X)}" cy="${r1(Y - 0.2)}" r="2.6" fill="#fff" stroke="#000" stroke-width="0.25"/>`;
      lab.push(T(X, Y + 1.1, s, 3.2, { bold: true }));
    }
    // 名前だけ書く(まわりの県など)
    for (const [i, s] of Object.entries(o.names || {})) {
      const c = P[i].c, X = (c[0] - bx0) * k, Y = (c[1] - by0) * k;
      if (X < 6 || X > WW - 6 || Y < 3 || Y > H - 2) continue;
      lab.push(T(X, Y + 1, s, 2.7));
    }
    return fig(WW, H, raw, lab, o.kk || 1.05);
  }
  function shapeRow(ids, labels, o = {}) {
    const S = o.size || 34, g = 4;
    let raw = "";
    const lab = [];
    ids.forEach((i, k) => {
      const x = k * (S + g);
      raw += rect(x, 0, S, S, { r: 2, f: "#fff", w: 0.35, c: "#888" }) + prefShape(i, x + 3, 3, S - 6, S - 6, { f: "#8fc98f" });
      lab.push(T(x + S / 2, S + 5, labels[k], 3.6, { bold: true }));
    });
    return fig(ids.length * (S + g) - g, S + 7, raw, lab, 1.05);
  }
  const NB = (i) => SMAP.jp.pref[i].nb;
  const SEA = (i) => SMAP.jp.pref[i].sea === 1;
  // 7地方の色わけ地図(記号つき)
  const RCOL = ["#f6d4d0", "#d9efd2", "#e8f4fb", "#fbf0c4", "#ead9f2", "#d6ecf7", "#f3e6c8"];
  function regionMap(labels) {
    const fill = {};
    const mark = [];
    REG7.forEach(([, ids], r) => ids.forEach((i) => (fill[i] = RCOL[r])));
    const pos = [0, 4, 9, 19, 26, 32, 42];
    REG7.forEach((_, r) => labels[r] && mark.push([pos[r], labels[r], r === 4 ? [-10, 9] : r === 2 ? [10, 5] : r === 5 ? [-8, 10] : r === 6 ? [-8, 8] : null]));
    return jpMap({ fill, mark: mark.map(([a, b, c]) => c ? [a, b, c] : [a, b, null]).map(([a, b, c]) => (c ? [a, b, c] : [a, b])) });
  }

  // ===== 世界地図 =====
  const CONT = { as: "ユーラシア{大陸|たいりく}", eu: "ユーラシア{大陸|たいりく}", af: "アフリカ{大陸|たいりく}", na: "{北|きた}アメリカ{大陸|たいりく}", sa: "{南|みなみ}アメリカ{大陸|たいりく}", oc: "オーストラリア{大陸|たいりく}" };
  const SHU = { as: "アジア{州|しゅう}", eu: "ヨーロッパ{州|しゅう}", af: "アフリカ{州|しゅう}", na: "{北|きた}アメリカ{州|しゅう}", sa: "{南|みなみ}アメリカ{州|しゅう}", oc: "オセアニア{州|しゅう}" };
  // o.fill: {as:色,…}  o.mark: [[x, y, 記号]](地図の mm)  o.countries: [[国名, 記号]]  o.grid: 経線・緯線
  function worldMap(o = {}) {
    const Wd = SMAP.world, W = o.w || 150, k = W / Wd.w, H = Wd.h * k;
    let raw = `<rect x="0" y="0" width="${r1(W)}" height="${r1(H)}" fill="#fff" stroke="#000" stroke-width="0.3"/>`;
    raw += `<g transform="scale(${r1(k)})">`;
    if (o.grid) {
      for (const [, x] of Wd.grid.lon) raw += `<line x1="${x}" y1="0" x2="${x}" y2="${Wd.h}" stroke="#aaa" stroke-width="${r1(0.15 / k)}"/>`;
      for (const [la, y] of Wd.grid.lat) raw += `<line x1="0" y1="${y}" x2="${Wd.w}" y2="${y}" stroke="${la === 0 ? "#555" : "#aaa"}" stroke-width="${r1((la === 0 ? 0.35 : 0.15) / k)}"${la === 0 ? ' stroke-dasharray="1.5 1"' : ""}/>`;
    }
    for (const c of Object.keys(Wd.c)) raw += `<path d="${Wd.c[c]}" fill="${(o.fill || {})[c] || "#eee"}" stroke="#444" stroke-width="${r1(0.12 / k)}"/>`;
    for (const [n] of o.countries || []) if (Wd.n[noRuby(n)]) raw += `<path d="${Wd.n[noRuby(n)].d}" fill="#9a9a9a" stroke="#000" stroke-width="${r1(0.2 / k)}"/>`;
    raw += "</g>";
    const lab = [];
    for (const [x, y, s] of o.mark || []) lab.push(T(x * k, y * k + 1.4, s, 3.8, { bold: true }));
    for (const [n, s, d] of o.countries || []) {
      const c = Wd.n[noRuby(n)].c, [dx, dy] = d || [0, 0];
      if (dx || dy) raw += line(c[0] * k, c[1] * k, (c[0] + dx) * k, (c[1] + dy) * k, { w: 0.3 });
      lab.push(T((c[0] + dx) * k, (c[1] + dy) * k + 1.4, s, 3.8, { bold: true }));
    }
    for (const L of o.text || []) lab.push(L(k));
    return fig(W, H, raw, lab, 1.05);
  }
  const WP = new Proxy(SMAP.world.pts, { get: (o, k) => o[noRuby(k)] });

  // ===== 雨温図(気象庁の平年値をもとにした、おおよその値) =====
  const CLIMATE = {
    "{札幌|さっぽろ}": { t: [-3.2, -2.7, 1.1, 7.3, 13, 17, 21.1, 22.3, 18.6, 12.1, 5.2, -0.9], p: [108, 92, 78, 55, 56, 60, 91, 127, 135, 110, 105, 113], kind: "{北海道|ほっかいどう}の{気候|きこう}", why: "{冬|ふゆ}の{寒|さむ}さがきびしく、つゆがない" },
    "{上越|じょうえつ}": { t: [1.6, 1.9, 5.1, 10.8, 16.4, 20.6, 24.6, 26, 21.9, 15.8, 9.6, 4.3], p: [429, 269, 201, 124, 106, 145, 226, 169, 191, 177, 315, 445], kind: "{日本|にほん}{海|うみ}{側|がわ}の{気候|きこう}", why: "{冬|ふゆ}に{雪|ゆき}が{多|おお}く、{冬|ふゆ}の{降水|こうすい}{量|りょう}が{多|おお}い" },
    "{東京|とうきょう}": { t: [5.4, 6.1, 9.4, 14.3, 18.8, 21.9, 25.7, 26.9, 23.3, 18, 12.5, 7.7], p: [60, 56, 117, 124, 138, 168, 154, 168, 226, 235, 96, 58], kind: "{太平洋|たいへいよう}{側|がわ}の{気候|きこう}", why: "{夏|なつ}に{雨|あめ}が{多|おお}く、{冬|ふゆ}はかわいた{晴|は}れの{日|ひ}が{多|おお}い" },
    "{松本|まつもと}": { t: [-0.4, 0.4, 4.4, 10.6, 16, 19.9, 23.8, 24.7, 20.5, 13.9, 7.7, 2.2], p: [36, 44, 80, 75, 100, 126, 138, 92, 130, 103, 54, 34], kind: "{中央|ちゅうおう}{高地|こうち}の{気候|きこう}", why: "1{年|ねん}を{通|とお}して{降水|こうすい}{量|りょう}が{少|すく}なく、{夏|なつ}と{冬|ふゆ}の{気温|きおん}の{差|さ}が{大|おお}きい" },
    "{高松|たかまつ}": { t: [5.9, 6.3, 9.4, 14.7, 19.8, 23.3, 27.5, 28.6, 24.7, 19, 13.2, 8.1], p: [39, 46, 82, 75, 101, 153, 144, 86, 148, 104, 60, 46], kind: "{瀬戸内|せとうち}の{気候|きこう}", why: "1{年|ねん}を{通|とお}して{降水|こうすい}{量|りょう}が{少|すく}なく、{冬|ふゆ}もあたたかい" },
    "{那覇|なは}": { t: [17.3, 17.5, 19.1, 21.5, 24.2, 27.2, 29.1, 29, 27.9, 25.5, 22.5, 19], p: [101, 114, 142, 161, 232, 247, 142, 241, 276, 153, 111, 103], kind: "{南西諸島|なんせいしょとう}の{気候|きこう}", why: "1{年|ねん}を{通|とお}して{気温|きおん}が{高|たか}く、{降水|こうすい}{量|りょう}が{多|おお}い" }
  };
  const CLIMATEK = new Proxy(plainKeys(CLIMATE), { get: (o, k) => o[noRuby(k)] });
  function climate(name, o = {}) {
    const d = CLIMATEK[noRuby(name)];
    const x0 = 12, y0 = 6, w = 48, h = 40, pMax = 500, tMin = -10, tMax = 30;
    const X = (i) => x0 + (i + 0.5) * w / 12, Yp = (v) => y0 + h - v / pMax * h, Yt = (v) => y0 + h - (v - tMin) / (tMax - tMin) * h;
    let raw = rect(x0, y0, w, h, { w: 0.4 });
    const lab = [];
    for (let v = 0; v <= pMax; v += 100) {
      raw += line(x0, Yp(v), x0 + w, Yp(v), { w: 0.12, c: "#aaa" });
      lab.push(T(x0 + w + 1.2, Yp(v) + 1, v, 2.6, { anchor: "start" }));
    }
    for (let v = tMin; v <= tMax; v += 10) lab.push(T(x0 - 1.2, Yt(v) + 1, v, 2.6, { anchor: "end" }));
    d.p.forEach((v, i) => (raw += rect(X(i) - 1.5, Yp(v), 3, Yp(0) - Yp(v), { f: "#bcd9ec", c: "#4a7fa5", w: 0.25 })));
    raw += `<polyline points="${d.t.map((v, i) => `${r1(X(i))},${r1(Yt(v))}`).join(" ")}" fill="none" stroke="#c0392b" stroke-width="0.6"/>`;
    d.t.forEach((v, i) => (raw += `<circle cx="${r1(X(i))}" cy="${r1(Yt(v))}" r="0.7" fill="#c0392b"/>`));
    [1, 6, 12].forEach((m) => lab.push(T(X(m - 1), y0 + h + 3.6, m, 2.6)));
    lab.push(T(x0 + w / 2, y0 + h + 7.6, "({月|つき})", 2.6));
    lab.push(T(x0 - 2, y0 - 2, "(℃)", 2.6, { anchor: "start" }), T(x0 + w + 6, y0 - 2, "(mm)", 2.6, { anchor: "end" }));
    if (o.label) lab.push(T(x0 + w / 2, y0 - 1.6, o.label, 3.6, { bold: true }));
    return { raw, lab, w: 72, h: 58 };
  }
  // 雨温図をならべる
  function climates(list, labels) {
    let raw = "";
    const lab = [];
    list.forEach((n, i) => {
      const c = climate(n, { label: labels[i] });
      const dx = i * 70;
      raw += `<g transform="translate(${dx},0)">${c.raw}</g>`;
      for (const L of c.lab) lab.push({ ...L, x: L.x + dx });
    });
    return fig(list.length * 70 + 2, 58, raw, lab, 1);
  }

  // ===== ぼうグラフ(横・たて) =====
  // data: [[名前, 数]]。o.unit: 単位、o.max、o.step
  function barH(data, o = {}) {
    const x0 = o.lw || 26, y0 = 8, bh = 5.2, gap = 2.2, w = o.w || 70;
    const max = o.max || Math.max(...data.map((d) => d[1])) * 1.1, step = o.step || max / 5;
    const X = (v) => x0 + v / max * w, h = data.length * (bh + gap);
    let raw = "";
    const lab = [];
    if (o.minor) for (let v = 0; v <= max + 1e-9; v += o.minor) raw += line(X(v), y0, X(v), y0 + h, { w: 0.08, c: "#ccc" });
    for (let v = 0; v <= max + 1e-9; v += step) {
      raw += line(X(v), y0 - 1, X(v), y0 + h, { w: 0.16, c: "#888" });
      lab.push(T(X(v), y0 - 2.2, +v.toFixed(1), 2.6));
    }
    data.forEach(([n, v], i) => {
      const y = y0 + i * (bh + gap);
      raw += rect(x0, y, X(v) - x0, bh, { f: o.hide === i ? "#fff" : "#bcd9ec", c: "#4a7fa5", w: 0.3, dash: o.hide === i ? "1 0.8" : "" });
      lab.push(T(x0 - 1.5, y + bh * 0.72, n, 3, { anchor: "end" }));
      if (o.values) lab.push(T(X(v) + 1.2, y + bh * 0.72, o.values === "hide" && o.hide === i ? "？" : v + (o.unitAfter || ""), 2.6, { anchor: "start" }));
    });
    raw += line(x0, y0 - 1, x0, y0 + h, { w: 0.4 });
    if (o.unit) lab.push(T(x0 + w, y0 + h + 4.5, o.unit, 2.7, { anchor: "end" }));
    if (o.title) lab.push(T(x0 + w / 2, 2.6, o.title, 3.2, { bold: true }));
    return fig(x0 + w + 10, y0 + h + 6, raw, lab, 1.05);
  }
  // 年ごとの折れ線グラフ
  function lineYears(years, series, o = {}) {
    const g = RK.graph({ x0: 16, y0: 8, w: o.w || 80, h: o.h || 40, xs: [0, years.length - 1, 1], ys: o.ys, xl: o.xl || "({年|とし})", yl: o.yl || "", xLab: (v) => (o.every && v % o.every ? "" : years[v]), lines: series.map((s) => ({ pts: s.v.map((v, i) => [i, v]), label: s.label, dash: s.dash })) });
    if (o.title) g.lab.push(T(16 + (o.w || 80) / 2, 3, o.title, 3.2, { bold: true }));
    return fig(16 + (o.w || 80) + 14, 8 + (o.h || 40) + 11, g.raw, g.lab, 1.05);
  }

  // ===== 三権分立 =====
  // labels: 矢印のところの記号(ア〜カ)。null のところは ことばを出す
  function sanken(lb = {}) {
    const box = (x, y) => rect(x - 15, y - 5, 30, 10, { r: 2, f: "#fff", w: 0.5 });
    let raw = box(65, 8) + box(18, 72) + box(112, 72) + `<ellipse cx="65" cy="50" rx="10" ry="5" fill="${C.yellow}" stroke="#000" stroke-width="0.4"/>`;
    const lab = [T(65, 9.3, "{国会|こっかい}", 3.6, { bold: true }), T(18, 73.3, "{内閣|ないかく}", 3.6, { bold: true }), T(112, 73.3, "{裁判所|さいばんしょ}", 3.6, { bold: true }), T(65, 51.3, "{国民|こくみん}", 3.4, { bold: true })];
    lab.push(T(88, 9.3, "({立法|りっぽう}{権|けん})", 2.8, { anchor: "start" }), T(18, 81.5, "({行政|ぎょうせい}{権|けん})", 2.8), T(112, 81.5, "({司法|しほう}{権|けん})", 2.8));
    const isL = (s) => /^[ア-カ]$/.test(s);
    const L = (s, x, y, anchor) => lab.push(T(x, y, s, isL(s) ? 3.6 : 2.8, { bold: isL(s), anchor }));
    // 国会→内閣(外がわ)、内閣→国会(内がわ)
    raw += arrow(51, 13.5, 12, 66.5, { w: 0.45 }) + arrow(25, 66.5, 58, 13.5, { w: 0.45 });
    L(lb.a ?? "{内閣|ないかく}{総理|そうり}{大臣|だいじん}の{指名|しめい}", 29, 37, "end");
    L(lb.b ?? "{衆議院|しゅうぎいん}の{解散|かいさん}", 47.5, 36, "start");
    // 国会→裁判所(外がわ)、裁判所→国会(内がわ)
    raw += arrow(79, 13.5, 118, 66.5, { w: 0.45 }) + arrow(105, 66.5, 72, 13.5, { w: 0.45 });
    L(lb.c ?? "{弾劾|だんがい}{裁判|さいばん}", 101, 37, "start");
    L(lb.d ?? "{違憲|いけん}{立法|りっぽう}{審査|しんさ}", 82.5, 36, "end");
    // 内閣→裁判所(上)、裁判所→内閣(下)
    raw += arrow(34, 70, 96, 70, { w: 0.45 }) + arrow(96, 75, 34, 75, { w: 0.45 });
    L(lb.e ?? "{最高|さいこう}{裁判所|さいばんしょ}{長官|ちょうかん}の{指名|しめい}", 65, 68.2);
    L(lb.f ?? "{命令|めいれい}・{処分|しょぶん}の{違憲|いけん}{審査|しんさ}", 65, 80);
    // 国民から
    raw += line(65, 45, 65, 13.5, { w: 0.3, dash: "1 0.8" }) + line(57, 53.5, 30, 66.5, { w: 0.3, dash: "1 0.8" }) + line(73, 53.5, 100, 66.5, { w: 0.3, dash: "1 0.8" });
    L(lb.g ?? "{選挙|せんきょ}", 63.5, 25, "end");
    L(lb.h ?? "{世論|よろん}", 42, 58.5, "end");
    L(lb.i ?? "{国民|こくみん}{審査|しんさ}", 88, 58.5, "start");
    return fig(132, 84, raw, lab, 1.05);
  }

  // ===== 需要と供給の曲線 =====
  function supplyDemand(lb = {}) {
    const x0 = 12, y0 = 6, w = 56, h = 44;
    let raw = arrow(x0, y0 + h, x0 + w + 4, y0 + h, { w: 0.45 }) + arrow(x0, y0 + h, x0, y0 - 3, { w: 0.45 });
    raw += path(`M${x0 + 6} ${y0 + 4}Q${x0 + 22} ${y0 + 30} ${x0 + w - 4} ${y0 + h - 4}`, { w: 0.7 });
    raw += path(`M${x0 + 6} ${y0 + h - 4}Q${x0 + 30} ${y0 + 26} ${x0 + w - 4} ${y0 + 4}`, { w: 0.7, dash: "2 1" });
    // 2つの曲線の交点(均衡点)をもとめる
    const qb = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
    const D = (t) => [qb(x0 + 6, x0 + 22, x0 + w - 4, t), qb(y0 + 4, y0 + 30, y0 + h - 4, t)], S = (t) => [qb(x0 + 6, x0 + 30, x0 + w - 4, t), qb(y0 + h - 4, y0 + 26, y0 + 4, t)];
    let best = [1e9, 0, 0];
    for (let i = 0; i <= 400; i++) for (let j = 0; j <= 400; j++) {
      const a = D(i / 400), b = S(j / 400), dd = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (dd < best[0]) best = [dd, a[0], a[1]];
    }
    const ex = +best[1].toFixed(2), ey = +best[2].toFixed(2);
    raw += line(ex, ey, ex, y0 + h, { w: 0.25, dash: "1 0.8" }) + line(x0, ey, ex, ey, { w: 0.25, dash: "1 0.8" }) + `<circle cx="${ex}" cy="${ey}" r="0.8" fill="#000"/>`;
    const lab = [T(x0 - 1, y0 - 4, "{価格|かかく}", 3, { anchor: "start" }), T(x0 + w + 4, y0 + h + 4.5, "{数量|すうりょう}", 3, { anchor: "end" }), T(x0 + w - 2, y0 + h - 6, lb.d ?? "{需要|じゅよう}{曲線|きょくせん}", 3, { anchor: "end", bold: /^[ア-エ]$/.test(lb.d) }), T(x0 + w - 2, y0 + 2, lb.s ?? "{供給|きょうきゅう}{曲線|きょくせん}", 3, { anchor: "end", bold: /^[ア-エ]$/.test(lb.s) }), T(ex + 2, ey - 1.5, lb.e ?? "", 3.2, { anchor: "start", bold: true })];
    return fig(x0 + w + 8, y0 + h + 7, raw, lab, 1.1);
  }

  // ===== 人口ピラミッド(形だけ) =====
  const PYR = {
    "{富士山|ふじさん}{型|がた}": [1, 0.92, 0.84, 0.76, 0.67, 0.58, 0.48, 0.38, 0.27, 0.16],
    "つりがね{型|がた}": [0.66, 0.68, 0.7, 0.71, 0.7, 0.68, 0.64, 0.56, 0.42, 0.24],
    "つぼ{型|かた}": [0.42, 0.48, 0.55, 0.62, 0.7, 0.8, 0.86, 0.82, 0.66, 0.4]
  };
  function pyramid(kind, label) {
    const v = plainKeys(PYR)[noRuby(kind)], cx = 22, bh = 3.4, y0 = 4;
    let raw = "";
    v.forEach((a, i) => {
      const y = y0 + (v.length - 1 - i) * bh, L = a * 17;
      raw += rect(cx - L, y, L, bh - 0.3, { f: "#bcd9ec", c: "#4a7fa5", w: 0.25 }) + rect(cx, y, L, bh - 0.3, { f: "#f6d4d0", c: "#b55", w: 0.25 });
    });
    raw += line(cx, y0 - 1, cx, y0 + v.length * bh + 0.5, { w: 0.4 });
    return { raw, lab: [T(cx, y0 + v.length * bh + 5, label, 3.6, { bold: true }), T(cx - 12, y0 - 0.5, "{男|おとこ}", 2.6), T(cx + 12, y0 - 0.5, "{女|おんな}", 2.6)], w: 46, h: y0 + v.length * bh + 8 };
  }
  function pyramids(kinds, labels) {
    let raw = "";
    const lab = [];
    kinds.forEach((k2, i) => {
      const p = pyramid(k2, labels[i]), dx = i * 48;
      raw += `<g transform="translate(${dx},0)">${p.raw}</g>`;
      for (const L of p.lab) lab.push({ ...L, x: L.x + dx });
    });
    return fig(kinds.length * 48, 46, raw, lab, 1.05);
  }

  // ===== 町の地図(方位・地図記号の読み取り) =====
  // 5×4 のます目に、地図記号・駅・川・道をおく。rng で場所をかえる
  function townMap(rng, names) {
    const cols = 5, rows = 4, cw = 22, ch = 16, x0 = 4, y0 = 4;
    // はじめの2つは、駅から見てちょうど8方位のどれかになる場所におく
    const good = rng.shuffle([15, 16, 18, 19, 2, 11, 13, 5, 9]);
    const first = good.slice(0, 2), rest = rng.shuffle([...Array(cols * rows).keys()].filter((c) => ![7, 12, 17].includes(c) && !first.includes(c)));
    const cells = [...first, ...rest];
    let raw = rect(x0, y0, cols * cw, rows * ch, { w: 0.5 });
    // 川(左から右へ)と道と線路
    raw += path(`M${x0} ${y0 + ch * 1.0}Q${x0 + cw * 1.5} ${y0 + ch * 0.7} ${x0 + cw * 2.5} ${y0 + ch * 1.05}T${x0 + cw * 5} ${y0 + ch * 0.95}`, { w: 2.2, c: "#9cc8e6" });
    raw += line(x0, y0 + ch * 2.5, x0 + cw * 5, y0 + ch * 2.5, { w: 1.4, c: "#bbb" }) + line(x0 + cw * 2.5, y0, x0 + cw * 2.5, y0 + ch * 4, { w: 1.4, c: "#bbb" });
    raw += line(x0, y0 + ch * 3.5, x0 + cw * 5, y0 + ch * 3.5, { w: 0.8 }) + line(x0, y0 + ch * 3.5, x0 + cw * 5, y0 + ch * 3.5, { w: 0.5, c: "#fff", dash: "3 3" });
    // 駅(まん中の下)
    const sx = x0 + cw * 2.5, sy = y0 + ch * 3.5;
    raw += rect(sx - 5, sy - 2, 10, 4, { f: "#fff", w: 0.5 });
    const placed = {};
    const lab = [T(sx, sy + 6.2, "{駅|えき}", 3)];
    names.forEach((n, i) => {
      const c = cells[i], cx = x0 + (c % cols) * cw + cw / 2, cy = y0 + Math.floor(c / cols) * ch + ch / 2 + (Math.floor(c / cols) === 0 ? 3 : 0);
      raw += `<circle cx="${cx}" cy="${cy}" r="5" fill="#fff"/>` + sym(n, cx, cy, 8);
      placed[n] = [c % cols, Math.floor(c / cols)];
    });
    // 方位記号とものさし
    const nx = x0 + cols * cw + 9;
    raw += line(nx, y0 + 16, nx, y0 + 2, { w: 0.5 }) + poly([[nx, y0 + 1], [nx - 1.8, y0 + 5.5], [nx + 1.8, y0 + 5.5]], { f: "#000" });
    lab.push(T(nx, y0 + 21, "{北|きた}", 3.2, { bold: true }));
    lab.push(T(x0 + 4, y0 + ch * 1.0 - 2.6, "{川|かわ}", 2.8, { anchor: "start" }));
    return { fig: fig(x0 + cols * cw + 16, y0 + rows * ch + 10, raw, lab, 1.1), placed, station: [2, 3] };
  }
  // 駅(st)から見た方位(8方位)
  function dirFrom([sx, sy], [x, y]) {
    const dx = x - sx, dy = sy - y;
    const a = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
    return DIR8[Math.round(a / 45) % 8];
  }

  // ===== 等高線と地形図 =====
  function contour(o = {}) {
    // 2つの山(左はゆるやか、右は急)
    let raw = rect(2, 2, 96, 50, { w: 0.4 });
    const lab = [];
    [[30, 27, [21, 16, 11, 6], [15, 11, 7.5, 4]], [72, 27, [13, 10.5, 8, 5.5], [11, 8.5, 6.2, 4]]].forEach(([cx, cy, rx, ry], m) => {
      rx.forEach((r, i) => (raw += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry[i]}" fill="none" stroke="#7a5a2a" stroke-width="${i === 1 || i === 3 ? 0.5 : 0.3}"/>`));
      raw += poly([[cx, cy - 1.4], [cx - 1.4, cy + 1], [cx + 1.4, cy + 1]], { f: "#000" });
      lab.push(T(cx, cy + 5.5, m ? (o.b ?? "B") : (o.a ?? "A"), 3.4, { bold: true }));
    });
    return fig(100, 54, raw, lab, 1.05);
  }

  return { shapeRow, prefShape, regionZoom, NB, SEA, CLIMATEK, SYM_NAMES, symName, SYM_FROM, symFrom, sym, symRow, DIR8, compass, PREF, prefNo, REG7, regionOf, capOf, jpMap, regionMap, CONT, SHU, worldMap, WP, CLIMATE, climate, climates, barH, lineYears, sanken, supplyDemand, pyramids, townMap, dirFrom, contour };
})();
