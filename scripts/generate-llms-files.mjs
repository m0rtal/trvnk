// scripts/generate-llms-files.mjs
// Generates LLM-friendly static files (llms-full.txt and sitemap-index.xml)
// from all plant content files. Runs as part of `astro build`.
//
// Usage: node scripts/generate-llms-files.mjs
// Reads:  src/content/plants/*.md
// Writes: dist/llms-full.txt, dist/sitemap-index.xml, public/llms.txt

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const DIST = join(ROOT, "dist");
const PLANTS_DIR = join(ROOT, "src/content/plants");

function readPlant(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fmBlock = m[1];
  const body = m[2].trim();
  const fm = {};
  for (const line of fmBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
    }
    fm[key] = value;
  }
  return { fm, body, slug: filePath.split("/").pop().replace(/\.md$/, "") };
}

function genLlmsFull() {
  if (!existsSync(PLANTS_DIR)) return;
  const files = readdirSync(PLANTS_DIR).filter((f) => f.endsWith(".md"));
  const plants = files.map((f) => readPlant(join(PLANTS_DIR, f))).filter(Boolean);

  const lines = [
    "# trvnk — полный контент для LLM-агентов",
    "",
    "> Этот файл содержит полный текст всех страниц каталога в формате Markdown.",
    "> Сгенерирован автоматически на этапе сборки.",
    `> Всего растений: ${plants.length}.`,
    "",
    "---",
    "",
  ];

  for (const { fm, body, slug } of plants) {
    lines.push(`## ${fm.title || slug} (${fm.latin || slug})`);
    lines.push("");
    lines.push("### Сводка");
    lines.push("");
    if (fm.common) lines.push(`- **Общепринятое имя:** ${fm.common}`);
    if (fm.family) lines.push(`- **Семейство:** ${fm.family}`);
    if (fm.habit) lines.push(`- **Тип:** ${fm.habit}`);
    if (fm.height_range) lines.push(`- **Высота:** ${fm.height_range}`);
    if (fm.range) lines.push(`- **Ареал:** ${fm.range}`);
    if (fm.habitats) lines.push(`- **Местообитание:** ${fm.habitats}`);
    if (fm.hardiness_zone) lines.push(`- **Морозостойкость:** ${fm.hardiness_zone}`);
    if (fm.hazards) lines.push(`- **Известные опасности:** ${fm.hazards}`);
    if (fm.weed_potential) lines.push(`- **Сорный потенциал:** ${fm.weed_potential}`);
    lines.push(`- **Съедобность:** ${fm.edibility ?? 0} из 5`);
    lines.push(`- **Лекарственное:** ${fm.medicinal ?? 0} из 5`);
    lines.push(`- **Прочее применение:** ${fm.other_uses ?? 0} из 5`);
    lines.push("");
    if (body) {
      lines.push("### Полное описание");
      lines.push("");
      lines.push(body);
      lines.push("");
    }
    lines.push(`**URL:** https://trvnk.ru/plants/${slug}/`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });
  writeFileSync(join(PUBLIC, "llms-full.txt"), lines.join("\n"), "utf8");
  if (existsSync(DIST)) writeFileSync(join(DIST, "llms-full.txt"), lines.join("\n"), "utf8");
  console.log(`✓ llms-full.txt written (${plants.length} plants)`);
}

