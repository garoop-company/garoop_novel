import { Fragment, type ReactNode } from 'react';

type Block =
    | { type: 'h2' | 'h3' | 'p' | 'quote'; text: string }
    | { type: 'ul'; items: string[] };

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
            if (lines.every((l) => l.startsWith('>'))) {
                return { type: 'quote', text: lines.map((l) => l.replace(/^>\s?/, '')).join('\n') };
            }
            return { type: 'p', text: chunk };
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

export type BlogBodyClassNames = {
    h2: string;
    h3: string;
    p: string;
    ul: string;
    quote: string;
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
                    default:
                        return <p key={i} className={classNames.p}>{renderInline(block.text)}</p>;
                }
            })}
        </>
    );
}
