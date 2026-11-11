# 引き継ぎメモ(ほかの会話で続きをするとき)

この会話をはじめたら、まずこのファイルを読んでください。作っている人は 落合聡一(小学校・特別支援学校の先生)。返事はやさしい日本語で、短めに。

## 1. これは何か
- 1ファイルで動く社会プリントのアプリ「社会プリント」(第1版 2026-11-11)。理科プリント(iamochiai-collab/Science-worksheet-generator)をもとに作った
- GitHub: `iamochiai-collab/Social-worksheet-generator`(予定。main の `/docs` を Pages で公開)
- ポータル「メガネプリント教材庫」(iamochiai-collab/megane-print)の 社会 からリンクする予定

## 2. しくみ
- 問題は `content/*.js` にふつうの日本語で書く → `node tools/rika/annotate.js` で ふりがなをつけて `src/generators/<名前>/part1.js` へ → `python3 tools/build.py`
  - ファイル名の順に読みこむので、`r0lib`(RK) → `s00map`(地図データ) → `s0lib2`(SD) → 各学年 の順になるように名前をつける
  - `content/r0lib.js` … `RK`(bank・figs・calc・quiz・grade・図の道具)。理科のものに社会用の「○でかこむ」問題と `RK.quiz`(一問一答)を足した
  - `content/s0lib2.js` … `SD`。地図記号(`sym`・`symRow`)、8方位(`compass`)、日本地図(`jpMap`・`regionMap`)、世界地図(`worldMap`)、雨温図(`climates`)、グラフ(`barH`・`lineYears`)、三権分立(`sanken`)、需要と供給、人口ピラミッド、町の地図(`townMap`)、等高線
  - `src/generators/s00map/part1.js` … `tools/shakai/makemap.js` が作る地図データ(手で直さない。annotate もしない)
  - 学年: 1・2 = さきどり社会(`s1saki.js`、id は e1・e2)、3〜6 = 小学校(`s3`〜`s6`、e3〜e6)、7 = 中学 地理(`sct`、ct)、8 = 中学 歴史(`srk`、rk)、9 = 中学 公民(`skm`、km)、21〜27 = 特別支援の段階(`szstage.js`)
  - 年表のできごと `HIST` は `s6.js`(中学歴史でも使う)
- 問題の書き方(bank): 1行1問 `むずかしさ|問い|答え`
  - `（　　　）` は答えの四角、`=正しい|ちがう|…` はえらぶ、`>1番目|2番目|…` はならべる
  - `2|〜（　　　）〜（　　　）〜|答え1|答え2|-まぎらわしいことば` は〔ことば〕からえらぶ穴うめ
  - `1|?文|○` は○×、`2|!指示文|もの=○|もの=×|…` はいくつかに○×
  - `2|@〜［正しい*・ちがう］〜。|` は正しいほうを○でかこむ(* が正しいほう。答えの四角はつけない)
- 図の中のことばは `T(x, y, ことば)` で書く(SVG に日本語を直接書かない)。名前で引く表(SYM・CLIMATE・地図の国名)は、ふりがなつきの名前でも引けるように noRuby している
- 読みのまちがい(人名・地名)は `tools/rika/yomi.txt` に `ことば={漢字|かな}` で足す。`tools/rika/yomi-report.txt` に読みの一覧が出る
- template.html の社会用の変更は `tools/shakai/patch_template.py` にまとめてある

## 3. 検査(変えたら必ず)
```sh
node tools/rika/annotate.js && python3 tools/build.py
node tools/rika/check.js build/test.html 150          # problems 0
node tools/test/layout.js docs/index.html 結果.json 1,2,3,4,5   # fails 0・overflow 0
node tools/test/layout.js docs/index.html 結果.json 6,7,8,9
node tools/test/layout.js docs/index.html 結果.json 21,22,23,24,25,26,27
node tools/test/firstopen.js docs/index.html
```

## 4. 先生の希望(算数・理科プリントと同じ)
- 1ページの形はすらすらぷりんと風。問題は少なめ・大きめ
- ほかの無料プリント(ちびむすドリル・すたぺんドリル・いちごドリル など)の形をまねる。1・2年はちびむす「さきどり社会」の形
- 特別支援: 段階名をプリントに書かない
- 前の版は消さない(大きく変えるときはブランチで保存)

## 5. まだやっていないこと(案)
- (済)キャラクターは社会用(黄色・頭に地球儀・胸に地球のマーク)。ChatGPT で作った6まい(guide・banzai・cheer・maru・think・idea)
- 教科書会社ごとの単元の順(メニューの「教科書の順」。`PUB_ORDER` を作れば出る)
- 歴史の資料(人物の絵・文化財の写真)、地形図の読み取りの問題をふやす