function genSitemap() {
  if (!existsSync(PLANTS_DIR)) return;
  const files = readdirSync(PLANTS_DIR).filter((f) => f.endsWith(".md"));
  const slugs = files.map((f) => f.replace(/\.md$/, ""));

  const urls = [
    { loc: "https://trvnk.ru/", priority: "1.0", changefreq: "weekly" },
    { loc: "https://trvnk.ru/about/", priority: "0.6", changefreq: "monthly" },
    { loc: "https://trvnk.ru/llms.txt", priority: "0.5", changefreq: "monthly" },
    { loc: "https://trvnk.ru/llms-full.txt", priority: "0.8", changefreq: "weekly" },
    ...slugs.map((slug) => ({
      loc: `https://trvnk.ru/plants/${slug}/`,
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true });
  writeFileSync(join(PUBLIC, "sitemap-index.xml"), xml, "utf8");
  if (existsSync(DIST)) writeFileSync(join(DIST, "sitemap-index.xml"), xml, "utf8");
  console.log(`✓ sitemap-index.xml written (${urls.length} URLs)`);
}

function genLlmsIndex() {
  // Static /llms.txt — short directory of plant pages for LLM agents.
  // Standard proposed by Jeremy Howard (https://llmstxt.org/).
  if (!existsSync(PLANTS_DIR)) return;
  const files = readdirSync(PLANTS_DIR).filter((f) => f.endsWith(".md"));
  const plants = files
    .map((f) => readPlant(join(PLANTS_DIR, f)))
    .filter(Boolean);

  const lines = [
    "# trvnk",
    "",
    "> Русскоязычный энциклопедический каталог полезных растений.",
    "> Научные названия, морфология, ареал, условия выращивания, статус охраны.",
    "",
    "## Сайт",
    "",
    "- Главная: https://trvnk.ru/",
    "- О проекте: https://trvnk.ru/about/",
    "- Полный контент для LLM: https://trvnk.ru/llms-full.txt",
    "- Sitemap (для парсинга): https://trvnk.ru/sitemap-index.xml",
    "",
    "## Структура каталога",
    "",
    "Карточка растения по адресу `/plants/<slug>/` содержит:",
    "",
    "1. Краткую сводку (таблица: тип, высота, семейство, ареал, морозостойкость и др.).",
    "2. Галерею фотографий.",
    "3. Полное описание: таксономия, морфология, ареал, условия выращивания, размножение, статус охраны, применение.",
    "4. Блок «Источники» с прямыми ссылками на POWO, Flora of China, Trees and Shrubs Online, RHS, IUCN Red List, CITES, рецензированные публикации.",
    "5. Структурированные данные JSON-LD по Schema.org (Plant + Article + BreadcrumbList + FAQPage).",
    "",
    "## Авторитетные ботанические источники",
    "",
    "- POWO (Plants of the World Online, Kew): https://powo.science.kew.org/",
    "- Flora of China: http://www.efloras.org/florataxon.aspx?flora_id=2",
    "- Trees and Shrubs Online (Owen Johnson, 2021): https://www.treesandshrubsonline.org/",
    "- IPNI (International Plant Names Index): https://www.ipni.org/",
    "- Wikispecies: https://species.wikimedia.org/",
    "- RHS Plant Finder (2024): https://www.rhs.org.uk/plants",
    "- IUCN Red List: https://www.iucnredlist.org/",
    "- CITES: https://cites.org/",
    "- PubMed (фитохимия): https://pubmed.ncbi.nlm.nih.gov/",
    "",
    "## Поля frontmatter (Markdown)",
    "",
    "```yaml",
    "latin: string               # научное (латинское) название",
    "title: string               # русское название",
    "common: string?             # распространённое имя (English)",
    "family: string?             # семейство",
    "range: string?              # ареал",
    "habitats: string?           # местообитание",
    "hardiness_zone: enum?       # H1..H6 (RHS)",
    "height_range: string?       # диапазон высоты с пояснением",
    "habit: string?              # тип (куст, дерево, ...)",
    "edibility: 0..5             # рейтинг съедобности",
    "medicinal: 0..5             # рейтинг лечебного применения",
    "other_uses: 0..5            # прочее применение",
    "weed_potential: string?",
    "hazards: string?",
    "soil: object?               # well_drained, moist, wet, water (booleans)",
    "light: object?              # full_sun, part_shade, full_shade (booleans)",
    "images: string[]            # пути к изображениям",
    "published: date             # дата публикации",
    "```",
    "",
    "## Растения в каталоге",
    "",
  ];

  for (const { fm, slug } of plants) {
    lines.push(
      `- [${fm.title || slug} (${fm.latin || slug})](https://trvnk.ru/plants/${slug}/) — ${fm.habitats || fm.range || "карточка растения"}`,
    );
  }
  lines.push("");

  if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });
  writeFileSync(join(PUBLIC, "llms.txt"), lines.join("\n"), "utf8");
  console.log(`✓ llms.txt written (${plants.length} plants)`);
}

genLlmsIndex();
genLlmsFull();
genSitemap();
genRssFeed()

function genRssFeed() {
  // Atom 1.0 feed for plant pages. Latest 50 entries.
  if (!existsSync(PLANTS_DIR)) return;
  const files = readdirSync(PLANTS_DIR).filter((f) => f.endsWith(".md"));
  const plants = files
    .map((f) => readPlant(join(PLANTS_DIR, f)))
    .filter(Boolean);

  const updated = new Date().toISOString();
  const entries = plants
    .slice(0, 50)
    .map(({ fm, body, slug }) => {
      const title = fm.title || slug;
      const latin = fm.latin || slug;
      const published = fm.published || new Date().toISOString();
      const summary = (body.split("\n\n")[0] || "").slice(0, 500).replace(/[#*`]/g, "");
      return `  <entry>
    <id>https://trvnk.ru/plants/${slug}/</id>
    <title>${escapeXml(title)} (${escapeXml(latin)})</title>
    <updated>${published}</updated>
    <link href="https://trvnk.ru/plants/${slug}/" rel="alternate"/>
    <summary>${escapeXml(summary)}</summary>
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ru-RU">
  <id>https://trvnk.ru/</id>
  <title>trvnk — Каталог полезных растений</title>
  <subtitle>Энциклопедия полезных растений на русском</subtitle>
  <link href="https://trvnk.ru/" rel="alternate"/>
  <link href="https://trvnk.ru/feed.xml" rel="self"/>
  <updated>${updated}</updated>
${entries}
</feed>
`;

  if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, {recursive: true});
  writeFileSync(join(PUBLIC, "feed.xml"), xml, "utf8");
  if (existsSync(DIST)) writeFileSync(join(DIST, "feed.xml"), xml, "utf8");
  console.log(`✓ feed.xml written (${Math.min(plants.length, 50)} entries)`);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


