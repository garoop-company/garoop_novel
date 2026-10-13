# PWA と Google Play（TWA）

Garoop Novel（https://novel.garoop.jp）をホーム画面に追加できるようにし（PWA）、
同じサイトを Android アプリとして Google Play で配る（TWA: Trusted Web Activity）ための手順。

TWA はサイトを Chrome で全画面表示するだけの薄いアプリなので、
**画面や機能を直すときは Web 側をデプロイするだけでよい**。
Android 側を作り直すのは、名前・アイコン・色・パッケージの設定を変えるときと、
Play の要件（targetSdk など）が上がったときだけ。

---

## 1. 構成

| 項目 | 置き場所 |
|---|---|
| Web App Manifest | `src/app/manifest.ts`（`/manifest.webmanifest` として配信） |
| Service Worker | `public/sw.js`（登録は `src/components/RegisterServiceWorker.tsx`、本番のみ） |
| オフライン画面 | `public/offline.html` |
| アイコン | `public/icon-192.*`、`icon-512.*`、`icon-maskable-512.*`（元絵は `src/app/icon.png`） |
| Digital Asset Links | `public/.well-known/assetlinks.json` |
| Android プロジェクト | `twa/`（bubblewrap 形式。garoop-pay の `twa/` を元に作成） |
| 署名鍵 | `twa/android.keystore`（**gitignore**、alias `android`、RSA 2048、有効期限 10000 日） |
| 鍵のパスワード | `twa/keystore.properties`（**gitignore**） |

| アプリの設定 | 値 |
|---|---|
| パッケージ名 | `jp.garoop.novel.twa`（**Play に出したら変えられない**） |
| 対象ホスト | `novel.garoop.jp` |
| 表示名 | Garoop Novel |
| 最小 SDK / target SDK | 21 / 36 |
| テーマ色 / 背景色 | `#0a0807` / `#07080c`（サイトのヘッダーと背景に合わせた） |
| アップロード鍵の SHA-256 | `11:5D:D2:A5:24:96:01:A7:BB:83:F5:96:AB:99:7E:D1:F8:4A:D1:3C:45:69:15:CB:93:45:A2:22:80:9F:6D:53` |

### Service Worker の方針

next-pwa（workbox）は使わず、手書きの `public/sw.js` にしている。

- `next-pwa` は Next.js 16 / App Router での保守が止まっており、ビルド時に public へ生成物を書き出す。
  ロケールの rewrite（`src/middleware.ts`）とプリキャッシュの URL がずれると、古い画面が出続ける事故になりやすい。
- このサイトのデータは外部（api.garoop.jp など）から取っており、溜めてよいものがほとんど無い。

やっていること:

- `/_next/static/` とアイコンはキャッシュ優先（ファイル名がビルドごとに変わる / 変わらない）
- 画面の HTML はネットワーク優先。圏外なら一度見たページの控え、無ければ `offline.html`
- `/api/`、他オリジン、RSC、`Authorization` 付き、`/sso`・`/loginCallBack` などの認証画面、
  `token` / `code` / `state` を含む URL は**一切キャッシュしない**
- `sw.js` は `Cache-Control: no-cache` で配る（`next.config.mjs`）

`sw.js` の中身を変えたら、先頭の `VERSION` を上げること。古いキャッシュは自動で消える。

### middleware との関係

`src/middleware.ts` の matcher は拡張子付きのパス（`.*\..*`）を除外しているので、
`/manifest.webmanifest`、`/sw.js`、`/offline.html`、`/.well-known/assetlinks.json`、アイコンは
ロケール rewrite されない。matcher を変えるときはこれらが 200 のままか確認すること。

---

## 2. ビルド

JDK と Android SDK は bubblewrap が入れたものを使う（`~/.bubblewrap/config.json` 参照）。

```sh
cd twa
export JAVA_HOME="$HOME/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home"
export ANDROID_HOME="$HOME/.bubblewrap/android_sdk"
./gradlew bundleRelease     # Play に出す AAB
./gradlew assembleRelease   # 実機に直接入れる APK
```

成果物:

- `twa/app/build/outputs/bundle/release/app-release.aab`
- `twa/app/build/outputs/apk/release/app-release.apk`

`twa/local.properties`（`sdk.dir=...`）と `twa/keystore.properties` は手元にしか無い（gitignore）。
別の Mac や CI でビルドするときは作り直す。

```properties
# twa/keystore.properties
storeFile=../android.keystore
storePassword=...
keyAlias=android
keyPassword=...
```

実機確認: `adb install -r twa/app/build/outputs/apk/release/app-release.apk`

---

## 3. バージョンの上げ方

Play は同じ `versionCode` を二度受け付けない。出すたびに上げる。

```sh
./gradlew bundleRelease -PversionCode=2 -PversionName=1.0.1
```

