/**
 * アカウント削除ページ（/account/delete）の文面。
 *
 * Google Play の「アカウント削除の URL」に登録するページ。アプリを入れていない人がブラウザで開いても読めること。
 * 消えるもの・残るものは kids_api の query/delete_account.go と graph/account.graphqls に合わせている
 * （garoop-pay・garoop_integration の /account/delete と同じ内容）。削除処理を変えたらここもそろえる。
 *
 * 日本語版と英語版だけ持つ。ほかの言語（zh/fr/id/it/ne）では英語版を出す。
 */

export type AccountDeleteCopy = {
  title: string;
  lead: string;
  sharedTitle: string;
  shared: string;
  stepsTitle: string;
  steps: string[];
  erasedTitle: string;
  erased: string[];
  keptTitle: string;
  kept: string[];
  keptNote: string;
  timingTitle: string;
  timing: string;
  contactTitle: string;
  contact: string;
  // 削除フォーム
  formTitle: string;
  loginFirst: string;
  login: string;
  signedInAs: string;
  confirmLabel: string;
  confirmHint: string;
  passcodeLabel: string;
  passcodeHint: string;
  agree: string;
  submit: string;
  deleting: string;
  done: string;
  doneBody: string;
  errors: Record<string, string>;
};

const EMAIL = "garoop.company@gmail.com";

