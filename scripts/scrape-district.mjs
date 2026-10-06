// Full crawl of the district-hosted club site -> scraped/data.json, scraped/new-projects.sql,
// and local copies of every photo in public/scraped/.
// Run with: node scripts/scrape-district.mjs
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const ORIGIN = "https://pashupati-kathmandu.rotarydistrict3292.org.np";
const CLUB = `${ORIGIN}/club/pashupati-kathmandu`;
const OUT = "scraped";
const IMG = "public/scraped";

const CATEGORY_MAP = {
  "fighting disease": "Disease Prevention and Treatment",
  "saving mothers and children": "Maternal and Child Health",
  "providing clean water, sanitation, and hygiene": "Water and Sanitation",
  "supporting education": "Basic Education and Literacy",
  "happy school": "Basic Education and Literacy",
  "rotary literacy teach": "Basic Education and Literacy",
  "promoting peace": "Peace and Conflict Prevention",
  "growing local economies": "Economic and Community Development",
};
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (h) =>
  h.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ").replace(/\n[ \t]+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
const abs = (u) => (u ? new URL(u.replace(/&amp;/g, "&"), ORIGIN).href : null);

// The source drops connections when crawled quickly (and crashes undici's fetch outright),
// so shell out to curl with retries.
const run = promisify(execFile);
async function getBuf(url, tries = 4) {
  let err;
  for (let i = 1; i <= tries; i++) {
    try {
      const { stdout } = await run("curl", ["-sfL", "-m", "40", "-A", "rotary-pashupati-site-sync", url],
        { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
      await sleep(250);
      return stdout;
    } catch (e) { err = e; await sleep(500 * i); }
  }
  throw new Error(`${url}: ${err.message}`);
}
const html = async (u) => (await getBuf(u)).toString("utf8");

const images = new Map(); // remote url -> local path
const IMG_EXT = /\.(jpe?g|png|webp|gif|svg)$/i;
async function saveImage(remote, sub) {
  if (!remote || !IMG_EXT.test(remote.split("?")[0])) return null; // skips e.g. a .docx wrongly used as image
  if (images.has(remote)) return images.get(remote);
  const file = `${sub}/${remote.split("/").pop().split("?")[0]}`;
  const dest = path.join(IMG, file);
  try {
    await access(dest);
  } catch {
    try {
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, await getBuf(remote));
    } catch (e) { console.warn("image failed:", e.message); return null; }
  }
  images.set(remote, `/scraped/${file}`);
  return `/scraped/${file}`;
}

const field = (h, label) => {
  const m = h.match(new RegExp(`<strong>${label}:</strong>([^<]*)`, "i"));
  return m ? strip(m[1]) : null;
};
function toDate(label) {
  const [month, fy] = (label ?? "").split(",").map((s) => s.trim());
  const m = MONTHS.indexOf((month ?? "").toLowerCase());
  const start = Number((fy ?? "").split("-")[0]);
  if (m < 0 || !start) return null;
  return `${m >= 6 ? start : start + 1}-${String(m + 1).padStart(2, "0")}-01`;
}

// ---------- projects ----------
async function projects() {
  const index = await html(`${CLUB}/services`);
  const cats = [...new Set([...index.matchAll(/\/services\/(\d+)\?/g)].map((m) => m[1]))];
  const ids = new Set();
  for (const c of cats) {
    const page = await html(`${CLUB}/services/${c}`);
    for (const m of page.matchAll(/\/club\/pashupati-kathmandu\/service\/(\d+)/g)) ids.add(m[1]);
  }
  const out = [];
  for (const id of [...ids].sort((a, b) => a - b)) {
    const url = `${CLUB}/service/${id}`;
    const h = await html(url);
    const title = strip(h.match(/<h1 class="card-title[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
    if (!title) continue;
    const sourceCategory = strip(h.match(/<span class="badge bg-primary fs-6 mb-3">([\s\S]*?)<\/span>/)?.[1] ?? "");
    const remote = h.match(/<img src="([^"]+)"\s*\n?\s*id="mainProjectImage"/)?.[1] ?? null;
    const dateLabel = field(h, "Date");
    const ben = field(h, "Beneficiaries");
    out.push({
      source_url: url, title,
      description: strip(h.match(/<div class="description-content[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "") || null,
      source_category: sourceCategory,
      category: CATEGORY_MAP[sourceCategory.toLowerCase()] ?? "Others",
      location: field(h, "Location"),
      date_label: dateLabel, date: toDate(dateLabel),
      impact_metric: ben ? `${ben} beneficiaries` : null,
      image_url: remote && IMG_EXT.test(remote) ? remote : null,
      local_image: await saveImage(remote, "projects"),
    });
    console.log("project", id, title);
  }
  return out;
}

// ---------- people (board / past presidents / members) ----------
const cardImg = (c) => abs(c.match(/<img src="([^"]+)"/)?.[1]);
async function person(c, sub) {
  const g = (k) => strip(c.match(new RegExp(`(?:executive|director|president)-${k}[^>]*>([\\s\\S]*?)</(?:h5|p)>`))?.[1] ?? "");
  const photo = cardImg(c);
  return {
    name: g("name") || c.match(/alt="([^"]+)"/)?.[1] || "",
    role: g("role") || null,
    email: strip(c.match(/email-text">([\s\S]*?)<\/span>/)?.[1] ?? "") || null,
    term: strip(c.match(/Term:<\/strong>\s*([^<]+)/)?.[1] ?? g("term")) || null,
    photo_url: photo, local_photo: await saveImage(photo, sub),
  };
}
const cards = (h) => h.split(/class="(?:executive|director|president)-card/).slice(1);
async function board() {
  const first = await html(`${CLUB}/board`);
  const years = [...first.matchAll(/<option value="(\d{4}-\d{2})"/g)].map((m) => m[1]);
  const res = {};
  for (const y of [...new Set(years)]) {
    const h = await html(`${CLUB}/board?fiscal_year=${y}`);
    res[y] = [];
    for (const c of cards(h)) res[y].push(await person(c, "board"));
    console.log("board", y, res[y].length);
  }
  return res;
}
async function presidents() {
  const out = [];
  for (const c of cards(await html(`${CLUB}/presidents`))) out.push(await person(c, "presidents"));
  return out;
}
async function members() {
  const h = await html(`${CLUB}/members`);
  const seen = new Set();
  const out = [];
  for (const [, rawName, img] of h.matchAll(/data-member-name="([^"]*)"[\s\S]{0,400}?data-member-image="([^"]*)"/g)) {
    const name = strip(rawName);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, photo_url: img || null, local_photo: await saveImage(img || null, "members") });
  }
  return out;
}

// ---------- grants, resources, text pages ----------
async function grants(kind) {
  const h = await html(`${CLUB}/${kind}-grants`);
  const cats = [...new Set([...h.matchAll(new RegExp(`/${kind}-grants/(\\d+)\\?`, "g"))].map((m) => m[1]))];
  const out = [];
  for (const c of cats) {
    const page = await html(`${CLUB}/${kind}-grants/${c}`);
    const links = [...new Set([...page.matchAll(/href="([^"]*\/(?:grant|service)s?\/\d+[^"]*)"/g)].map((m) => abs(m[1])))];
    out.push({ category: c, text: strip(page.replace(/<(script|style|nav|footer|header)[\s\S]*?<\/\1>/g, "")).slice(0, 4000), links });
  }
  return out;
}
async function resources() {
  const out = [];
  for (let p = 1; p <= 20; p++) {
    const h = await html(`${CLUB}/resources?view=grid&page=${p}`);
    const before = out.length;
    for (const m of h.matchAll(/href="([^"]*\/frontend\/download\/[^"]+)"/gi)) {
      const u = abs(m[1]);
      if (!out.some((r) => r.url === u)) out.push({ url: u });
    }
    if (out.length === before) break;
  }
  return out;
}
async function text(page) {
  const h = await html(`${CLUB}/${page}`);
  return strip(h.replace(/<(script|style|nav|footer|header)[\s\S]*?<\/\1>/g, ""));
}

// ---------- run ----------
const sql = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const data = { scraped_at: new Date().toISOString() };
data.projects = await projects();
data.board = await board();
data.presidents = await presidents();
data.members = await members();
data.global_grants = await grants("global");
data.district_grants = await grants("district");
data.resources = await resources();
data.pages = { about: await text("about"), contact: await text("contact") };
data.home = await html(ORIGIN).then((h) => [...h.matchAll(/(?:src|data-src)="([^"]+\.(?:jpe?g|png|webp))"/gi)].map((m) => abs(m[1])));
for (const u of data.home) await saveImage(u, "site");

await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/data.json`, JSON.stringify(data, null, 2));

// SQL: only projects not already in the earlier scrape file; upsert so re-running is safe.
const prior = await readFile("supabase-scraped-data.sql", "utf8").catch(() => "");
const fresh = data.projects.filter((p) => !prior.includes(p.source_url));
const rows = fresh.map((p) =>
  `  (${sql(p.title)}, ${sql(p.description)}, ${sql(p.category)}, ${sql(p.image_url)}, ${p.date ? `'${p.date}'::date` : "null"}, ${sql(p.impact_metric)}, ${sql(p.source_url)}, true)`);
await writeFile(`${OUT}/new-projects.sql`,
  `-- ${fresh.length} projects new since supabase-scraped-data.sql (scraped ${data.scraped_at})\n` +
  (rows.length
    ? `insert into public.projects\n  (title, description, category, image_url, date, impact_metric, source_url, active)\nvalues\n${rows.join(",\n")}\non conflict (source_url) do update set\n  title = excluded.title, description = excluded.description, category = excluded.category,\n  image_url = excluded.image_url, date = excluded.date, impact_metric = excluded.impact_metric;\n`
    : "-- nothing new\n"));

console.log(`done: ${data.projects.length} projects (${fresh.length} new), ${Object.keys(data.board).length} board years, ${data.presidents.length} presidents, ${data.members.length} members, ${data.resources.length} resources, ${images.size} images`);
