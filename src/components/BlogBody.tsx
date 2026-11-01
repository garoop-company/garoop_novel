import { Fragment, type ReactNode } from 'react';

type Source = { url: string; title: string; publisher?: string; note?: string };

type Block =
    | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string }
    | { type: 'ul'; items: string[] }
    | { type: 'source'; sources: Source[] };

const LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

/**
 * 「出典：媒体名「[題名](URL)」（日付）」の行を出典カードにする。
 * 1行に複数のリンクがあれば、リンクごとにカードを作る。
 */
function parseSource(text: string): Source[] | null {
    const body = text.replace(/^出典[:：]\s*/, '');
    if (body === text) return null;
    const links = [...body.matchAll(LINK)];
    if (links.length === 0) return null;
    return links.map((m, i) => {
        const before = body.slice(i === 0 ? 0 : (links[i - 1].index ?? 0) + links[i - 1][0].length, m.index);
        const after = body.slice((m.index ?? 0) + m[0].length, links[i + 1]?.index ?? body.length);
        const publisher = before.replace(/[「『]\s*$/, '').replace(/^[」』、・\s]+/, '').trim() || undefined;
        const note = after.replace(/^[」』]/, '').match(/[（(]([^）)]+)[）)]/)?.[1];
        return { url: m[2], title: m[1], publisher, note };
    });
}

function parseBlocks(md: string): Block[] {
    return md
        .trim()
        .split(/\n\s*\n/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .map((chunk): Block => {
            if (chunk.startsWith('### ')) return { type: 'h3', text: chunk.slice(4).trim() };
            if (chunk.startsWith('## ')) return { type: 'h2', text: chunk.slice(3).trim() };
            const lines = chunk.split('\n');
            if (lines.every((l) => l.startsWith('- '))) return { type: 'ul', items: lines.map((l) => l.slice(2).trim()) };
            const isQuote = lines.every((l) => l.startsWith('>'));
            const text = isQuote ? lines.map((l) => l.replace(/^>\s?/, '')).join('\n') : chunk;
            const sources = parseSource(text);
            if (sources) return { type: 'source', sources };
            return isQuote ? { type: 'quote', text } : { type: 'p', text };
        });
}

/** **強調** と [リンク](URL) と改行だけを React 要素にする（HTML は解釈しない）。 */
function renderInline(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let last = 0;
    let key = 0;
    const pushText = (s: string) => {
        s.split('\n').forEach((line, i) => {
            if (i > 0) nodes.push(<br key={`br-${key++}`} />);
            if (line) nodes.push(<Fragment key={`t-${key++}`}>{line}</Fragment>);
        });
    };
    for (const m of text.matchAll(pattern)) {
        pushText(text.slice(last, m.index));
        if (m[1]) {
            nodes.push(<strong key={`s-${key++}`}>{m[1]}</strong>);
        } else {
            nodes.push(
                <a key={`a-${key++}`} href={m[3]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {m[2]}
                </a>,
            );
        }
        last = (m.index ?? 0) + m[0].length;
    }
    pushText(text.slice(last));
    return nodes;
}

/** "https://www.example.co.jp/a/b" → "example.co.jp" */
function hostOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export type BlogBodyClassNames = {
    h2: string;
    h3: string;
    p: string;
    ul: string;
    quote: string;
    /** 出典カードのまとまり（「出典」の見出しとカード） */
    source: string;
    sourceLabel: string;
    card: string;
    cardIcon: string;
    cardSite: string;
    cardTitle: string;
};

export default function BlogBody({ body, classNames }: { body: string; classNames: BlogBodyClassNames }) {
    return (
        <>
            {parseBlocks(body).map((block, i) => {
                switch (block.type) {
                    case 'h2':
                        return <h2 key={i} className={classNames.h2}>{renderInline(block.text)}</h2>;
                    case 'h3':
                        return <h3 key={i} className={classNames.h3}>{renderInline(block.text)}</h3>;
                    case 'ul':
                        return (
                            <ul key={i} className={classNames.ul}>
                                {block.items.map((item, j) => (
                                    <li key={j}>{renderInline(item)}</li>
                                ))}
                            </ul>
                        );
                    case 'quote':
                        return <blockquote key={i} className={classNames.quote}>{renderInline(block.text)}</blockquote>;
                    case 'source':
                        return (
                            <aside key={i} className={classNames.source} aria-label="出典">
                                <span className={classNames.sourceLabel}>出典</span>
                                {block.sources.map((s) => (
                                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className={classNames.card}>
                                        <span className={classNames.cardIcon} aria-hidden="true">↗</span>
                                        <span className="min-w-0 flex-1">
                                            <span className={classNames.cardSite}>
                                                {[s.publisher, hostOf(s.url), s.note].filter(Boolean).join(' · ')}
                                            </span>
                                            <span className={classNames.cardTitle}>{s.title}</span>
                                        </span>
                                    </a>
                                ))}
                            </aside>
                        );
                    default:
                        return <p key={i} className={classNames.p}>{renderInline(block.text)}</p>;
                }
            })}
        </>
    );
}
