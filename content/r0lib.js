// 社会プリントの共通の道具(理科プリントの RK をもとにしたもの)
//   RK.bank(id, 問題の一覧)      ことば・しくみの問題(1問ずつ)
//   RK.figs(id, 図の問題の一覧)  図・実験の問題(図と小問)
//   RK.calc(id, 作る関数)        計算問題
//   RK.grade(学年, 単元の一覧)   学年のデータ
// 問題の一覧の書き方(1行に1問。| で区切る):
//   2|@平地には人が［多く*・少なく］すんでいます。   正しいほうを○でかこむ(* が正しいほう)
//   1|問い|答え                 ふつうの問題(答えのらんがつく)
//   1|〜は（　　　）です。|答え    （　　　）が答えの四角になる。2つ以上あるときは 答えを 、で区切る
//   2|問い|=正しいもの|ちがうもの|ちがうもの   えらぶ問題(ア・イ・ウ…に並べかえる)
//   2|問い|>1番目|2番目|3番目    じゅんばんに並べる問題
//   2|〜（　　　）〜（　　　）〜|答え1|答え2|-ちがうことば   〔ことば〕からえらぶ穴うめ(「-」はまぎらわしいことば)
//   1|?文|○                      正しければ○、まちがっていれば×(答えは ○ か ×)
//   2|!指示文|もの=○|もの=×|…      いくつかのものに ○・× をつける(4〜5こえらんで出す)
// 行の先頭の数字は むずかしさ(1:★、2:★★、3:★★★)。
var r0lib = [];
var RK = (() => {
  const LET = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク"];
  // max:出す問題のむずかしさの上限、opts:答えをえらぶ選択肢の数(0 は書いて答える)
  const LV = { basic: { max: 1, opts: 3 }, normal: { max: 2, opts: 4 }, challenge: { max: 3, opts: 0 } };
  const noRuby = (s) => String(s ?? "").replace(/\{([^{}|]+)\|[^{}]*\}/g, "$1");

  function parse(src) {
    const out = [];
    for (const raw of String(src).split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const f = line.split("|");
      // {漢字|かな} の | で切れたものをつなぎなおす
      const cells = [];
      for (const x of f) {
        const prev = cells[cells.length - 1];
        if (prev !== undefined && (prev.match(/\{/g) || []).length > (prev.match(/\}/g) || []).length) cells[cells.length - 1] = prev + "|" + x;
        else cells.push(x);
      }
      // 「（　　　）を」「（　　　）に」も答えの四角にするため、かっこのあとに見えない文字をはさむ
      for (let k = 1; k < cells.length; k++) cells[k] = cells[k].replace(/（[　 ]{2,}）(?=[にを])/g, (m) => m + "\u200B");
      const lv = Number(cells[0]);
      if (!(lv >= 1 && lv <= 3)) throw new Error("むずかしさがない: " + line);
      const q = cells[1], rest = cells.slice(2);
      const blanks = (q.match(/（[　 ]{2,}）/g) || []).length;
      if (q.startsWith("@")) {
        // 正しいほうを○でかこむ:［多く*・少なく］(* が正しいほう)
        const ans = [];
        const qq = q.slice(1).replace(/［([^］]+)］/g, (m, inner) => {
          const ws = inner.split("・");
          ans.push(...ws.filter((w) => w.endsWith("*")).map((w) => w.slice(0, -1)));
          return "（ " + ws.map((w) => w.replace(/\*$/, "")).join(" ・ ") + " ）";
        });
        out.push({ lv, type: "circle", q: qq, a: ans.join("、") });
      } else if (q.startsWith("?")) out.push({ lv, type: "tf", q: q.slice(1), a: rest[0] });
      else if (q.startsWith("!")) out.push({ lv, type: "tfList", q: q.slice(1), list: rest.map((x) => { const i = x.lastIndexOf("="); return [x.slice(0, i), x.slice(i + 1)]; }) });
      else if (blanks >= 2 || rest.some((x) => x.startsWith("-"))) out.push({ lv, type: "bank", q, ans: rest.filter((x) => !x.startsWith("-")), dummy: rest.filter((x) => x.startsWith("-")).map((x) => x.slice(1)) });
      else if (rest[0] && rest[0].startsWith("=")) out.push({ lv, type: "choice", q, ok: rest[0].slice(1), ng: rest.slice(1) });
      else if (rest[0] && rest[0].startsWith(">")) out.push({ lv, type: "order", q, seq: [rest[0].slice(1), ...rest.slice(1)] });
      else out.push({ lv, type: "qa", q, a: rest.join("|") });
    }
    return out;
  }
  const weightOf = (lv, max) => lv === max ? 3 : lv === max - 1 ? 2 : 1;
  const rnd = (rng) => (rng.next ? rng.next() : rng.int(0, 999999) / 1e6);
  function pickW(rng, pool, max) {
    const w = pool.map((x) => weightOf(x.lv, max)), sum = w.reduce((a, b) => a + b, 0);
    let r = rnd(rng) * sum;
    for (let i = 0; i < pool.length; i++) {
      r -= w[i];
      if (r < 0) return pool[i];
    }
    return pool[pool.length - 1];
  }
  const optLine = (opts, kids) => opts.map((o, i) => `${LET[i]}　${o}`).join(kids || opts.join("").length > 34 ? "[[br]]" : "　　");
  // kids:1・2年(分かち書き)用のことば
  function render(it, rng, kids, p) {
    if (it.type === "qa") return { text: it.q, a: it.a };
    if (it.type === "circle") return { text: `${p && p.compact ? "" : (kids ? "ただしい ほうを ○で かこみましょう。" : "正しいほうを○でかこみましょう。") + "[[br]]"}${it.q}`, a: it.a, circle: true };
    if (it.type === "tf" && it.alt) {
      const f = rnd(rng) < 0.5;
      return render({ ...it, alt: null, q: f ? rng.pick(it.alt) : it.q, a: f ? "×" : "○" }, rng, kids, p);
    }
    if (it.type === "tf") return { text: p && p.compact ? `（　　）${it.q}` : `（　　）${it.q}[[br]]${kids ? "〔ただしければ ○、まちがって いれば ×〕" : "〔正しければ○、まちがっていれば×〕"}`, a: it.a };
    if (it.type === "tfList") {
      const pick = rng.shuffle(it.list).slice(0, Math.min(it.list.length, 5));
      return { text: `${it.q}[[br]]${pick.map(([w], i) => `${LET[i]}（　　）${w}`).join("　")}`, a: pick.map(([, m]) => m).join("、"), wide: true };
    }
    if (it.type === "bank") {
      // 〔ことば〕から えらんで（　）に書く。ことばは 同じものを1回だけ出す
      const optN = p && p.opts !== undefined ? p.opts : 4;
      // ★3:〔ことば〕を出さずに書いて答える。★1:まぎらわしいことばを1つだけ
      if (optN === 0 && it.ans.length >= 2) return { text: p && p.compact ? it.q : `${kids ? "（　）に あう ことばを かきましょう。" : "（　）にあてはまることばを書きましょう。"}[[br]]${it.q}`.replace(/（　）に/, "（ ）に"), a: it.ans.join("、"), wide: true };
      const words = rng.shuffle([...new Set([...it.ans, ...(optN === 3 ? rng.shuffle(it.dummy).slice(0, 1) : it.dummy)])]);
      return { text: `${p && p.compact ? "" : (kids ? "あう ことばを、したの 〔　〕から えらんで かきましょう。" : "あてはまることばを、下の〔　〕からえらんで書きましょう。") + "[[br]]"}${it.q}[[br]]〔 ${words.join(kids ? " ・ " : "・")} 〕`, a: it.ans.join("、"), wide: true };
    }
    if (it.type === "choice") {
      // ★3:「どれ」とたずねていない短い答えは、選択肢なしで書いて答える。★1:選択肢を3つまで
      const optN = p && p.opts !== undefined ? p.opts : 4;
      if (optN === 0 && !/どれ|どちら|えらび/.test(noRuby(it.q)) && [...noRuby(it.ok)].length <= 14) return { text: it.q, a: it.ok, written: true };
      const ng = optN === 3 ? rng.shuffle(it.ng).slice(0, 2) : it.ng;
      const opts = rng.shuffle([it.ok, ...ng]);
      return { text: `${it.q}[[br]]${optLine(opts, kids)}`, a: LET[opts.indexOf(it.ok)], wide: true };
    }
    // ならべる問題:ばらばらにして記号をつけ、正しい順の記号を答える
    const opts = rng.shuffle(it.seq.slice());
    return { text: `${it.q}[[br]]${optLine(opts, kids)}`, a: it.seq.map((s) => LET[opts.indexOf(s)]).join("→"), wide: true };
  }

  // ===== イラスト(絵文字)=====
  // 小学校・生活科の問題には、問いの中のことばから絵をえらんで、問題のよこに出す(答えのことばからはえらばない)
  // イラスト(assets/pic・assets/fig)。build で 名前 → [data URI, はば, 高さ] が入る
  const PIC_SRC = /*PICMAP*/{};
  const picSrc = (n) => (PIC_SRC[n] || [])[0] || "";
  // 図の中に絵を入れる部品(x, y, はば, 高さ は mm)
  const img = (n, x, y, w, h) => ({ t: "image", href: picSrc(n), x, y, w, h });
  // 問題のよこの絵:問いのことばに合わせてえらぶ(答えのことばからはえらばない)。名前がイラストにないときは絵文字
  const PICS = [
    ["消防", "shoubousha"], ["火事", "shoubousha"], ["119", "shoubousha"], ["警察", "kouban"], ["交番", "kouban"], ["110", "kouban"], ["事故", "shingou"], ["交通", "shingou"], ["信号", "shingou"], ["道路", "shingou"],
    ["郵便", "post"], ["手紙", "post"], ["病院", "byouin"], ["公園", "kouen"], ["図書館", "hon"], ["本", "hon"], ["学校", "gakkou"], ["まち", "machi"], ["町", "machi"], ["市", "machi"], ["店", "machi"], ["スーパー", "machi"],
    ["ごみ", "recycle"], ["リサイクル", "recycle"], ["資源", "recycle"], ["給食", "kyuushoku"], ["米", "onigiri"], ["食料", "onigiri"], ["水道", "shizuku"], ["水", "shizuku"], ["ダム", "kawa"], ["川", "kawa"], ["海", "nami"], ["漁業", "nami"], ["水産", "nami"],
    ["台風", "taifuu"], ["地震", "kazan"], ["火山", "kazan"], ["津波", "nami"], ["雪", "yukidaruma"], ["森林", "mori"], ["森", "mori"], ["地球", "chikyuu"], ["世界", "chikyuu"], ["方位", "houijishin"], ["方位じしん", "houijishin"],
    ["野菜", "ninjin"], ["農家", "ninjin"], ["畑", "ninjin"], ["トマト", "minitomato"], ["あいさつ", "aisatsu"], ["先生", "sensei"]
  ].map(([w, e]) => [noRuby(w), e]).sort((a, b) => b[0].length - a[0].length);
  const PIC_DEF = {};
  const picScope = (id) => /^(e[1-4]|sb)\./.test(id);
  // 問いの文から、絵の名前を1つか2つえらぶ(「、」でつないで返す)
  function picOf(q, def) {
    let t = noRuby(q);
    const out = [];
    for (const [w, e] of PICS) {
      if (out.length >= 2) break;
      const i = t.indexOf(w);
      if (i < 0) continue;
      if (!out.includes(e)) out.push(e);
      t = t.slice(0, i) + "　".repeat(w.length) + t.slice(i + w.length);
    }
    return out.length ? out.join(",") : def || "";
  }
  // 問題のよこの絵の HTML
  const picHtml = (pic) => String(pic).split(",").filter(Boolean).map((n) => (picSrc(n) ? `<img src="${picSrc(n)}" alt="">` : `<span>${n}</span>`)).join("");

  // ===== 書いて答える問題に、難易度に合わせて選択肢をつける =====
  // 同じ小単元のほかの問題の答えを、まちがいの選択肢にする
  const shortAns = (a) => noRuby(a).replace(/\(.*?\)|（.*?）/g, "").trim();
  function candidatesOf(items) {
    const out = [];
    for (const it of items) {
      if (it.type === "qa") out.push(it.a);
      else if (it.type === "choice") out.push(it.ok, ...it.ng);
      else if (it.type === "bank") out.push(...it.ans, ...it.dummy);
    }
    const seen = new Set();
    return out.filter((a) => {
      const k = shortAns(a);
      if (!k || /、|，|,/.test(k) || [...k].length > 28 || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  const isNum = (s) => /^[0-9０-９.約〜−-]/.test(s);
  // 問いの形で、つける選択肢の種類を決める(合わない問いには つけない)
  const NAME_Q = /何といい|何という|名前|何ですか|何でしょう|何を|何が|何に|何の|何色|何性|何類|何極|何きょく|どこ|だれ/;
  const SKIP_Q = /か、|なぜ|どうして|理由|どのように|どうします|どうすれば|どうしたら|書きましょう|答えましょう|ちがい|1つ/;
  const CHANGE = [["大きくなる", "小さくなる"], ["ふえる", "へる"], ["高くなる", "低くなる"], ["長くなる", "短くなる"], ["速くなる", "おそくなる"], ["強くなる", "弱くなる"], ["上がる", "下がる"], ["明るくなる", "暗くなる"], ["あたたかくなる", "つめたくなる"], ["重くなる", "軽くなる"], ["多くなる", "少なくなる"], ["大きい", "小さい"], ["高い", "低い"], ["長い", "短い"], ["速い", "おそい"], ["多い", "少ない"], ["強い", "弱い"], ["明るい", "暗い"]];
  const looksName = (a) => !/(る|い|た|ない|ます|です|だ|れる|する)$/.test(shortAns(a));
  function changeOpts(okS, q = "") {
    for (const pair of CHANGE) {
      const k = pair.indexOf(okS);
      if (k >= 0) return [pair[1 - k], okS === "かわらない" || okS === "変わらない" ? pair[0] : "かわらない"];
    }
    // 「かわらない」のときは、問いに合う変わり方を まちがいにする(重さ → 重くなる・軽くなる など)
    if (/^(かわらない|変わらない|同じ)$/.test(okS)) return /重さ/.test(q) ? ["重くなる", "軽くなる"] : /時間|長さ/.test(q) ? ["長くなる", "短くなる"] : /温度|気温/.test(q) ? ["高くなる", "低くなる"] : /量|数/.test(q) ? ["ふえる", "へる"] : /明るさ/.test(q) ? ["明るくなる", "暗くなる"] : ["大きくなる", "小さくなる"];
    return null;
  }
  function numOpts(rng, okS) {
    const m = /(\d+(?:\.\d+)?)/.exec(okS);
    if (!m) return null;
    const n = Number(m[1]), dec = (m[1].split(".")[1] || "").length;
    const fmt = (v) => okS.replace(m[1], String(+v.toFixed(dec)));
    const cand = [...new Set([n * 2, n / 2, n + (dec ? 0.1 : 1) * (n >= 10 ? 10 : 1), n - (dec ? 0.1 : 1) * (n >= 10 ? 10 : 1), n * 3, n + (dec ? 0.2 : 2)].map((v) => +v.toFixed(dec)).filter((v) => v > 0 && v !== n && (dec || Number.isInteger(v))))];
    return rng.shuffle(cand).slice(0, 3).map(fmt);
  }
  // ことばのなかま(同じなかまのことばを、まちがいの選択肢にする)。FAMR:ふりがなつきの形
  const FAMR = new Map();
  const famRuby = (w) => FAMR.get(w) || w;
  const FAM = `
東,西,南,北
北東,北西,南東,南西
春,夏,秋,冬
田,畑,果樹園,茶畑,針葉樹林,広葉樹林
市役所,町村役場,学校,郵便局,警察署,交番,消防署,病院,神社,寺院,図書館,博物館,老人ホーム,工場,発電所,温泉,港,灯台,城跡
消防署,警察署,市役所,病院
119番,110番
消防士,警察官,市役所の人
北海道地方,東北地方,関東地方,中部地方,近畿地方,中国・四国地方,九州地方
北海道,東北,関東,中部,近畿,中国・四国,九州
ユーラシア大陸,アフリカ大陸,北アメリカ大陸,南アメリカ大陸,オーストラリア大陸,南極大陸
太平洋,大西洋,インド洋
日本海,太平洋,オホーツク海,東シナ海
アジア州,ヨーロッパ州,アフリカ州,北アメリカ州,南アメリカ州,オセアニア州
緯線,経線,赤道,本初子午線
緯度,経度
択捉島,南鳥島,沖ノ鳥島,与那国島
北方領土,竹島,尖閣諸島
信濃川,利根川,石狩川,最上川,北上川,木曽川,筑後川
越後平野,関東平野,石狩平野,庄内平野,濃尾平野,筑紫平野
奥羽山脈,飛騨山脈,木曽山脈,赤石山脈,日高山脈
日本海側の気候,太平洋側の気候,北海道の気候,中央高地の気候,瀬戸内の気候,南西諸島の気候
沖合漁業,沿岸漁業,遠洋漁業,養殖業,栽培漁業
中京工業地帯,阪神工業地帯,京浜工業地帯,北九州工業地帯
中京工業地帯,阪神工業地帯,京浜工業地帯,瀬戸内工業地域,東海工業地域,北関東工業地域,京葉工業地域
太平洋ベルト,シリコンバレー,サンベルト
機械工業,金属工業,化学工業,食料品工業,せんい工業
自動車,鉄鋼,石油,せんい
石油,石炭,天然ガス,鉄鉱石
火力発電,水力発電,原子力発電,風力発電,太陽光発電,地熱発電
水俣病,イタイイタイ病,四日市ぜんそく,新潟水俣病
米,小麦,大豆,野菜,果物,肉,魚
米,小麦,とうもろこし,大豆
バス,電車,船,飛行機,トラック
旧石器時代,縄文時代,弥生時代,古墳時代,飛鳥時代,奈良時代,平安時代,鎌倉時代,室町時代,安土桃山時代,江戸時代,明治時代,大正時代,昭和時代
縄文時代,弥生時代,古墳時代
縄文土器,弥生土器,はにわ,土偶,銅鐸
打製石器,磨製石器,土器
貝塚,古墳,たて穴住居,高床倉庫
卑弥呼,聖徳太子,中大兄皇子,聖武天皇,行基,鑑真
聖徳太子,中大兄皇子,中臣鎌足,天智天皇,天武天皇,聖武天皇,桓武天皇
藤原道長,紫式部,清少納言,平清盛,源頼朝,源義経
源頼朝,北条政子,北条時宗,足利尊氏,足利義満,足利義政
足利義満,足利義政,雪舟,世阿弥
織田信長,豊臣秀吉,徳川家康,徳川家光,徳川吉宗,徳川綱吉,徳川慶喜
本居宣長,杉田玄白,伊能忠敬,歌川広重,葛飾北斎,近松門左衛門,松尾芭蕉
ペリー,勝海舟,西郷隆盛,大久保利通,木戸孝允,坂本竜馬
伊藤博文,板垣退助,大隈重信,福沢諭吉,陸奥宗光,小村寿太郎
野口英世,北里柴三郎,樋口一葉,与謝野晶子,平塚らいてう
大化の改新,壬申の乱,承久の乱,応仁の乱,関ヶ原の戦い,島原・天草一揆
元寇,応仁の乱,長篠の戦い,関ヶ原の戦い,大阪の陣
日清戦争,日露戦争,第一次世界大戦,第二次世界大戦,太平洋戦争,日中戦争
下関条約,ポーツマス条約,ベルサイユ条約,サンフランシスコ平和条約,日米和親条約,日米修好通商条約
執権,摂政,関白,征夷大将軍,太政大臣,管領
御恩,奉公
楽市・楽座,刀狩,太閤検地,検地
参勤交代,鎖国,武家諸法度,寺子屋,五人組
享保の改革,寛政の改革,天保の改革
廃藩置県,地租改正,学制,徴兵令,殖産興業,富国強兵
法隆寺,東大寺,平等院鳳凰堂,中尊寺金色堂,金閣,銀閣
古事記,日本書紀,万葉集,古今和歌集,枕草子,源氏物語,平家物語,徒然草
大日本帝国憲法,日本国憲法
国民主権,基本的人権の尊重,平和主義
自由権,平等権,社会権,参政権,請求権
国会,内閣,裁判所
立法権,行政権,司法権
衆議院,参議院
国会議員,内閣総理大臣,国務大臣,最高裁判所長官
常会,臨時会,特別会,参議院の緊急集会
最高裁判所,高等裁判所,地方裁判所,家庭裁判所,簡易裁判所
民事裁判,刑事裁判
原告,被告,被告人,検察官,弁護人,裁判官
小選挙区制,比例代表制
与党,野党
条例,法律,政令,予算,条約
地方交付税交付金,国庫支出金,地方税,地方債
首長,地方議会,知事,市長
消費者,生産者,企業,政府,家計
株式,株主,配当,株主総会
日本銀行,銀行,証券会社
インフレーション,デフレーション
好景気,不景気
需要,供給,均衡価格
所得税,法人税,消費税,相続税,関税
直接税,間接税
累進課税,公債
社会保険,公的扶助,社会福祉,公衆衛生
国際連合,安全保障理事会,総会,ユネスコ,ユニセフ,WHO
PKO,ODA,NGO,NPO
APEC,ASEAN,EU,USMCA,TPP
少子高齢化,情報化,グローバル化
地球温暖化,酸性雨,砂漠化,オゾン層の破壊
リデュース,リユース,リサイクル
環太平洋造山帯,アルプス・ヒマラヤ造山帯
熱帯,乾燥帯,温帯,冷帯,寒帯,高山気候
フィヨルド,リアス海岸,扇状地,三角州
促成栽培,抑制栽培,近郊農業
過疎,過密
`.trim().split("\n").map((l) => l.split(",").map((w) => (FAMR.has(noRuby(w).trim()) || FAMR.set(noRuby(w).trim(), w.trim()), noRuby(w).trim())));
  // 選択肢をつけられる問題か(★1 では、なるべく選んで答える問題を出す)
  function optionable(it, cands) {
    if (it.type !== "qa") return true;
    const fake = { next: () => 0.5, int: (a) => a, pick: (x) => x[0], shuffle: (x) => x.slice() };
    const r = withOptions({ text: "", a: "" }, it, fake, { opts: 3 }, cands, false);
    return r.a !== "";
  }
  function withOptions(r, it, rng, p, cands, kids) {
    if (it.type !== "qa" || !p || !p.opts) return r;
    const ok = String(it.a), okS = shortAns(ok), q = noRuby(it.q);
    if (!okS || /、/.test(okS) || [...okS].length > 18 || /（[　 ]{2,}）/.test(it.q) || SKIP_Q.test(q)) return r;
    let ng = null;
    if (/\d/.test(okS) && isNum(okS) && [...okS].length <= 10) ng = numOpts(rng, okS);
    else ng = wrongOf(it, rng, cands, p.opts);
    if (!ng) return r;
    ng = rng.shuffle(ng).slice(0, p.opts - 1);
    // 2つでひと組のことば(P波・S波、直列・並列など)は、2択でもよい
    if (ng.length < 1 || (ng.length < 2 && !FAM.some((f) => f.includes(okS)))) return r;
    const okText = ok.replace(/\(.*?\)|（.*?）/g, "").trim();
    const opts = rng.shuffle([okText, ...ng]);
    return { text: `${it.q}[[br]]${optLine(opts, kids)}`, a: LET[opts.indexOf(okText)], wide: true };
  }
  // まちがいのことば(なかまのことば・反対の変わり方・同じ小単元の答え)
  function wrongOf(it, rng, cands, nOpts = 3) {
    const ok = String(it.a), okS = shortAns(ok), q = noRuby(it.q);
    let ng = null;
    if (changeOpts(okS, q)) ng = changeOpts(okS, q);
    else {
      const fams = FAM.filter((f) => f.includes(okS));
      if (fams.length) {
        // いちばん合うなかま(まちがいが3つ以上とれるもの)を使う。同じ意味のことば(ちっ素・窒素など)がまざらないように、なかまはまぜない
        const pick = fams.find((f) => f.filter((w) => w !== okS && !q.includes(w)).length >= Math.max(2, (nOpts || 3) - 1)) || fams[0];
        ng = pick.filter((w) => w !== okS && !q.includes(w)).map(famRuby);
      } else if (/^(e\d|ct|rk|km)\./.test(it.id || "") && NAME_Q.test(q) && looksName(ok) && [...okS].length <= 10 && !/ところ|とき|から|ため|こと|よう/.test(okS)) {
        // 中学:同じ小単元のことばの答えを、まちがいの選択肢にする
        const L = [...okS].length, ascii = /^[\x20-\x7e₀-₉⁺⁻²³→＋]+$/.test(okS);
        const pool = cands.filter((c) => {
          const cs = shortAns(c);
          return cs !== okS && looksName(c) && [...cs].length <= 10 && !isNum(cs) && ascii === /^[\x20-\x7e₀-₉⁺⁻²³→＋]+$/.test(cs) && !cs.includes(okS) && !okS.includes(cs) && !q.includes(cs) && !/ところ|とき|から|ため|こと|よう/.test(cs);
        });
        ng = rng.shuffle(pool).sort((a, b) => Math.abs([...shortAns(a)].length - L) - Math.abs([...shortAns(b)].length - L)).slice(0, 4).map((c) => c.replace(/\(.*?\)|（.*?）/g, "").trim());
      }
    }
    return ng && ng.length ? ng : null;
  }
  // ===== 名前をきく問題から ○× の問題を作る =====
  // 「〜を何といいますか。|A」→「〜を「A」といいます。」(正しい)/「〜を「B」といいます。」(まちがい。B はなかまのことば)
  const ENDS = [
    [/(\{何\|なん\}|なん)と(\s?)いいますか。$/, (A, m) => `「${A}」と${m[2]}いいます。`],
    [/(は|とは)(\s?)(\{何\|なに\}|\{何\|なん\}|なに|なん)ですか。$/, (A, m) => `${m[1]}${m[2]}「${A}」です。`],
    [/(は|が)(、?\s?)どう\s?なりますか。$/, (A, m) => { const v = politeOf(A); return v ? `${m[1]}${m[2]}${v}。` : null; }]
  ];
  function politeOf(v) {
    if (/なる$/.test(v)) return v.replace(/なる$/, "なります");
    if (/わらない$/.test(v)) return v.replace(/わらない$/, "わりません");
    if (/(ふえ|へ)る$/.test(v)) return v.replace(/(ふえ|へ)る$/, (x) => x === "ふえる" ? "ふえます" : "へります");
    if (/ない$/.test(v)) return null;
    if (/がる$/.test(v)) return v.replace(/がる$/, "がります");
    return null;
  }
  function deriveTf(items, cands) {
    const out = [];
    const fake = { next: () => 0.5, int: (a) => a, pick: (x) => x[0], shuffle: (x) => x.slice() };
    items.forEach((it, i) => {
      if (it.type !== "qa") return;
      const q = noRuby(it.q), okS = shortAns(it.a);
      if (!okS || /、|，/.test(okS) || [...okS].length > 14 || isNum(okS) || /（[　 ]{2,}）/.test(it.q) || SKIP_Q.test(q) || /どれ|どちら|次の|下の|図/.test(q)) return;
      const end = ENDS.find(([re]) => re.test(it.q));
      if (!end) return;
      const ng = wrongOf(it, fake, cands, 3);
      if (!ng) return;
      const A = String(it.a).replace(/\(.*?\)|（.*?）/g, "").trim();
      const m = end[0].exec(it.q), head = it.q.slice(0, m.index);
      // 「あたたかさは あたたかくなります」のような文はつくらない
      if (noRuby(head).includes(shortAns(A).slice(0, 3))) return;
      const tq = end[1](A, m);
      const fq = ng.map((B) => end[1](B, m)).filter(Boolean);
      if (!tq || !fq.length) return;
      out.push({ lv: it.lv, type: "tf", q: head + tq, alt: fq.map((x) => head + x), a: "○", derived: true, src: i, id: it.id });
    });
    return out;
  }

  // ===== ことば・しくみの問題 =====
  // 練習プリント用:問題の形のなかま
  const WHY = /なぜ|理由|どうして|どのように|どうすれば|どうしたら|ちがい/;
  // 文で書いて答える問題(答えは「(例)」にする。式や記号を書く問題はのぞく)
  const FREE_Q = /なぜ|理由|どうして|どのように|どうすれば|どうしたら|ちがい|1つ|2つ|3つ|書きましょう|わかること|わかりますか|くふう|説明|考えられ|利点|よいですか/;
  const isFree = (q, a, min = 6) => FREE_Q.test(noRuby(q)) && !/式|記号|化学反応|単位|何と\s?いい|何という|なんと\s?いい|何ですか/.test(noRuby(q)) && [...noRuby(a)].length >= min && !/^[ア-エ]$/.test(noRuby(a));
  const exAns = (q, a, min) => isFree(q, a, min) && !/^\(例\)/.test(String(a)) ? `(例) ${a}` : String(a);
  function catOf(it) {
    if (it.type === "tf") return "tf";
    if (it.type === "tfList") return "tfl";
    if (it.type === "bank") return "bank";
    if (it.type === "choice" || it.type === "order" || it.type === "circle") return "pick";
    if (WHY.test(noRuby(it.q)) && [...noRuby(it.a)].length >= 8) return "why";
    return it.optable ? "pick" : "word";
  }
  function bank(id, src, o = {}) {
    const items = parse(src);
    for (const it of items) it.id = id;
    const cands = candidatesOf(items);
    if (o.tf !== false) items.push(...deriveTf(items, cands));
    for (const it of items) it.optable = optionable(it, cands);
    for (const it of items) it.cat = catOf(it);
    return {
      id,
      instruction: o.inst === undefined ? "次の問いに答えましょう。" : o.inst,
      defaults: { max: 1 },
      levels: LV,
      // 練習プリント:この形の問題があるか
      has: (cat) => items.some((x) => x.cat === cat),
      generate(rng, p, ctx) {
        let pool = items.filter((x) => x.lv <= p.max);
        if (!pool.length) pool = items;
        if (p.only) {
          // 練習プリント:形をしぼる(その難易度にないときは、ほかの難易度からも)
          pool = pool.filter((x) => x.cat === p.only);
          if (!pool.length) pool = items.filter((x) => x.cat === p.only);
          if (!pool.length) throw new Error(`${id}: ${p.only} の問題がない`);
        }
        if (!p.only) {
          // ふつうのプリント:○×(作ったものもふくむ)は 5問に1問くらい
          const tfs = pool.filter((x) => x.type === "tf"), rest = pool.filter((x) => x.type !== "tf");
          pool = rest.length >= 4 && (!tfs.length || rnd(rng) >= 0.2) ? rest : tfs.length ? tfs : pool;
        }
        if (p.opts === 3 && !p.only) {
          const op = pool.filter((x) => x.optable);
          if (op.length >= 4) pool = op;
        }
        const it = pickW(rng, pool, p.max);
        const r = withOptions(render(it, rng, o.kids || /^(sb|e[12])\./.test(id), p), it, rng, p, cands, o.kids || /^(sb|e[12])\./.test(id));
        // 問題を全部使いきったら、同じ問題も出せるようにする(round)
        const round = ctx && Number.isInteger(ctx.index) ? Math.floor(ctx.index / pool.length) : 0;
        const ki = it.derived ? it.src : items.indexOf(it);
        // 書いて答える文の答えは「(例)」にする
        if (it.type === "qa" && r.a === it.a) r.a = exAns(it.q, it.a, 6);
        const pic = o.pic === false || !picScope(id) || p.compact ? "" : picOf(it.q, o.pic || PIC_DEF[id]);
        if (p.compact) {
          if (it.type === "tf") return { key: `${id}:${ki}#${round}`, text: r.text, wide: false, cols: 2, answer: { display: r.a }, workspace: { type: "none" }, meta: { lv: it.lv } };
        }
        return { key: `${id}:${ki}#${round}`, text: r.text, wide: true, answer: { display: r.a }, workspace: { type: "none" }, ...(r.circle ? { noAnswerBox: true } : {}), ...(pic ? { pic } : {}), meta: { lv: it.lv } };
      },
      size: items.length,
      items
    };
  }

  // ===== 図・実験の問題 =====
  // list: [{ lv, make(rng, p) → { fig, text, qs: [[問い, 答え], …], side, key } }]
  function figs(id, list, o = {}) {
    return {
      id,
      instruction: null,
      defaults: { max: 1 },
      levels: LV,
      generate(rng, p, ctx) {
        let pool = list.filter((x) => (x.lv || 1) <= p.max);
        if (!pool.length) pool = list;
        const idx = ctx && Number.isInteger(ctx.index) ? ctx.index : 0;
        // その難易度の図を使いきったら、ほかの難易度の図も出す(同じ図ばかりにならないように)
        if (idx >= pool.length && o.vary === undefined) pool = list;
        // 図の問題を使いきったら、同じ図の問題も出せるようにする(round)
        const round = Math.floor(idx / pool.length);
        const it = pickW(rng, pool.map((x) => ({ ...x, lv: x.lv || 1 })), p.max);
        const r = it.make(rng, p);
        const qs = r.qs;
        if (o.lines) {
          const labels = qs.map((_, i) => `(${i + 1})`);
          const text = `${r.text || "図を見て、次の問いに答えましょう。"}[[br]]${qs.map((q, i) => `(${i + 1}) ${q[0]}`).join("[[br]]")}`;
          return { key: `${id}:${r.key ?? noRuby(text)}#${round}`, text, figure: r.fig, answer: { display: qs.map((q, i) => `(${i + 1}) ${exAns(q[0], q[1], 8).replace(/　/g, " ")}`).join("　") }, workspace: { type: "lines", labels }, side: r.side !== false, meta: {} };
        }
        // 答えは、問いのうしろの四角に書く(四角の大きさは答えの長さに合わせる。長い答えは線)。
        // 「①」「ア」のような短い問いは、1行に3つずつならべる(Z会・ちびむすの「①（　　）②（　　）」の形)
        const ansOf = (a) => String(a).replace(/、/g, "・").replace(/　/g, " ");
        const boxOf = (a0) => {
          // 答えのうしろの(…)は四角のはばに入れない
          const a = noRuby(a0).replace(/[(（][^)）]*[)）]\s*$/, "") || noRuby(a0);
          const n = [...noRuby(a)].length;
          if (n > 13) return "[[aline]]";
          return `[[abox:${Math.min(100, Math.max(30, [...noRuby(a)].reduce((x, ch) => x + (ch.charCodeAt(0) < 8192 ? 8.5 : 10), 0) + 5))}]]`;
        };
        const blank = /（[　 ]{2,}）/;
        const lines = [];
        let row = [], rowW = 0;
        const wOf = (b) => (/aline/.test(b) ? 999 : Number(b.match(/[\d.]+/)[0]) + 14);
        const isShort = (q) => [...noRuby(String(q[0]))].length <= 3 && [...noRuby(ansOf(q[1])).replace(/[(（][^)）]*[)）]\s*$/, "")].length <= 7;
        // ならべる四角は、いちばん長い答えに合わせて同じはばにする(四角の長さで答えがわからないように)
        const shortW = Math.max(0, ...qs.filter(isShort).map((q) => Number((boxOf(ansOf(q[1])).match(/abox:([\d.]+)/) || [0, 0])[1])));
        qs.forEach((q, i) => {
          const qt = String(q[0]), a = ansOf(q[1]);
          if (isShort(q)) {
            const b = `[[abox:${shortW}]]`, w = wOf(b);
            // 1行(はば 165mm くらい)に入るだけならべる
            if (row.length && (rowW + w > 165 || row.length === 3)) { lines.push(row.join("　　")); row = []; rowW = 0; }
            row.push(`${qt} ${b}`);
            rowW += w;
            return;
          }
          if (row.length) { lines.push(row.join("　　")); row = []; rowW = 0; }
          lines.push(blank.test(qt) ? `(${i + 1}) ${qt.replace(blank, boxOf(a))}` : `(${i + 1}) ${qt} ${boxOf(a)}`);
        });
        if (row.length) lines.push(row.join("　　"));
        const text = `${r.text || "図を見て、次の問いに答えましょう。"}[[br]]${lines.join("[[br]]")}`;
        return {
          key: `${id}:${r.key ?? noRuby(text)}#${round}`,
          text,
          figure: r.fig,
          answer: { display: qs.map((q, i) => `(${i + 1}) ${ansOf(q[1])}`).join("　") },
          workspace: { type: "none" },
          noAnswerBox: true,
          side: r.side !== false,
          meta: {}
        };
      }
    };
  }

  // ===== 計算問題 =====
  // make(rng, p) → { text, a, key, work }
  function calc(id, inst, make, o = {}) {
    return {
      id,
      instruction: inst,
      defaults: { max: 1 },
      levels: LV,
      generate(rng, p, ctx) {
        const r = make(rng, p);
        // 数の組み合わせが少ない問題もあるので、o.n 問(ふつう 6問)ごとに同じ問題をゆるす
        const round = ctx && Number.isInteger(ctx.index) ? Math.floor(ctx.index / (o.n || 6)) : 0;
        return { key: `${id}:${r.key ?? noRuby(r.text)}#${round}`, text: r.text, wide: r.wide !== false, answer: { display: r.a }, workspace: { type: "none" }, work: o.work === 0 ? 0 : p.compact ? 12 : r.work ?? o.work ?? 22, plainBox: true, meta: {} };
      }
    };
  }

  // ===== 図をかく道具(単位は mm) =====
  // 図の中のことばは T(x, y, ことば, 大きさ, {anchor, bold, color})
  const T = (x, y, s, size = 3.6, o = {}) => ({ t: "text", x, y, s: String(s), size, ...o });
  const svgEsc = (s) => noRuby(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // raw は SVG の中身(mm の座標)。labels は T(…) のならび
  // SVG の中にまぎれこんだ {漢字|かな} は 漢字だけにする(ことばは T で書くこと)
  // k は印刷のときの倍率(ふつうは 1.15 倍)
  const fig = (w, h, raw, labels = [], k = 1.15) => ({ type: "draw", w, h, scaleK: k, items: [{ t: "raw", svg: noRuby(raw) }, ...labels] });
  const line = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "#000"}" stroke-width="${o.w || 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.cap ? ` stroke-linecap="${o.cap}"` : ""}/>`;
  const arrowHead = (x1, y1, x2, y2, o = {}) => {
    const a = Math.atan2(y2 - y1, x2 - x1), L = o.L || 2.4, s = 0.45;
    const p1 = [x2 - L * Math.cos(a - s), y2 - L * Math.sin(a - s)], p2 = [x2 - L * Math.cos(a + s), y2 - L * Math.sin(a + s)];
    return `<polygon points="${x2},${y2} ${p1[0].toFixed(2)},${p1[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}" fill="${o.c || "#000"}"/>`;
  };
  const arrow = (x1, y1, x2, y2, o = {}) => line(x1, y1, x2, y2, o) + arrowHead(x1, y1, x2, y2, o);
  const rect = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r || 0}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const circle = (cx, cy, r, o = {}) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const path = (d, o = {}) => `<path d="${d}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}" stroke-linejoin="round" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const poly = (pts, o = {}) => `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="${o.f || "none"}" stroke="${o.c || "#000"}" stroke-width="${o.w ?? 0.5}" stroke-linejoin="round"/>`;
  const emo = (x, y, e, size = 10) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${e}</text>`;
  // 記号のラベル(ア・イ…)と引き出し線
  const tag = (x, y, tx, ty, s, o = {}) => line(x, y, tx, ty, { w: 0.3 }) + `<circle cx="${x}" cy="${y}" r="0.6" fill="#000"/>`;
  const mark = (tx, ty, s, size = 3.8) => T(tx, ty + 1.3, s, size, { bold: true });
  // 色(白黒で印刷してもわかるように うすい色)
  const C = { sky: "#e8f4fb", leaf: "#d9efd2", sand: "#f3e6c8", water: "#d6ecf7", gray: "#e6e6e6", red: "#f6d4d0", yellow: "#fbf0c4", dark: "#9a9a9a" };

  // グラフ(方眼と目もり)。xs:[min,max,step], ys:[min,max,step]
  function graph({ x0 = 14, y0 = 6, w = 60, h = 40, xs, ys, xl = "", yl = "", lines = [], dots = true, xLab, yLab }) {
    const X = (v) => x0 + (v - xs[0]) / (xs[1] - xs[0]) * w, Y = (v) => y0 + h - (v - ys[0]) / (ys[1] - ys[0]) * h;
    let raw = "";
    const lab = [];
    for (let v = xs[0]; v <= xs[1] + 1e-9; v += xs[2]) {
      raw += line(X(v), y0, X(v), y0 + h, { w: 0.15, c: "#aaa" });
      lab.push(T(X(v), y0 + h + 4, xLab ? xLab(v) : +v.toFixed(2), 2.8));
    }
    for (let v = ys[0]; v <= ys[1] + 1e-9; v += ys[2]) {
      raw += line(x0, Y(v), x0 + w, Y(v), { w: 0.15, c: "#aaa" });
      lab.push(T(x0 - 1.5, Y(v) + 1, yLab ? yLab(v) : +v.toFixed(2), 2.8, { anchor: "end" }));
    }
    raw += line(x0, y0 + h, x0 + w + 2, y0 + h, { w: 0.5 }) + line(x0, y0 - 2, x0, y0 + h, { w: 0.5 });
    for (const L of lines) {
      const pts = L.pts.map(([a, b]) => [X(a), Y(b)]);
      raw += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ")}" fill="none" stroke="#000" stroke-width="${L.w || 0.6}"${L.dash ? ` stroke-dasharray="${L.dash}"` : ""}/>`;
      if (dots && L.dots !== false) for (const p of pts) raw += `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="0.8" fill="#000"/>`;
      if (L.label) lab.push(T(pts[pts.length - 1][0] + 1.5, pts[pts.length - 1][1] + 1, L.label, 3, { anchor: "start" }));
    }
    if (xl) lab.push(T(x0 + w + 1, y0 + h + 9, xl, 2.9, { anchor: "end" }));
    if (yl) lab.push(T(x0 - 1, y0 - 3, yl, 2.9, { anchor: "start" }));
    return { raw, lab, X, Y };
  }

  // 表の図
  const table = (head, rows) => ({ type: "table", head, rows });

  // ===== 学年のデータ =====
  // units: [id, 単元名, 分野, [topic, …]]   topic: [小単元名, 部品, 種類("w"|"f"|"d"), {weight}]
  const KIND = { w: ["word", "test", "practice"], f: ["figure", "test", "practice"], d: ["drill", "test", "practice"] };
  // テストの組み立て:100点になるように [問題数, 1問の点]。has は "w"・"f"・"d" の集まり
  function planOf(has) {
    const d = has.has("d"), w = has.has("w"), f = has.has("f");
    return d && w && f ? { drill: [6, 5], word: [6, 5], figure: [2, 20] } : d && w ? { drill: [10, 5], word: [5, 10] } : d && f ? { drill: [10, 5], figure: [2, 25] } : w && f ? { word: [8, 5], figure: [3, 20] } : d ? { drill: [10, 10] } : w ? { word: [10, 10] } : { figure: [4, 25] };
  }
  // あとから単元に小単元をくわえる(図の問題など)。テストの組み立ても作りなおす
  function addTopic(unit, label, generator, k) {
    const kindOf = (t) => (t.kinds[0] === "word" ? "w" : t.kinds[0] === "figure" ? "f" : "d");
    const before = new Set(unit.topics.map(kindOf));
    unit.topics.push({ label: noRuby(label), ...(noRuby(label) !== label ? { rubyLabel: label } : {}), generator, kinds: KIND[k] });
    if (k !== "f" || before.has("f")) return;
    // はじめての図の問題:テストでは図を1問(30点)にする(同じ形の図が何回も出ないように)
    unit.testPlan = before.has("d") ? { drill: [6, 5], word: [8, 5], figure: [1, 30] } : { word: [10, 7], figure: [1, 30] };
  }
  function grade(g, note, units) {
    return {
      grade: g,
      note,
      units: units.map(([id, name, domain, topics], i) => {
        const plan = planOf(new Set(topics.map((t) => t[2])));
        return {
          id, order: i + 1, name: noRuby(name), rubyName: name, domain: noRuby(domain),
          topics: topics.map(([label, generator, k, o = {}]) => ({ label: noRuby(label), ...(noRuby(label) !== label ? { rubyLabel: label } : {}), generator, kinds: KIND[k], ...o })),
          testPlan: plan
        };
      })
    };
  }
  // ===== イラストの図に、記号(ア・イ…)と引き出し線をつける =====
  // pts: [[x, y, "L" か "R", 記号], …](x, y はもとの画像の点)。W は絵のはば(mm)
  function labeled(name, W, pts, o = {}) {
    const [, iw, ih] = PIC_SRC[name] || ["", 100, 100];
    const k = W / iw, H = ih * k, top = 3;
    const hasL = pts.some((q) => q[2] === "L"), hasR = pts.some((q) => q[2] !== "L");
    const padL = hasL ? 13 : 2, padR = hasR ? 13 : 2;
    const items = [img(name, padL, top, W, H)];
    let raw = "";
    const lab = [];
    for (const side of ["L", "R"]) {
      const g = pts.filter((q) => (q[2] === "L") === (side === "L")).map((q) => ({ x: padL + q[0] * k, y: top + q[1] * k, s: q[3] })).sort((a, b) => a.y - b.y);
      // 記号どうしが 6.5mm 以上はなれるように、上から順にずらす
      let last = -99;
      for (const q of g) { q.ly = Math.max(q.y, last + 6.5, 4); last = q.ly; }
      const over = last - (top + H);
      if (over > 0) for (const q of g) q.ly -= over;
      for (const q of g) {
        const lx = side === "L" ? padL - 6 : padL + W + 6;
        const ex = side === "L" ? lx + 3 : lx - 3;
        raw += `<line x1="${q.x.toFixed(2)}" y1="${q.y.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${q.ly.toFixed(2)}" stroke="#fff" stroke-width="1.3"/>` + `<line x1="${q.x.toFixed(2)}" y1="${q.y.toFixed(2)}" x2="${ex.toFixed(2)}" y2="${q.ly.toFixed(2)}" stroke="#000" stroke-width="0.4"/>` + `<circle cx="${q.x.toFixed(2)}" cy="${q.y.toFixed(2)}" r="0.9" fill="#000" stroke="#fff" stroke-width="0.4"/>`;
        lab.push(T(lx, q.ly + 1.4, q.s, 4, { bold: true }));
      }
    }
    items.push({ t: "raw", svg: raw }, ...lab, ...(o.extra || []));
    return { type: "draw", w: padL + W + padR, h: H + top * 2, scaleK: o.k || 1.1, items };
  }
  // 絵をならべた図(じゅんばん・えらぶ問題)。names の下に ア・イ… をつける
  function picRow(names, size = 24, o = {}) {
    const gap = o.gap ?? 4, items = [];
    names.forEach((n, i) => {
      const x = 2 + i * (size + gap);
      items.push({ t: "raw", svg: `<rect x="${x}" y="2" width="${size}" height="${size}" rx="2.5" fill="#fff" stroke="#9cc" stroke-width="0.35"/>` }, img(n, x + 1.2, 3.2, size - 2.4, size - 2.4));
      if (o.letters !== false) items.push(T(x + size / 2, size + 8.2, LET[i], 4, { bold: true }));
    });
    return { type: "draw", w: 4 + names.length * (size + gap) - gap, h: size + (o.letters === false ? 4 : 11), scaleK: o.k || 1.1, items };
  }
  // ===== 練習プリントの組み立て(ほかの理科プリントにならって:図 → ことば → ○× → えらぶ → 計算 → 記述) =====
  // 1まいに 答えが12〜15こ入るように、形ごとの問題数を決める
  function practicePlan(level, kids) {
    const L = level === "basic" ? 0 : level === "normal" ? 1 : 2;
    return [
      { from: "figure", n: 1, inst: null },
      { from: "word", only: "bank", n: 1, inst: kids ? "あう ことばを、したの 〔　〕から えらんで かきましょう。" : L === 2 ? "（ ）にあてはまることばを書きましょう。" : "あてはまることばを、下の〔　〕からえらんで書きましょう。" },
      { from: "word", only: "tf", n: kids ? 2 : 4, inst: kids ? "ただしい ものには ○、まちがって いる ものには ×を かきましょう。" : "正しいものには○、まちがっているものには×を書きましょう。" },
      { from: "word", only: "tfl", n: kids ? 0 : 1, inst: null },
      { from: "word", only: "pick", n: kids ? 2 : 3, inst: kids ? "つぎの もんだいに こたえましょう。" : L === 2 ? "次の問いに、ことばで答えましょう。" : "次の問いに、記号で答えましょう。" },
      { from: "drill", n: 2, inst: "次の問いに答えましょう。" },
      { from: "word", only: L === 0 ? "word" : "why", n: 1, inst: kids ? "つぎの もんだいに こたえましょう。" : "次の問いに答えましょう。" }
    ];
  }
  // ===== 一問一答(ドリル):短い問いと答えの組から1問ずつ出す =====
  // pairs: [[問い, 答え, むずかしさ], …] か、rng を受けとって [問い, 答え] を返す関数
  function quiz(id, pairs, o = {}) {
    const list = typeof pairs === "string" ? parse(pairs).map((x) => [x.q, x.a, x.lv]) : pairs;
    return {
      id,
      instruction: o.inst || "次の問いに答えましょう。",
      defaults: { max: 1 },
      levels: LV,
      generate(rng, p, ctx) {
        const idx = ctx && Number.isInteger(ctx.index) ? ctx.index : 0;
        // その難易度の問題を使いきったら、ほかの難易度の問題も出す。全部使いきったら同じ問題もゆるす
        let pool = list.filter((x) => (x[2] || 1) <= (p.max || 1));
        if (idx >= pool.length) pool = list;
        const round = Math.floor(idx / list.length);
        const [q, a] = rng.pick(pool);
        return { key: `${id}:${noRuby(q)}#${round}`, text: q, wide: true, answer: { display: a }, workspace: { type: "none" }, work: 0, plainBox: true, meta: {} };
      }
    };
  }
  return { quiz, addTopic, planOf, practicePlan, PIC_SRC, picSrc, img, picHtml, labeled, picRow, LET, LV, noRuby, parse, bank, figs, calc, grade, T, fig, line, arrow, arrowHead, rect, circle, path, poly, emo, tag, mark, C, graph, table, svgEsc, rnd };
})();
