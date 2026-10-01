/**
 * GitHub Pages-ზე გამოქვეყნება: სტატიკური ექსპორტი → `gh-pages` ბრანჩი.
 *
 *   npm run deploy
 *
 * მუშაობს ლოკალურადაც (Windows/macOS/Linux) და GitHub Actions-შიც.
 * საბაზისო მისამართი (/<repo>) და საიტის URL `origin`-იდან გამოითვლება;
 * შეცვლა შესაძლებელია PAGES_BASE_PATH / NEXT_PUBLIC_SITE_URL ცვლადებით.
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (args, opts = {}) => execFileSync("git", args, { cwd: root, encoding: "utf8", ...opts }).trim();

// --- საცავი და მისამართები
const remote = process.env.DEPLOY_REPO_URL ?? git(["remote", "get-url", "origin"]);
const match = (process.env.DEPLOY_REPO_URL ? git(["remote", "get-url", "origin"]) : remote).match(
  /github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/,
);
if (!match) throw new Error(`origin არ არის GitHub-ის საცავი: ${remote}`);
const [, owner, repo] = match;
const basePath = process.env.PAGES_BASE_PATH ?? `/${repo}`;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${owner.toLowerCase()}.github.io${basePath}`;

const out = path.join(root, "out");
fs.rmSync(out, { recursive: true, force: true });

console.log(`→ ბილდი: ${siteUrl}`);
// next-ის CLI პირდაპირ node-ით — shell-ის გარეშე, ყველა სისტემაზე ერთნაირად
const build = spawnSync(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    GITHUB_PAGES: "true",
    PAGES_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_TELEMETRY_DISABLED: "1",
  },
});
if (build.status !== 0) process.exit(build.status ?? 1);

/**
 * Next 16-ის ექსპორტი Windows-ზე prefetch-ფაილებს (`__next.<segment>.txt`)
 * ჩადგმულ საქაღალდეებად წერს (`\` ვერ იცვლება `.`-ით), ბრაუზერი კი ბრტყელ
 * სახელებს ითხოვს. Linux-ზე ეს ნაბიჯი არაფერს ცვლის.
 */
function flattenSegments(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (!e.name.startsWith("__next.")) {
      flattenSegments(p);
      continue;
    }
    const files = [];
    (function walk(d, rel) {
      for (const f of fs.readdirSync(d, { withFileTypes: true })) {
        const fp = path.join(d, f.name);
        if (f.isDirectory()) walk(fp, [...rel, f.name]);
        else files.push([fp, [...rel, f.name]]);
      }
    })(p, []);
    for (const [src, rel] of files) fs.copyFileSync(src, path.join(dir, `${e.name}.${rel.join(".")}`));
    fs.rmSync(p, { recursive: true });
  }
}
flattenSegments(out);
// `_next` საქაღალდე Jekyll-მა არ უნდა გამოტოვოს
fs.writeFileSync(path.join(out, ".nojekyll"), "");

// --- გამოქვეყნება ცალკე დროებით საცავში (მთავარი ისტორია არ იცვლება)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gh-pages-"));
fs.cpSync(out, tmp, { recursive: true });
const sha = git(["rev-parse", "--short", "HEAD"]);
const g = (args) => execFileSync("git", args, { cwd: tmp, stdio: ["ignore", "inherit", "inherit"] });
g(["init", "-q", "-b", "gh-pages"]);
g(["-c", "core.autocrlf=false", "add", "-A"]);
g([
  "-c",
  `user.name=${process.env.GIT_AUTHOR_NAME ?? git(["config", "user.name"])}`,
  "-c",
  `user.email=${process.env.GIT_AUTHOR_EMAIL ?? git(["config", "user.email"])}`,
  "commit",
  "-q",
  "-m",
  `Deploy ${sha} to GitHub Pages`,
]);
g(["push", "-q", "-f", remote, "gh-pages"]);
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`✓ გამოქვეყნდა: ${siteUrl}/  (განახლებას GitHub-ზე 1–2 წუთი სჭირდება)`);
