/** 代表・山下大貴などの寄稿記事。本文はかんたんな Markdown（## 見出し・### 小見出し・- 箇条書き・> 引用・**強調**・[リンク](URL)）。 */
export type BlogPost = {
    slug: string;
    title: string;
    description: string;
    /** "YYYY-MM-DD" */
    publishedAt: string;
    author: { name: string; role: string; url: string };
    tags: string[];
    body: string;
};
