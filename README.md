# Garoop Novel

ガルちゃん（シングルマザーのカンガルー）を主人公にした連載小説サイトです。

## ローカル起動

```bash
npm ci
npm run dev
```

## データ構造

小説メタデータは `src/data/novels.json`、本文は `src/data/chapters/*.json` で管理します。

`novels.json` の主なフィールド:

- `id`: エピソードID（例: `garu-detective-001`）
- `seriesKey`: シリーズ識別子
- `episodeNumber`: 話数
- `title`: タイトル
- `description`: 概要
- `category`: シリーズ名
- `chapterFile`: 本文ファイル名（例: `garu-detective-001.ja.json`）
- `pageCount`: ページ数
- `animationPreset`: 小説詳細ページのアニメーション種別
- `keywords`: カンマ区切りキーワード
- `lang`: 言語（`ja`, `en`, `zh`, `fr`, `id`, `it`, `ne`）
- `createdAt`: 生成日（JST）

## GitHub Actions + Groq API で毎日自動生成

毎日、以下5シリーズの次話を多言語で自動生成して
`src/data/novels.json` と `src/data/chapters/*.json` を更新します。

- ガルちゃん探偵
- インテリジェンスガルちゃん
- 10歳起業家カンガルーガルちゃん
- 生成AIとカンガルーガルちゃん
- 子作りを布教するガルちゃん（家族づくり・子育て支援の社会文脈で健全に表現）

ワークフロー: `.github/workflows/daily-garu-novels.yml`  
生成スクリプト: `scripts/generate-daily-novels.mjs`

### 必要な設定

1. GitHub Repository Secrets に `GROQ_API_KEY` を追加
2. 任意で Repository Variables に `GROQ_MODEL` を追加
   - 未設定時は `llama-3.3-70b-versatile` を使用
3. 任意で Repository Variables に `GROQ_TARGET_LANGS` を追加
   - 例: `ja,en,zh,fr,id,it,ne`
   - 未設定時は `ja,en,zh,fr,id,it,ne` を使用

### 実行タイミング

- `schedule`: 毎日 `21:00 UTC`（日本時間 翌 `06:00`）
- `workflow_dispatch`: 手動実行可能

このワークフローは Groq API を使って、Actions内で
章ごとのファイルを追加・更新します。

## 手動実行

GitHubの `Actions` タブから `Groq Daily Garu Novel` を選び、`Run workflow` を実行してください。
`target_date` を指定すると、その日付で `createdAt` を揃えた生成運用ができます。

## プロンプト管理

システムプロンプトは `prompts/garu-system-prompt.txt` に集約しています。
主人公設定（シングルマザーのカンガルー・ガルちゃん）と出力ルールはここで固定しています。
