import { SITE_URL } from '@/lib/seo';
import { PREFECTURES, Prefecture, findPrefecture, prefecturesInRegion } from './prefectures';
import { City, citiesInPrefecture } from './cities';

/**
 * 地域別ページ（/area, /area/[pref]）の文面と構造化データ。
 * サービスについては、トップページ・運営者情報・各ページの説明に書いてある事実だけを使う。
 */

export const SERVICE_NAME = 'Garoop Novel';
export const SERVICE_KEYWORD = 'AI小説';

export const AREA_INDEX_PATH = '/area';
export const areaPath = (slug: string) => `/area/${slug}`;
export const areaUrl = (slug?: string) => `${SITE_URL}${slug ? areaPath(slug) : AREA_INDEX_PATH}`;
export const cityPath = (c: City) => `/area/${c.pref}/${c.slug}`;
export const cityUrl = (c: City) => `${SITE_URL}${cityPath(c)}`;

/** 「・」でつないだ主な市 */
export const joinCities = (p: Prefecture) => p.cities.join('・');

export type Faq = { q: string; a: string };

export const SERVICE_FEATURES: { title: string; body: string }[] = [
    {
        title: '生成AIが綴る小説を読める',
        body: 'Garoop Novelは、生成AI（大規模言語モデル）を使って書かれた小説を集めた文庫サイトです。書架からタイトルで探して、ページをめくるように読み進められます。',
    },
    {
        title: '音声で読み上げて聞ける',
        body: '小説はブラウザの読み上げ機能で聞くこともできます。ログインすると、自分のマイベイビーが読んでくれます。',
    },
    {
        title: 'アニメで観るドラマ劇場',
        body: 'カンガルーのガルちゃんが主演するスパイ・ドラマ「スパイ・ガルーン」を、アニメーションで再生して楽しめます。',
    },
    {
        title: '動くなかま「ハッチペット」',
        body: 'ガルちゃんたちハッチペットが、待機・ジャンプ・手をふるなど、いろいろな動きを見せてくれるアニメーション図鑑があります。',
    },
    {
        title: '7つの言語で読める',
        body: '日本語のほか、英語・中国語・フランス語・インドネシア語・イタリア語・ネパール語でサイトを表示できます。',
    },
];

export function leadText(p: Prefecture): string {
    return `${SERVICE_NAME}は、生成AIが綴る小説を読める文庫サイトで、アニメで観るドラマやハッチペットも楽しめます。${p.region}地方の${p.name}（${joinCities(p)}など）からも、スマホやパソコンのブラウザでオンラインで使えます。アプリのインストールは不要で、AI小説は無料で読めます。`;
}

export function pageTitle(p: Prefecture): string {
    return `${p.name}で読める${SERVICE_KEYWORD}｜${SERVICE_NAME}`;
}

export function pageDescription(p: Prefecture): string {
    return `${p.name}（${joinCities(p)}など）でも、スマホやパソコンからオンラインで読めるAI小説の文庫サイト「${SERVICE_NAME}」。生成AIが綴る小説を無料で読めて、読み上げやアニメのドラマ劇場も楽しめます。`;
}

/** 県ごとに文面が変わる使い方の例（地理の事実と、サービスの機能だけで組み立てる） */
export function usageExamples(p: Prefecture): { title: string; body: string }[] {
    const [first, second, third] = p.cities;
    const other = third ?? second ?? first;
    return [
        {
            title: `${first}で、すきま時間に一話ずつ`,
            body: `${first}でのちょっとした待ち時間や移動の合間に、スマホで${SERVICE_NAME}を開けば、その場で短いAI小説を読み始められます。読みかけの書架にはいつでも戻れます。`,
        },
        {
            title: `${second ?? first}の夜に、読み上げで聞く`,
            body: `${second ?? first}の自宅で、目を休めたい夜は読み上げ機能で小説を聞くこともできます。ログインすれば、育てているマイベイビーが読んでくれます。`,
        },
        {
            title: `${other}など${p.short}のどこからでも、家族でドラマ劇場`,
            body: `${other}をはじめ${p.name}のどの市町村からでも、インターネットにつながれば同じように使えます。リビングのパソコンで、ガルちゃんが主演するアニメのドラマ劇場を家族で観るのもおすすめです。`,
        },
    ];
}