指定しないと `versionCode 1` / `versionName 1.0.0`（`twa/app/build.gradle` の既定値）になる。
既定値を上げたいときは `twa/app/build.gradle` と `twa/twa-manifest.json` の
`appVersionCode` / `appVersionName` をそろえて直す。

`bubblewrap update` で作り直すと `app/build.gradle` のコメントや
`keystore.properties` 読み込みが消えることがある。差分を見てから commit すること。

---

## 4. assetlinks.json の更新

TWA は、サイトの `https://novel.garoop.jp/.well-known/assetlinks.json` に
**アプリを署名した鍵の SHA-256** が載っていないと、アドレスバー付きの Custom Tab として開く
（アプリとしては動くが、ブラウザのバーが出たままになる）。

いま入っているのはアップロード鍵（`twa/android.keystore`）の指紋だけ。

### Play App Signing を使う場合（新規アプリでは必須）

Play は配布時に**Google 側の鍵で署名し直す**。そのため、利用者の端末に届くアプリの指紋は
アップロード鍵とは別物になる。

1. Play Console →「テストとリリース」→「設定」→「アプリの完全性」→「アプリ署名」
2. 「アプリ署名鍵の証明書」の SHA-256 をコピー
3. `public/.well-known/assetlinks.json` の `sha256_cert_fingerprints` に**追加**する
   （アップロード鍵の指紋は消さない。手元で作った APK の確認に使う）
4. Web をデプロイし、`https://novel.garoop.jp/.well-known/assetlinks.json` が
   `Content-Type: application/json` の 200 で返ることを確認する

```json
"sha256_cert_fingerprints": [
  "11:5D:D2:A5:24:96:01:A7:BB:83:F5:96:AB:99:7E:D1:F8:4A:D1:3C:45:69:15:CB:93:45:A2:22:80:9F:6D:53",
  "<Play のアプリ署名鍵の SHA-256>"
]
```

Play Console の同じ画面に、そのまま貼れる assetlinks.json の例も出ている。

確認: https://developers.google.com/digital-asset-links/tools/generator で
`novel.garoop.jp` / `jp.garoop.novel.twa` / 指紋を入れて照合できる。

鍵の指紋を手元で見る:

```sh
"$HOME/.bubblewrap/jdk/jdk-17.0.11+9/Contents/Home/bin/keytool" \
  -list -v -keystore twa/android.keystore -alias android | grep SHA256
```

---

## 5. 署名鍵の扱い

- **`twa/android.keystore` とパスワードを失うと、同じアプリとして更新を出せなくなる**
  （Play App Signing なら、アップロード鍵のリセットを Play に依頼できるが日数がかかる）。
  この Mac の外（パスワードマネージャーなど）に必ず退避すること。
- 鍵・パスワード・ビルド成果物は `.gitignore` で除外してある。`git add -f` しないこと。
- 漏れた疑いがあるときは、Play Console でアップロード鍵のリセットを依頼する。

---

## 6. Play Console 提出時の注意

1. **先に Web をデプロイする**。`/.well-known/assetlinks.json`、`/manifest.webmanifest`、
   `/sw.js`、`/privacy`、`/terms` が本番で 200 になっている必要がある。
2. Play Console でアプリを作成（パッケージ名 `jp.garoop.novel.twa`）。
3. 内部テストトラックに AAB を上げる → Play App Signing の鍵の指紋を assetlinks.json に追加してデプロイ（4 章）。
4. 内部テストで入れた実機で、**アドレスバーが出ないこと**を確認してから本番トラックへ。
5. 掲載情報で必要なもの:
   - アプリアイコン 512×512: `twa/store_icon.png`
   - フィーチャーグラフィック 1024×500、スクリーンショット（未作成）
   - プライバシーポリシー URL: `https://novel.garoop.jp/privacy`
6. 申告で注意する点（実装を見て判断すること）:
   - **広告**: 広告は載せていない（AdSense は外した）。「広告を含む」は「いいえ」にする
   - **データ セーフティ**: Google Analytics（GA4）、ログイン（Google / LINE / メール）、
     reCAPTCHA、赤ちゃんとのチャット送信がある。収集データとして申告が要る
   - **対象年齢**: 子ども向け（13 歳未満を含む）と申告するとファミリー ポリシーが適用され、
     GA の扱いが厳しくなる。対象年齢は慎重に決めること
   - **アカウント削除**: ログイン機能があるので、アカウント削除の手段（URL）の申告が必要
   - **アプリ アクセス**: ログインしないと使えない機能がある場合は、審査用アカウントを用意する
7. TWA は「Web サイトをそのまま包んだだけ」と見なされると審査で落ちることがある
   （最低限の機能・オフライン時の表示が求められる。`offline.html` はそのため）。
