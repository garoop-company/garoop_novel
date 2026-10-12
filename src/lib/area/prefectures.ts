/**
 * 地域別ページ（/area/[slug]）で使う都道府県データ。
 *
 * 県ごとのページが同じ文面にならないよう、地方区分・県庁所在地・主な市・
 * となりの県を持たせている。書くのは地理の事実だけにし、
 * 「地元の学校と提携」のような事実でない内容は入れないこと。
 */
export type Region =
  | "北海道"
  | "東北"
  | "関東"
  | "中部"
  | "近畿"
  | "中国"
  | "四国"
  | "九州・沖縄";

export type Prefecture = {
  /** URL に使う英字（例: tokyo） */
  slug: string;
  /** 正式名（例: 東京都） */
  name: string;
  /** 「都・道・府・県」を除いた短い名前（例: 東京） */
  short: string;
  region: Region;
  /** 県庁所在地 */
  capital: string;
  /** 主な市（県庁所在地を含む） */
  cities: string[];
  /** となりの県の slug。海を隔てた県は、橋や航路で行き来の多いところを入れている */
  neighbors: string[];
};

export const REGIONS: Region[] = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
];

export const PREFECTURES: Prefecture[] = [
  { slug: "hokkaido", name: "北海道", short: "北海道", region: "北海道", capital: "札幌市", cities: ["札幌市", "旭川市", "函館市", "帯広市"], neighbors: ["aomori"] },
  { slug: "aomori", name: "青森県", short: "青森", region: "東北", capital: "青森市", cities: ["青森市", "八戸市", "弘前市"], neighbors: ["hokkaido", "iwate", "akita"] },
  { slug: "iwate", name: "岩手県", short: "岩手", region: "東北", capital: "盛岡市", cities: ["盛岡市", "一関市", "奥州市"], neighbors: ["aomori", "akita", "miyagi"] },
  { slug: "miyagi", name: "宮城県", short: "宮城", region: "東北", capital: "仙台市", cities: ["仙台市", "石巻市", "大崎市"], neighbors: ["iwate", "akita", "yamagata", "fukushima"] },
  { slug: "akita", name: "秋田県", short: "秋田", region: "東北", capital: "秋田市", cities: ["秋田市", "横手市", "大仙市"], neighbors: ["aomori", "iwate", "miyagi", "yamagata"] },
  { slug: "yamagata", name: "山形県", short: "山形", region: "東北", capital: "山形市", cities: ["山形市", "鶴岡市", "酒田市"], neighbors: ["akita", "miyagi", "fukushima", "niigata"] },
  { slug: "fukushima", name: "福島県", short: "福島", region: "東北", capital: "福島市", cities: ["福島市", "郡山市", "いわき市"], neighbors: ["miyagi", "yamagata", "niigata", "gunma", "tochigi", "ibaraki"] },
  { slug: "ibaraki", name: "茨城県", short: "茨城", region: "関東", capital: "水戸市", cities: ["水戸市", "つくば市", "日立市"], neighbors: ["fukushima", "tochigi", "saitama", "chiba"] },
  { slug: "tochigi", name: "栃木県", short: "栃木", region: "関東", capital: "宇都宮市", cities: ["宇都宮市", "小山市", "栃木市"], neighbors: ["fukushima", "ibaraki", "gunma", "saitama"] },
  { slug: "gunma", name: "群馬県", short: "群馬", region: "関東", capital: "前橋市", cities: ["前橋市", "高崎市", "太田市"], neighbors: ["fukushima", "tochigi", "saitama", "nagano", "niigata"] },
  { slug: "saitama", name: "埼玉県", short: "埼玉", region: "関東", capital: "さいたま市", cities: ["さいたま市", "川口市", "川越市", "所沢市"], neighbors: ["ibaraki", "tochigi", "gunma", "chiba", "tokyo", "yamanashi", "nagano"] },
  { slug: "chiba", name: "千葉県", short: "千葉", region: "関東", capital: "千葉市", cities: ["千葉市", "船橋市", "松戸市", "柏市"], neighbors: ["ibaraki", "saitama", "tokyo", "kanagawa"] },
  { slug: "tokyo", name: "東京都", short: "東京", region: "関東", capital: "新宿区", cities: ["新宿区", "世田谷区", "八王子市", "町田市"], neighbors: ["saitama", "chiba", "kanagawa", "yamanashi"] },
  { slug: "kanagawa", name: "神奈川県", short: "神奈川", region: "関東", capital: "横浜市", cities: ["横浜市", "川崎市", "相模原市", "藤沢市"], neighbors: ["tokyo", "chiba", "yamanashi", "shizuoka"] },
  { slug: "niigata", name: "新潟県", short: "新潟", region: "中部", capital: "新潟市", cities: ["新潟市", "長岡市", "上越市"], neighbors: ["yamagata", "fukushima", "gunma", "nagano", "toyama"] },
  { slug: "toyama", name: "富山県", short: "富山", region: "中部", capital: "富山市", cities: ["富山市", "高岡市", "射水市"], neighbors: ["niigata", "nagano", "gifu", "ishikawa"] },
  { slug: "ishikawa", name: "石川県", short: "石川", region: "中部", capital: "金沢市", cities: ["金沢市", "白山市", "小松市"], neighbors: ["toyama", "gifu", "fukui"] },
  { slug: "fukui", name: "福井県", short: "福井", region: "中部", capital: "福井市", cities: ["福井市", "坂井市", "越前市"], neighbors: ["ishikawa", "gifu", "shiga", "kyoto"] },
  { slug: "yamanashi", name: "山梨県", short: "山梨", region: "中部", capital: "甲府市", cities: ["甲府市", "甲斐市", "南アルプス市"], neighbors: ["saitama", "tokyo", "kanagawa", "shizuoka", "nagano"] },
  { slug: "nagano", name: "長野県", short: "長野", region: "中部", capital: "長野市", cities: ["長野市", "松本市", "上田市"], neighbors: ["niigata", "gunma", "saitama", "yamanashi", "shizuoka", "aichi", "gifu", "toyama"] },
  { slug: "gifu", name: "岐阜県", short: "岐阜", region: "中部", capital: "岐阜市", cities: ["岐阜市", "大垣市", "各務原市"], neighbors: ["toyama", "ishikawa", "fukui", "nagano", "aichi", "mie", "shiga"] },
  { slug: "shizuoka", name: "静岡県", short: "静岡", region: "中部", capital: "静岡市", cities: ["静岡市", "浜松市", "富士市", "沼津市"], neighbors: ["kanagawa", "yamanashi", "nagano", "aichi"] },
  { slug: "aichi", name: "愛知県", short: "愛知", region: "中部", capital: "名古屋市", cities: ["名古屋市", "豊田市", "岡崎市", "一宮市"], neighbors: ["shizuoka", "nagano", "gifu", "mie"] },
  { slug: "mie", name: "三重県", short: "三重", region: "近畿", capital: "津市", cities: ["津市", "四日市市", "鈴鹿市"], neighbors: ["aichi", "gifu", "shiga", "kyoto", "nara", "wakayama"] },
  { slug: "shiga", name: "滋賀県", short: "滋賀", region: "近畿", capital: "大津市", cities: ["大津市", "草津市", "彦根市"], neighbors: ["fukui", "gifu", "mie", "kyoto"] },
  { slug: "kyoto", name: "京都府", short: "京都", region: "近畿", capital: "京都市", cities: ["京都市", "宇治市", "福知山市"], neighbors: ["fukui", "shiga", "mie", "nara", "osaka", "hyogo"] },
  { slug: "osaka", name: "大阪府", short: "大阪", region: "近畿", capital: "大阪市", cities: ["大阪市", "堺市", "東大阪市", "豊中市"], neighbors: ["kyoto", "nara", "wakayama", "hyogo"] },
  { slug: "hyogo", name: "兵庫県", short: "兵庫", region: "近畿", capital: "神戸市", cities: ["神戸市", "姫路市", "西宮市", "尼崎市"], neighbors: ["kyoto", "osaka", "tottori", "okayama", "tokushima"] },
  { slug: "nara", name: "奈良県", short: "奈良", region: "近畿", capital: "奈良市", cities: ["奈良市", "橿原市", "生駒市"], neighbors: ["kyoto", "osaka", "mie", "wakayama"] },
  { slug: "wakayama", name: "和歌山県", short: "和歌山", region: "近畿", capital: "和歌山市", cities: ["和歌山市", "田辺市", "橋本市"], neighbors: ["osaka", "nara", "mie"] },
  { slug: "tottori", name: "鳥取県", short: "鳥取", region: "中国", capital: "鳥取市", cities: ["鳥取市", "米子市", "倉吉市"], neighbors: ["hyogo", "okayama", "shimane", "hiroshima"] },
  { slug: "shimane", name: "島根県", short: "島根", region: "中国", capital: "松江市", cities: ["松江市", "出雲市", "浜田市"], neighbors: ["tottori", "hiroshima", "yamaguchi"] },
  { slug: "okayama", name: "岡山県", short: "岡山", region: "中国", capital: "岡山市", cities: ["岡山市", "倉敷市", "津山市"], neighbors: ["hyogo", "tottori", "hiroshima", "kagawa"] },
  { slug: "hiroshima", name: "広島県", short: "広島", region: "中国", capital: "広島市", cities: ["広島市", "福山市", "呉市", "東広島市"], neighbors: ["okayama", "tottori", "shimane", "yamaguchi", "ehime"] },
  { slug: "yamaguchi", name: "山口県", short: "山口", region: "中国", capital: "山口市", cities: ["山口市", "下関市", "宇部市", "周南市"], neighbors: ["hiroshima", "shimane", "fukuoka"] },
  { slug: "tokushima", name: "徳島県", short: "徳島", region: "四国", capital: "徳島市", cities: ["徳島市", "阿南市", "鳴門市"], neighbors: ["kagawa", "ehime", "kochi", "hyogo"] },
  { slug: "kagawa", name: "香川県", short: "香川", region: "四国", capital: "高松市", cities: ["高松市", "丸亀市", "観音寺市"], neighbors: ["tokushima", "ehime", "okayama"] },
  { slug: "ehime", name: "愛媛県", short: "愛媛", region: "四国", capital: "松山市", cities: ["松山市", "今治市", "新居浜市"], neighbors: ["kagawa", "tokushima", "kochi", "hiroshima"] },
  { slug: "kochi", name: "高知県", short: "高知", region: "四国", capital: "高知市", cities: ["高知市", "南国市", "四万十市"], neighbors: ["tokushima", "ehime"] },
  { slug: "fukuoka", name: "福岡県", short: "福岡", region: "九州・沖縄", capital: "福岡市", cities: ["福岡市", "北九州市", "久留米市"], neighbors: ["yamaguchi", "saga", "kumamoto", "oita"] },
  { slug: "saga", name: "佐賀県", short: "佐賀", region: "九州・沖縄", capital: "佐賀市", cities: ["佐賀市", "唐津市", "鳥栖市"], neighbors: ["fukuoka", "nagasaki"] },
  { slug: "nagasaki", name: "長崎県", short: "長崎", region: "九州・沖縄", capital: "長崎市", cities: ["長崎市", "佐世保市", "諫早市"], neighbors: ["saga", "kumamoto"] },
  { slug: "kumamoto", name: "熊本県", short: "熊本", region: "九州・沖縄", capital: "熊本市", cities: ["熊本市", "八代市", "天草市"], neighbors: ["fukuoka", "oita", "miyazaki", "kagoshima", "nagasaki"] },
  { slug: "oita", name: "大分県", short: "大分", region: "九州・沖縄", capital: "大分市", cities: ["大分市", "別府市", "中津市"], neighbors: ["fukuoka", "kumamoto", "miyazaki"] },
  { slug: "miyazaki", name: "宮崎県", short: "宮崎", region: "九州・沖縄", capital: "宮崎市", cities: ["宮崎市", "都城市", "延岡市"], neighbors: ["oita", "kumamoto", "kagoshima"] },
  { slug: "kagoshima", name: "鹿児島県", short: "鹿児島", region: "九州・沖縄", capital: "鹿児島市", cities: ["鹿児島市", "霧島市", "鹿屋市"], neighbors: ["kumamoto", "miyazaki", "okinawa"] },
  { slug: "okinawa", name: "沖縄県", short: "沖縄", region: "九州・沖縄", capital: "那覇市", cities: ["那覇市", "沖縄市", "うるま市", "浦添市"], neighbors: ["kagoshima"] },
];

export function findPrefecture(slug: string): Prefecture | undefined {
  return PREFECTURES.find((p) => p.slug === slug);
}

export function prefecturesInRegion(region: Region): Prefecture[] {
  return PREFECTURES.filter((p) => p.region === region);
}
