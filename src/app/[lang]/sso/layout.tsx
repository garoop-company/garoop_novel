import type { Metadata } from 'next';

// ログインの受け渡し用の画面。検索結果に出す中身は無いので noindex にする。
// （robots.txt で塞ぐと noindex が読まれないので、塞がずにここで指定する）
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