export function faqs(p: Prefecture): Faq[] {
    return [
        {
            q: `${p.name}に住んでいても${SERVICE_NAME}を使えますか？`,
            a: `はい、使えます。${SERVICE_NAME}はオンラインのWebサイトなので、${p.name}を含む全国どこからでも、スマホやパソコンのブラウザで読めます。`,
        },
        {
            q: `${p.capital}以外の${p.short}の地域からも使えますか？`,
            a: `はい。${joinCities(p)}など、${p.name}のどの地域からでも、インターネットにつながる環境があれば同じように使えます。`,
        },
        {
            q: '料金はかかりますか？',
            a: 'AI小説は無料で読めます。ログインして使う基本の「フリー」プランのほかに、機能を広げる有料プラン（スーパー・プロ・ヴィップ）もあります。',
        },
        {
            q: 'アプリのインストールは必要ですか？',
            a: '必要ありません。スマホやパソコンのブラウザでサイトを開くだけで読めます。',
        },
        {
            q: 'AI小説はどのように作られていますか？',
            a: 'OpenAIのGPT-4やGoogleのGeminiなどのAIを使い、物語の骨組みを生成したうえで、人間のエディターが品質管理と倫理チェックを行っています。',
        },
    ];
}

/** 近くの地域: となりの県 → 同じ地方の他県（重複なし） */
export function nearbyPrefectures(p: Prefecture): { neighbors: Prefecture[]; sameRegion: Prefecture[] } {
    const neighbors = p.neighbors
        .map((slug) => findPrefecture(slug))
        .filter((x): x is Prefecture => Boolean(x));
    const neighborSlugs = new Set(neighbors.map((n) => n.slug));
    const sameRegion = prefecturesInRegion(p.region).filter(
        (x) => x.slug !== p.slug && !neighborSlugs.has(x.slug),
    );
    return { neighbors, sameRegion };
}

export const PROVIDER = {
    '@type': 'Organization',
    name: '株式会社Garoop',
    url: 'https://garoop.jp',
};

function faqJsonLd(items: Faq[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    };
}

function breadcrumbJsonLd(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
    };
}

function serviceJsonLd(description: string, areaServed: Record<string, unknown>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: SERVICE_NAME,
        url: SITE_URL,
        description,
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Web',
        inLanguage: 'ja-JP',
        isAccessibleForFree: true,
        areaServed,
        provider: PROVIDER,
    };
}

export function prefectureJsonLd(p: Prefecture) {
    return [
        breadcrumbJsonLd([
            { name: 'トップ', url: SITE_URL },
            { name: '地域から探す', url: areaUrl() },
            { name: p.name, url: areaUrl(p.slug) },
        ]),
        faqJsonLd(faqs(p)),
        serviceJsonLd(leadText(p), { '@type': 'AdministrativeArea', name: p.name }),
    ];
}

export function areaIndexJsonLd() {
    return [
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'トップ', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: '地域から探す', item: areaUrl() },
            ],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `地域から探す｜${SERVICE_NAME}`,
            numberOfItems: PREFECTURES.length,
            itemListElement: PREFECTURES.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: p.name,
                url: areaUrl(p.slug),
            })),
        },
    ];
}

/** JSON-LD をそのまま script に埋め込むための文字列（</script> で抜けられないようにする） */
export function toJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/<\//g, '<\\/');
}

/* ---------------- 市区ページ ---------------- */

/** 本文に出してよい市区の種別（中核市は年によって変わるので書かない） */
function cityKindPhrase(c: City): string {
    if (c.kind === '政令指定都市') return '政令指定都市';
    if (c.kind === '特別区') return '特別区（東京23区）';
    return '';
}

