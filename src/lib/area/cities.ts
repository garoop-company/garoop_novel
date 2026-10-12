/**
 * 地域別ページ（/area/[pref]/[city]）で使う市区のデータ。
 *
 * 全市区町村ではなく、政令指定都市・中核市・県庁所在地・東京 23 区と、
 * 各県の主な市に絞っている。中身がほぼ同じページを大量に作ると、
 * 検索エンジンから「薄いページ」と見なされやすいため。
 * 市を足すときは、ここに 1 行足すだけでページと sitemap に反映される。
 *
 * kind は本文に出してよい事実だけを持つ（政令指定都市・特別区・市）。
 * 中核市かどうかは年によって変わるので、本文には書かない。
 */
export type CityKind = "政令指定都市" | "特別区" | "市";

export type City = {
  /** URL に使う英字。県の中で一意（例: yokohama） */
  slug: string;
  /** 正式名（例: 横浜市） */
  name: string;
  /** 属する都道府県の slug（prefectures.ts） */
  pref: string;
  kind: CityKind;
};

const D = "政令指定都市" as const;
const W = "特別区" as const;
const C = "市" as const;

export const CITIES: City[] = [
  // 北海道
  { slug: "sapporo", name: "札幌市", pref: "hokkaido", kind: D },
  { slug: "asahikawa", name: "旭川市", pref: "hokkaido", kind: C },
  { slug: "hakodate", name: "函館市", pref: "hokkaido", kind: C },
  { slug: "obihiro", name: "帯広市", pref: "hokkaido", kind: C },
  // 青森
  { slug: "aomori", name: "青森市", pref: "aomori", kind: C },
  { slug: "hachinohe", name: "八戸市", pref: "aomori", kind: C },
  { slug: "hirosaki", name: "弘前市", pref: "aomori", kind: C },
  // 岩手
  { slug: "morioka", name: "盛岡市", pref: "iwate", kind: C },
  { slug: "ichinoseki", name: "一関市", pref: "iwate", kind: C },
  { slug: "oshu", name: "奥州市", pref: "iwate", kind: C },
  // 宮城
  { slug: "sendai", name: "仙台市", pref: "miyagi", kind: D },
  { slug: "ishinomaki", name: "石巻市", pref: "miyagi", kind: C },
  { slug: "osaki", name: "大崎市", pref: "miyagi", kind: C },
  // 秋田
  { slug: "akita", name: "秋田市", pref: "akita", kind: C },
  { slug: "yokote", name: "横手市", pref: "akita", kind: C },
  { slug: "daisen", name: "大仙市", pref: "akita", kind: C },
  // 山形
  { slug: "yamagata", name: "山形市", pref: "yamagata", kind: C },
  { slug: "tsuruoka", name: "鶴岡市", pref: "yamagata", kind: C },
  { slug: "sakata", name: "酒田市", pref: "yamagata", kind: C },
  // 福島
  { slug: "fukushima", name: "福島市", pref: "fukushima", kind: C },
  { slug: "koriyama", name: "郡山市", pref: "fukushima", kind: C },
  { slug: "iwaki", name: "いわき市", pref: "fukushima", kind: C },
  // 茨城
  { slug: "mito", name: "水戸市", pref: "ibaraki", kind: C },
  { slug: "tsukuba", name: "つくば市", pref: "ibaraki", kind: C },
  { slug: "hitachi", name: "日立市", pref: "ibaraki", kind: C },
  // 栃木
  { slug: "utsunomiya", name: "宇都宮市", pref: "tochigi", kind: C },
  { slug: "oyama", name: "小山市", pref: "tochigi", kind: C },
  { slug: "tochigi", name: "栃木市", pref: "tochigi", kind: C },
  // 群馬
  { slug: "maebashi", name: "前橋市", pref: "gunma", kind: C },
  { slug: "takasaki", name: "高崎市", pref: "gunma", kind: C },
  { slug: "ota", name: "太田市", pref: "gunma", kind: C },
  // 埼玉
  { slug: "saitama", name: "さいたま市", pref: "saitama", kind: D },
  { slug: "kawaguchi", name: "川口市", pref: "saitama", kind: C },
  { slug: "kawagoe", name: "川越市", pref: "saitama", kind: C },
  { slug: "koshigaya", name: "越谷市", pref: "saitama", kind: C },
  { slug: "tokorozawa", name: "所沢市", pref: "saitama", kind: C },
  // 千葉
  { slug: "chiba", name: "千葉市", pref: "chiba", kind: D },
  { slug: "funabashi", name: "船橋市", pref: "chiba", kind: C },
  { slug: "matsudo", name: "松戸市", pref: "chiba", kind: C },
  { slug: "kashiwa", name: "柏市", pref: "chiba", kind: C },
  // 東京
  { slug: "chiyoda", name: "千代田区", pref: "tokyo", kind: W },
  { slug: "chuo", name: "中央区", pref: "tokyo", kind: W },
  { slug: "minato", name: "港区", pref: "tokyo", kind: W },
  { slug: "shinjuku", name: "新宿区", pref: "tokyo", kind: W },
  { slug: "bunkyo", name: "文京区", pref: "tokyo", kind: W },
  { slug: "taito", name: "台東区", pref: "tokyo", kind: W },
  { slug: "sumida", name: "墨田区", pref: "tokyo", kind: W },
  { slug: "koto", name: "江東区", pref: "tokyo", kind: W },
  { slug: "shinagawa", name: "品川区", pref: "tokyo", kind: W },
  { slug: "meguro", name: "目黒区", pref: "tokyo", kind: W },
  { slug: "ota", name: "大田区", pref: "tokyo", kind: W },
  { slug: "setagaya", name: "世田谷区", pref: "tokyo", kind: W },
  { slug: "shibuya", name: "渋谷区", pref: "tokyo", kind: W },
  { slug: "nakano", name: "中野区", pref: "tokyo", kind: W },
  { slug: "suginami", name: "杉並区", pref: "tokyo", kind: W },
  { slug: "toshima", name: "豊島区", pref: "tokyo", kind: W },
  { slug: "kita", name: "北区", pref: "tokyo", kind: W },
  { slug: "arakawa", name: "荒川区", pref: "tokyo", kind: W },
  { slug: "itabashi", name: "板橋区", pref: "tokyo", kind: W },
  { slug: "nerima", name: "練馬区", pref: "tokyo", kind: W },
  { slug: "adachi", name: "足立区", pref: "tokyo", kind: W },
  { slug: "katsushika", name: "葛飾区", pref: "tokyo", kind: W },
  { slug: "edogawa", name: "江戸川区", pref: "tokyo", kind: W },
  { slug: "hachioji", name: "八王子市", pref: "tokyo", kind: C },
  { slug: "machida", name: "町田市", pref: "tokyo", kind: C },
  // 神奈川
  { slug: "yokohama", name: "横浜市", pref: "kanagawa", kind: D },
  { slug: "kawasaki", name: "川崎市", pref: "kanagawa", kind: D },
  { slug: "sagamihara", name: "相模原市", pref: "kanagawa", kind: D },
  { slug: "yokosuka", name: "横須賀市", pref: "kanagawa", kind: C },
  { slug: "fujisawa", name: "藤沢市", pref: "kanagawa", kind: C },
  // 新潟
  { slug: "niigata", name: "新潟市", pref: "niigata", kind: D },
  { slug: "nagaoka", name: "長岡市", pref: "niigata", kind: C },
  { slug: "joetsu", name: "上越市", pref: "niigata", kind: C },
  // 富山
  { slug: "toyama", name: "富山市", pref: "toyama", kind: C },
  { slug: "takaoka", name: "高岡市", pref: "toyama", kind: C },
  { slug: "imizu", name: "射水市", pref: "toyama", kind: C },
  // 石川
  { slug: "kanazawa", name: "金沢市", pref: "ishikawa", kind: C },
  { slug: "hakusan", name: "白山市", pref: "ishikawa", kind: C },
  { slug: "komatsu", name: "小松市", pref: "ishikawa", kind: C },
  // 福井
  { slug: "fukui", name: "福井市", pref: "fukui", kind: C },
  { slug: "sakai", name: "坂井市", pref: "fukui", kind: C },
  { slug: "echizen", name: "越前市", pref: "fukui", kind: C },
  // 山梨
  { slug: "kofu", name: "甲府市", pref: "yamanashi", kind: C },
  { slug: "kai", name: "甲斐市", pref: "yamanashi", kind: C },
  { slug: "minami-alps", name: "南アルプス市", pref: "yamanashi", kind: C },
  // 長野
  { slug: "nagano", name: "長野市", pref: "nagano", kind: C },
  { slug: "matsumoto", name: "松本市", pref: "nagano", kind: C },
  { slug: "ueda", name: "上田市", pref: "nagano", kind: C },
  // 岐阜
  { slug: "gifu", name: "岐阜市", pref: "gifu", kind: C },
  { slug: "ogaki", name: "大垣市", pref: "gifu", kind: C },
  { slug: "kakamigahara", name: "各務原市", pref: "gifu", kind: C },
  // 静岡
  { slug: "shizuoka", name: "静岡市", pref: "shizuoka", kind: D },
  { slug: "hamamatsu", name: "浜松市", pref: "shizuoka", kind: D },
  { slug: "fuji", name: "富士市", pref: "shizuoka", kind: C },
  { slug: "numazu", name: "沼津市", pref: "shizuoka", kind: C },
  // 愛知
  { slug: "nagoya", name: "名古屋市", pref: "aichi", kind: D },
  { slug: "toyota", name: "豊田市", pref: "aichi", kind: C },
  { slug: "okazaki", name: "岡崎市", pref: "aichi", kind: C },
  { slug: "ichinomiya", name: "一宮市", pref: "aichi", kind: C },
  { slug: "toyohashi", name: "豊橋市", pref: "aichi", kind: C },
  // 三重
  { slug: "tsu", name: "津市", pref: "mie", kind: C },
  { slug: "yokkaichi", name: "四日市市", pref: "mie", kind: C },
  { slug: "suzuka", name: "鈴鹿市", pref: "mie", kind: C },
  // 滋賀
  { slug: "otsu", name: "大津市", pref: "shiga", kind: C },
  { slug: "kusatsu", name: "草津市", pref: "shiga", kind: C },
  { slug: "hikone", name: "彦根市", pref: "shiga", kind: C },
  // 京都
  { slug: "kyoto", name: "京都市", pref: "kyoto", kind: D },
  { slug: "uji", name: "宇治市", pref: "kyoto", kind: C },
  { slug: "fukuchiyama", name: "福知山市", pref: "kyoto", kind: C },
  // 大阪
  { slug: "osaka", name: "大阪市", pref: "osaka", kind: D },
  { slug: "sakai", name: "堺市", pref: "osaka", kind: D },
  { slug: "higashiosaka", name: "東大阪市", pref: "osaka", kind: C },
  { slug: "toyonaka", name: "豊中市", pref: "osaka", kind: C },
  { slug: "suita", name: "吹田市", pref: "osaka", kind: C },
  { slug: "takatsuki", name: "高槻市", pref: "osaka", kind: C },
  { slug: "hirakata", name: "枚方市", pref: "osaka", kind: C },
  { slug: "yao", name: "八尾市", pref: "osaka", kind: C },
  { slug: "neyagawa", name: "寝屋川市", pref: "osaka", kind: C },
  // 兵庫
  { slug: "kobe", name: "神戸市", pref: "hyogo", kind: D },
  { slug: "himeji", name: "姫路市", pref: "hyogo", kind: C },
  { slug: "nishinomiya", name: "西宮市", pref: "hyogo", kind: C },
  { slug: "amagasaki", name: "尼崎市", pref: "hyogo", kind: C },
  { slug: "akashi", name: "明石市", pref: "hyogo", kind: C },
  // 奈良
  { slug: "nara", name: "奈良市", pref: "nara", kind: C },
  { slug: "kashihara", name: "橿原市", pref: "nara", kind: C },
  { slug: "ikoma", name: "生駒市", pref: "nara", kind: C },
  // 和歌山
  { slug: "wakayama", name: "和歌山市", pref: "wakayama", kind: C },
  { slug: "tanabe", name: "田辺市", pref: "wakayama", kind: C },
  { slug: "hashimoto", name: "橋本市", pref: "wakayama", kind: C },
  // 鳥取
  { slug: "tottori", name: "鳥取市", pref: "tottori", kind: C },
  { slug: "yonago", name: "米子市", pref: "tottori", kind: C },
  { slug: "kurayoshi", name: "倉吉市", pref: "tottori", kind: C },
  // 島根
  { slug: "matsue", name: "松江市", pref: "shimane", kind: C },
  { slug: "izumo", name: "出雲市", pref: "shimane", kind: C },
  { slug: "hamada", name: "浜田市", pref: "shimane", kind: C },
  // 岡山
  { slug: "okayama", name: "岡山市", pref: "okayama", kind: D },
  { slug: "kurashiki", name: "倉敷市", pref: "okayama", kind: C },
  { slug: "tsuyama", name: "津山市", pref: "okayama", kind: C },
  // 広島
  { slug: "hiroshima", name: "広島市", pref: "hiroshima", kind: D },
  { slug: "fukuyama", name: "福山市", pref: "hiroshima", kind: C },
  { slug: "kure", name: "呉市", pref: "hiroshima", kind: C },
  { slug: "higashihiroshima", name: "東広島市", pref: "hiroshima", kind: C },
  // 山口
  { slug: "yamaguchi", name: "山口市", pref: "yamaguchi", kind: C },
  { slug: "shimonoseki", name: "下関市", pref: "yamaguchi", kind: C },
  { slug: "ube", name: "宇部市", pref: "yamaguchi", kind: C },
  { slug: "shunan", name: "周南市", pref: "yamaguchi", kind: C },
  // 徳島
  { slug: "tokushima", name: "徳島市", pref: "tokushima", kind: C },
  { slug: "anan", name: "阿南市", pref: "tokushima", kind: C },
  { slug: "naruto", name: "鳴門市", pref: "tokushima", kind: C },
  // 香川
  { slug: "takamatsu", name: "高松市", pref: "kagawa", kind: C },
  { slug: "marugame", name: "丸亀市", pref: "kagawa", kind: C },
  { slug: "kanonji", name: "観音寺市", pref: "kagawa", kind: C },
  // 愛媛
  { slug: "matsuyama", name: "松山市", pref: "ehime", kind: C },
  { slug: "imabari", name: "今治市", pref: "ehime", kind: C },
  { slug: "niihama", name: "新居浜市", pref: "ehime", kind: C },
  // 高知
  { slug: "kochi", name: "高知市", pref: "kochi", kind: C },
  { slug: "nankoku", name: "南国市", pref: "kochi", kind: C },
  { slug: "shimanto", name: "四万十市", pref: "kochi", kind: C },
  // 福岡
  { slug: "fukuoka", name: "福岡市", pref: "fukuoka", kind: D },
  { slug: "kitakyushu", name: "北九州市", pref: "fukuoka", kind: D },
  { slug: "kurume", name: "久留米市", pref: "fukuoka", kind: C },
  // 佐賀
  { slug: "saga", name: "佐賀市", pref: "saga", kind: C },
  { slug: "karatsu", name: "唐津市", pref: "saga", kind: C },
  { slug: "tosu", name: "鳥栖市", pref: "saga", kind: C },
  // 長崎
  { slug: "nagasaki", name: "長崎市", pref: "nagasaki", kind: C },
  { slug: "sasebo", name: "佐世保市", pref: "nagasaki", kind: C },
  { slug: "isahaya", name: "諫早市", pref: "nagasaki", kind: C },
  // 熊本
  { slug: "kumamoto", name: "熊本市", pref: "kumamoto", kind: D },
  { slug: "yatsushiro", name: "八代市", pref: "kumamoto", kind: C },
  { slug: "amakusa", name: "天草市", pref: "kumamoto", kind: C },
  // 大分
  { slug: "oita", name: "大分市", pref: "oita", kind: C },
  { slug: "beppu", name: "別府市", pref: "oita", kind: C },
  { slug: "nakatsu", name: "中津市", pref: "oita", kind: C },
  // 宮崎
  { slug: "miyazaki", name: "宮崎市", pref: "miyazaki", kind: C },
  { slug: "miyakonojo", name: "都城市", pref: "miyazaki", kind: C },
  { slug: "nobeoka", name: "延岡市", pref: "miyazaki", kind: C },
  // 鹿児島
  { slug: "kagoshima", name: "鹿児島市", pref: "kagoshima", kind: C },
  { slug: "kirishima", name: "霧島市", pref: "kagoshima", kind: C },
  { slug: "kanoya", name: "鹿屋市", pref: "kagoshima", kind: C },
  // 沖縄
  { slug: "naha", name: "那覇市", pref: "okinawa", kind: C },
  { slug: "okinawa", name: "沖縄市", pref: "okinawa", kind: C },
  { slug: "uruma", name: "うるま市", pref: "okinawa", kind: C },
  { slug: "urasoe", name: "浦添市", pref: "okinawa", kind: C },
];

export function citiesInPrefecture(prefSlug: string): City[] {
  return CITIES.filter((c) => c.pref === prefSlug);
}

export function findCity(prefSlug: string, citySlug: string): City | undefined {
  return CITIES.find((c) => c.pref === prefSlug && c.slug === citySlug);
}
