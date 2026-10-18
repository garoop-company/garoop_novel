import Link from 'next/link';

type PagerLabels = { nav: string; prev: string; next: string; page: string };

/** ページ番号の並び（多いときは … で省略）。1 と最後は常に出す */
function pageItems(current: number, total: number): (number | 'gap')[] {
  const set = new Set([1, total, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('gap');
    out.push(n);
  });
  return out;
}

const BTN =
  'min-w-11 h-11 px-2 inline-grid place-items-center rounded-full font-serif text-sm border transition-colors';

/**
 * 子ども向けの文字の少ないページ送り（◀ ▶ と数字だけ）。文言は aria-label のみ。
 * サーバーコンポーネントなのでクライアント JS は増えない。
 */
export default function Pager({
  current,
  total,
  hrefFor,
  labels,
}: {
  current: number;
  total: number;
  hrefFor: (page: number) => string;
  labels: PagerLabels;
}) {
  if (total <= 1) return null;
  const pageLabel = (n: number) => labels.page.replace('{n}', String(n));

  return (
    <nav aria-label={labels.nav} className="mt-4 mb-12 flex justify-center" data-testid="pager">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {current > 1 ? (
            <Link
              href={hrefFor(current - 1)}
              aria-label={labels.prev}
              title={labels.prev}
              rel="prev"
              className={`${BTN} border-amber-200/30 text-amber-100 bg-stone-900/50 hover:bg-stone-900/80`}
            >
              <span aria-hidden>◀</span>
            </Link>
          ) : (
            <span aria-hidden className={`${BTN} border-amber-200/10 text-amber-100/25`}>◀</span>
          )}
        </li>
        {pageItems(current, total).map((item, i) =>
          item === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-amber-200/50">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-label={pageLabel(item)}
                aria-current={item === current ? 'page' : undefined}
                className={`${BTN} ${
                  item === current
                    ? 'bg-amber-300 text-stone-900 border-amber-200 font-bold'
                    : 'border-amber-200/20 text-amber-50/85 bg-stone-900/40 hover:bg-stone-900/70'
                }`}
              >
                {item}
              </Link>
            </li>
          )
        )}
        <li>
          {current < total ? (
            <Link
              href={hrefFor(current + 1)}
              aria-label={labels.next}
              title={labels.next}
              rel="next"
              className={`${BTN} border-amber-200/30 text-amber-100 bg-stone-900/50 hover:bg-stone-900/80`}
            >
              <span aria-hidden>▶</span>
            </Link>
          ) : (
            <span aria-hidden className={`${BTN} border-amber-200/10 text-amber-100/25`}>▶</span>
          )}
        </li>
      </ul>
    </nav>
  );
}