export function cityLeadText(c: City, p: Prefecture): string {
    const kind = cityKindPhrase(c);
    // 東京都→都庁、北海道→道庁、京都府・大阪府→府庁、それ以外→県庁
    const capitalLabel = `${p.name.slice(-1)}庁所在地`;
    const isCapital = p.capital === c.name;
    const head = `${c.name}は${p.region}地方・${p.name}の`;
    const aboutSentence =
        kind && isCapital ? `${head}${kind}で、${capitalLabel}です。`
            : kind ? `${head}${kind}です。`
                : isCapital ? `${head}${capitalLabel}です。`
                    : `${head}市です。`;
    return `${aboutSentence}${SERVICE_NAME}は、生成AIが綴る小説を読める文庫サイトで、アニメで観るドラマやハッチペットも楽しめます。${c.name}からも、スマホやパソコンのブラウザでオンラインで使えます。アプリのインストールは不要で、AI小説は無料で読めます。`;
}

export function cityPageTitle(c: City, p: Prefecture): string {
    return `${c.name}（${p.name}）で読める${SERVICE_KEYWORD}｜${SERVICE_NAME}`;
}

export function cityPageDescription(c: City, p: Prefecture): string {
    return `${p.name}${c.name}でも、スマホやパソコンからオンラインで読めるAI小説の文庫サイト「${SERVICE_NAME}」。生成AIが綴る小説を無料で読めて、読み上げやアニメのドラマ劇場も楽しめます。${c.name}のどこからでも使えます。`;
}

export function cityUsageExamples(c: City, p: Prefecture): { title: string; body: string }[] {
    return [
        {
            title: `${c.name}で、すきま時間に一話ずつ`,
            body: `${c.name}でのちょっとした待ち時間や移動の合間に、スマホで${SERVICE_NAME}を開けば、その場で短いAI小説を読み始められます。読みかけの書架にはいつでも戻れます。`,
        },
        {
            title: `${c.name}の自宅で、読み上げで聞く`,
            body: `目を休めたい夜は、読み上げ機能で小説を聞くこともできます。ログインすれば、育てているマイベイビーが読んでくれます。`,
        },
        {
            title: `${p.region}地方の${p.name}から、家族でドラマ劇場`,
            body: `${c.name}をはじめ${p.name}のどこからでも、インターネットにつながれば同じように使えます。リビングのパソコンで、ガルちゃんが主演するアニメのドラマ劇場を家族で観るのもおすすめです。`,
        },
    ];
}

export function cityFaqs(c: City, p: Prefecture): Faq[] {
    const base = faqs(p);
    return [
        {
            q: `${c.name}に住んでいても${SERVICE_NAME}を使えますか？`,
            a: `はい、使えます。${SERVICE_NAME}はオンラインのWebサイトなので、${p.name}${c.name}を含む全国どこからでも、スマホやパソコンのブラウザで読めます。`,
        },
        {
            q: `${p.name}の${c.name}以外からも使えますか？`,
            a: `はい。${p.name}のどの市区町村からでも、インターネットにつながる環境があれば同じように使えます。`,
        },
        // 料金・インストール・AI小説の作り方は県ページと同じ事実
        ...base.slice(2),
    ];
}

/** 同じ県のほかの市区 */
export function otherCitiesInPrefecture(c: City): City[] {
    return citiesInPrefecture(c.pref).filter((x) => x.slug !== c.slug);
}

export function cityJsonLd(c: City, p: Prefecture) {
    return [
        breadcrumbJsonLd([
            { name: 'トップ', url: SITE_URL },
            { name: '地域から探す', url: areaUrl() },
            { name: p.name, url: areaUrl(p.slug) },
            { name: c.name, url: cityUrl(c) },
        ]),
        faqJsonLd(cityFaqs(c, p)),
        serviceJsonLd(cityLeadText(c, p), {
            '@type': 'City',
            name: c.name,
            containedInPlace: { '@type': 'AdministrativeArea', name: p.name },
        }),
    ];
}