export const ACCOUNT_DELETE: Record<"ja" | "en", AccountDeleteCopy> = {
  ja: {
    title: "アカウントの削除",
    lead: "Garoop Novel（https://novel.garoop.jp ・Android アプリ jp.garoop.novel.twa）で使っている Garoop アカウントと、それに紐づくデータの削除について説明します。削除は取り消せません。",
    sharedTitle: "Garoop の全アプリから消えます",
    shared:
      "Garoop のアプリ（Studio・Land・Baby・Novel・TV・鍛校・Pay）は、ひとつの Garoop 共通アカウントを使っています。ここで削除すると、すべてのアプリでそのアカウントが使えなくなり、各アプリのデータもまとめて消えます。",
    stepsTitle: "削除のしかた",
    steps: [
      "1. このページで、削除したいアカウントでログインします。",
      "2. 下の欄に、確認の語「DELETE」を入力します。",
      "3. Garoop Pay でおさいふを作っている場合は、保護者の合言葉も入力します。",
      "4. 「完全に削除する」を押すと、その場で削除されます。",
    ],
    erasedTitle: "消えるもの",
    erased: [
      "・プロフィール（名前、アイコン、メールアドレス、パスワード）",
      "・ログイン連携（Google / X / LINE などとの接続とトークン）",
      "・ガルの残高と、増減のすべての記録、ショップで交換した品",
      "・学習やミッションの記録、作品・小説などの提出物、投稿したコメント",
      "・Garoop Baby の赤ちゃんと、その記録",
      "・Garoop Pay のおさいふ、おてつだい、上限の設定、合言葉、こまったときの通報",
    ],
    keptTitle: "残るもの",
    kept: ["・有料プランの申込と、決済の記録"],
    keptNote:
      "実際にお金が動いた記録であり、会計と税務の裏付けとして必要なため残します。このときアカウントは匿名化されており、どなたのものかを割り出すことはできません。",
    timingTitle: "いつ消えるか",
    timing: "その場で消えます。削除を待つ期間はありません。バックアップに残ったぶんは、最大 30 日で入れ替わって消えます。",
    contactTitle: "ここから削除できないとき",
    contact: `ログインできない、合言葉を忘れたなどでここから削除できないときは、${EMAIL} までご連絡ください。ご本人の確認をしたうえで、こちらで削除します。`,
    formTitle: "アカウントを削除する",
    loginFirst: "削除するには、削除したいアカウントでログインしてください。",
    login: "ログイン",
    signedInAs: "ログイン中のアカウント: {name}",
    confirmLabel: "確認の語",
    confirmHint: "半角大文字で「DELETE」と入力してください。",
    passcodeLabel: "保護者の合言葉（Garoop Pay を使っている場合）",
    passcodeHint: "おさいふを作っていなければ空のままで大丈夫です。",
    agree: "Garoop の全アプリからアカウントとデータが消え、元に戻せないことを理解しました。",
    submit: "完全に削除する",
    deleting: "削除しています…",
    done: "アカウントを削除しました",
    doneBody: "ご利用ありがとうございました。Garoop の全アプリでログアウトされています。",
    errors: {
      unauthenticated: "ログインが切れています。もう一度ログインしてからお試しください。",
      confirmation_mismatch: "確認の語がちがいます。「DELETE」と入力してください。",
      passcode_required: "Garoop Pay のおさいふがあるため、保護者の合言葉が必要です。",
      passcode_mismatch: "保護者の合言葉がちがいます。",
      passcode_locked: "合言葉の入力に何度も失敗したため、しばらく削除できません。時間をおいてお試しください。",
      not_found: "アカウントが見つかりませんでした。",
      network: "通信できませんでした。電波の良いところでもう一度お試しください。",
      backend_error: `削除できませんでした。時間をおいてお試しいただくか、${EMAIL} までご連絡ください。`,
    },
  },
  en: {
    title: "Deleting your account",
    lead: "This page explains how to delete the Garoop account you use in Garoop Novel (https://novel.garoop.jp and the Android app jp.garoop.novel.twa) and the data linked to it. Deletion cannot be undone.",
    sharedTitle: "It is removed from every Garoop app",
    shared:
      "Garoop's apps (Studio, Land, Baby, Novel, TV, Training School and Pay) share one Garoop account. Deleting it here means it can no longer be used in any of them, and the data in every app is deleted together.",
    stepsTitle: "How to delete",
    steps: [
      "1. Log in on this page with the account you want to delete.",
      "2. Type the confirmation word “DELETE” in the form below.",
      "3. If you set up a wallet in Garoop Pay, also enter the parent passcode.",
      "4. Press “Delete permanently”. It happens immediately.",
    ],
    erasedTitle: "What is erased",
    erased: [
      "・Profile (name, icon, email address, password)",
      "・Sign-in connections (the link to Google / X / LINE etc. and its tokens)",
      "・The garu balance, every record of it changing, and items exchanged in the shop",
      "・Learning and mission records, submitted works and novels, and comments posted",
      "・Your babies in Garoop Baby and their records",
      "・The Garoop Pay wallet, chores, limit settings, passcodes and trouble reports",
    ],
    keptTitle: "What is kept",
    kept: ["・Paid-plan applications and payment records"],
    keptNote:
      "These record payments that actually took place and are needed as accounting and tax evidence. By then the account has been anonymised, so they cannot be traced to a person.",
    timingTitle: "When it happens",
    timing: "Immediately. There is no waiting period. Copies in backups are rotated out within 30 days at most.",
    contactTitle: "If you cannot delete it here",
    contact: `If you cannot delete it here — for example you cannot log in or forgot the passcode — please contact ${EMAIL}. We will verify who you are and delete it for you.`,
    formTitle: "Delete your account",
    loginFirst: "To delete, please log in with the account you want to delete.",
    login: "Log in",
    signedInAs: "Logged in as: {name}",
    confirmLabel: "Confirmation word",
    confirmHint: "Type “DELETE” in capital letters.",
    passcodeLabel: "Parent passcode (if you use Garoop Pay)",
    passcodeHint: "Leave this empty if you have not set up a wallet.",
    agree: "I understand that my account and data will be removed from every Garoop app and cannot be restored.",
    submit: "Delete permanently",
    deleting: "Deleting…",
    done: "Your account has been deleted",
    doneBody: "Thank you for using Garoop. You have been logged out of every Garoop app.",
    errors: {
      unauthenticated: "Your login has expired. Please log in again and retry.",
      confirmation_mismatch: "The confirmation word is wrong. Please type “DELETE”.",
      passcode_required: "This account has a Garoop Pay wallet, so the parent passcode is required.",
      passcode_mismatch: "The parent passcode is wrong.",
      passcode_locked: "Too many wrong passcodes. Please wait a while and try again.",
      not_found: "The account was not found.",
      network: "We could not connect. Please try again where you have a good connection.",
      backend_error: `We could not delete it. Please try again later or contact ${EMAIL}.`,
    },
  },
};
