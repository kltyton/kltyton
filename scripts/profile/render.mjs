import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = new URL('../../', import.meta.url);
const profile = JSON.parse(await readFile(new URL('data/profile.json', root), 'utf8'));
const themes = {
  light: { background: '#ffffff', panel: '#f6f8fa', ink: '#1f2328', muted: '#59636e', line: '#d1d9e0', tile: '#eef2f6' },
  dark: { background: '#0d1117', panel: '#161b22', ink: '#f0f6fc', muted: '#9da7b3', line: '#30363d', tile: '#242938' },
};
const font = "'Segoe UI','Microsoft YaHei',system-ui,sans-serif";
const mono = "Consolas,'Liberation Mono',monospace";
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const format = value => new Intl.NumberFormat('en-US').format(value);
const baseStyle = `text{font-family:${font};letter-spacing:0}.muted{fill:var(--muted)}.ink{fill:var(--ink)}.mono{font-family:${mono}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}`;

async function getJson(url) {
  const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '45', '--user-agent', `${profile.username}-profile`, url], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  return JSON.parse(stdout);
}

async function refreshDownloads() {
  const author = await getJson(`https://api.cfwidget.com/author/search/${encodeURIComponent(profile.curseforge.author)}`);
  if (author.username?.toLowerCase() !== profile.curseforge.author.toLowerCase() || !author.projects?.length) {
    throw new Error('CurseForge author response is missing or does not match the configured author.');
  }
  const ids = [...new Set([...author.projects.map(project => project.id), ...profile.curseforge.extraProjectIds])];
  if (ids.some(id => !Number.isSafeInteger(id) || id <= 0)) throw new Error('Invalid CurseForge project ID.');
  const projects = [];
  for (let offset = 0; offset < ids.length; offset += 6) {
    projects.push(...await Promise.all(ids.slice(offset, offset + 6).map(async id => {
      const project = await getJson(`https://api.cfwidget.com/${id}`);
      const downloads = project.downloads?.total;
      const belongsToAuthor = project.members?.some(member => member.username?.toLowerCase() === profile.curseforge.author.toLowerCase());
      if (project.id !== id || !belongsToAuthor || !Number.isSafeInteger(downloads) || downloads < 0) {
        throw new Error(`Invalid project identity, author or download count: ${id}`);
      }
      return { id, title: project.title, downloads, source: `https://api.cfwidget.com/${id}` };
    })));
  }
  projects.sort((left, right) => left.id - right.id);
  return { author: profile.curseforge.author, updatedAt: new Date().toISOString().slice(0, 10), total: projects.reduce((sum, project) => sum + project.downloads, 0), projects };
}

function svg(width, height, theme, label, content, style = '', definitions = '') {
  const colors = themes[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="${escape(label)}"><style>:root{--ink:${colors.ink};--muted:${colors.muted}}${baseStyle}${style}</style><defs>${definitions}</defs>${content}</svg>\n`;
}

function heading(theme, mobile) {
  const width = mobile ? 420 : 840;
  const height = mobile ? 280 : 288;
  const center = width / 2;
  const size = mobile ? 68 : 88;
  const nameY = mobile ? 125 : 140;
  const letter = `<text x="${center}" y="${nameY}" text-anchor="middle" font-size="${size}" font-weight="800">${escape(profile.username)}</text>`;
  const style = `.spectrum{animation:spectrum 7s linear infinite}.scanner{animation:scan 4s ease-in-out infinite}.circuit{animation:circuit 10s linear infinite}.cursor{animation:blink 1.2s steps(1,end) infinite}@keyframes spectrum{to{transform:translateX(${width}px)}}@keyframes scan{0%,100%{transform:translateY(-60px);opacity:0}20%,80%{opacity:.6}90%{transform:translateY(260px);opacity:0}}@keyframes circuit{to{stroke-dashoffset:-2400}}@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}`;
  const gradient = `<linearGradient id="name" gradientUnits="userSpaceOnUse" x1="0" x2="${width}" spreadMethod="repeat"><stop stop-color="#38e8ff"/><stop offset=".33" stop-color="#ff77b7"/><stop offset=".66" stop-color="#ffd064"/><stop offset="1" stop-color="#38e8ff"/></linearGradient><linearGradient id="scan"><stop stop-color="#38e8ff" stop-opacity="0"/><stop offset=".5" stop-color="#38e8ff"/><stop offset="1" stop-color="#ff77b7" stop-opacity="0"/></linearGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="#8192a8" stroke-opacity=".09"/></pattern><clipPath id="letters">${letter}</clipPath><clipPath id="frame"><rect width="${width}" height="${height}" rx="8"/></clipPath>`;
  return svg(width, height, theme, `${profile.username}. ${profile.tagline}. ${profile.description}`, `
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="8" fill="#0b0f16" stroke="#354050"/>
<g clip-path="url(#frame)"><rect width="${width}" height="${height}" fill="url(#grid)"/><path class="scanner" d="M0 0H${width}" stroke="url(#scan)" stroke-width="2"/></g>
<rect class="circuit" x="1" y="1" width="${width - 2}" height="${height - 2}" rx="8" stroke="#38e8ff" stroke-width="1.2" stroke-dasharray="80 2320"/>
<text x="${center}" y="36" text-anchor="middle" font-size="14" fill="#b4c1d3" class="mono">&lt; hello, world /&gt;</text>
<g fill="url(#name)">${letter}</g>
<g clip-path="url(#letters)"><rect class="spectrum" x="${-width}" y="48" width="${width * 3}" height="120" fill="url(#name)"/></g>
<text x="${center}" y="${mobile ? 169 : 186}" text-anchor="middle" font-size="${mobile ? 16 : 20}" font-weight="600" fill="#f0f6fc">${escape(profile.tagline)}</text>
<text x="${center}" y="${mobile ? 207 : 224}" text-anchor="middle" font-size="16" fill="#c3cede">${escape(profile.description)}</text>
<text x="${center}" y="${height - 25}" text-anchor="middle" font-size="${mobile ? 12 : 14}" fill="#70edbb" class="mono">&gt; build ideas. ship useful things.<tspan class="cursor">_</tspan></text>`, style, gradient);
}

async function iconMarkup(item, x, y, size, theme, prefix) {
  const colors = themes[theme];
  if (!item.icon) {
    return `<g><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="8" fill="${colors.tile}"/><text x="${x + size / 2}" y="${y + size * .68}" text-anchor="middle" fill="${item.color}" font-family="${mono}" font-weight="800" font-size="${size * .5}">${escape(item.mark)}</text></g>`;
  }
  const source = await readFile(new URL(`assets/icons/${item.icon}.svg`, root), 'utf8');
  const opening = source.match(/<svg\b[^>]*>/)?.[0];
  if (!opening || !source.trim().endsWith('</svg>')) throw new Error(`Invalid SVG icon: ${item.icon}`);
  const viewBox = opening.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`SVG icon has no viewBox: ${item.icon}`);
  let body = source.slice(source.indexOf(opening) + opening.length, source.lastIndexOf('</svg>'));
  const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  for (const id of ids) {
    body = body.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`).replaceAll(`url(#${id})`, `url(#${prefix}-${id})`).replaceAll(`href="#${id}"`, `href="#${prefix}-${id}"`);
  }
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}">${body}</svg>`;
}

async function stack(theme, mobile) {
  const width = mobile ? 420 : 840;
  const colors = themes[theme];
  const icon = mobile ? 50 : 52;
  let y = 28;
  let body = '';
  for (const [groupIndex, group] of profile.groups.entries()) {
    const columns = mobile ? (group.items.length === 4 ? 4 : 3) : group.items.length;
    const cell = (width - 40) / columns;
    const accent = theme === 'light' ? { '#fbbf24': '#916000', '#34d399': '#067647', '#38bdf8': '#0877a1' }[group.color] : group.color;
    body += `<text x="20" y="${y}" font-size="18" font-weight="700" class="ink">${escape(group.title)}</text><text x="${width - 20}" y="${y}" text-anchor="end" font-size="12" font-weight="700" fill="${accent}">${group.subtitle}</text>`;
    const start = y + 20;
    for (const [index, item] of group.items.entries()) {
      const cx = 20 + (index % columns) * cell + cell / 2;
      const top = start + Math.floor(index / columns) * 88;
      body += `<g class="tech" style="animation-delay:-${index * .4}s">${await iconMarkup(item, cx - icon / 2, top, icon, theme, `g${groupIndex}-i${index}`)}</g>`;
      const lines = mobile && item.name === 'GitHub Actions' ? ['GitHub', 'Actions'] : [item.name];
      body += `<text x="${cx}" y="${top + icon + 20}" text-anchor="middle" font-size="14" font-weight="600" fill="${colors.ink}">${lines.map((line, i) => `<tspan x="${cx}" dy="${i ? 16 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
    }
    y = start + Math.ceil(group.items.length / columns) * 88 + 28;
    if (groupIndex < profile.groups.length - 1) body += `<path d="M20 ${y - 18}H${width - 20}" stroke="${colors.line}"/>`;
  }
  return svg(width, y - 12, theme, profile.groups.map(group => `${group.title}: ${group.items.map(item => item.name).join(', ')}`).join('; '), body, '.tech{animation:float 4s ease-in-out infinite}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}');
}

function downloads(theme, mobile, snapshot) {
  const width = mobile ? 420 : 840;
  const height = mobile ? 186 : 134;
  const colors = themes[theme];
  const total = format(snapshot.total);
  const forge = 'M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857-2.0565.65-4.1245 1.6651-5.7344 3.2857h10.9248l-1.0288-3.2726s-7.918-4.6688-.8336-7.1127z';
  return svg(width, height, theme, `CurseForge: ${total} downloads across ${snapshot.projects.length} projects, ${snapshot.updatedAt}.`, `
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="8" fill="${colors.panel}" stroke="${colors.line}"/>
<path d="${forge}" transform="translate(24 ${mobile ? 29 : 48}) scale(2)" fill="#f16436"/>
<text x="90" y="${mobile ? 44 : 57}" class="ink" font-size="18" font-weight="700">CurseForge</text>
<text x="90" y="${mobile ? 66 : 81}" class="muted" font-size="13">${snapshot.projects.length} 个项目 · 总下载量</text>
<text x="${mobile ? 24 : width - 24}" y="${mobile ? 130 : 83}" text-anchor="${mobile ? 'start' : 'end'}" font-size="${mobile ? 48 : 52}" font-weight="800" fill="url(#count)">${total}</text>
<text x="${width - 24}" y="${height - 15}" text-anchor="end" font-size="11" class="muted">${snapshot.updatedAt} · CFWidget</text>`, '', '<linearGradient id="count"><stop stop-color="#f58b43"/><stop offset="1" stop-color="#e55b96"/></linearGradient>');
}

function footer(theme, mobile) {
  const width = mobile ? 420 : 840;
  const colors = themes[theme];
  let waves = '';
  for (const [index, color] of ['#34d399', '#38bdf8', '#f472b6'].entries()) {
    const base = 46 + index * 9;
    const d = `M0 ${base}Q${width / 4} ${base - 26} ${width / 2} ${base}T${width} ${base}T${width * 1.5} ${base}T${width * 2} ${base}V100H0Z`;
    waves += `<path class="wave w${index}" d="${d}" fill="${color}" opacity="${.18 + index * .06}"/>`;
  }
  return svg(width, 80, theme, '', `<g>${waves}</g><text x="${width / 2}" y="24" text-anchor="middle" font-family="${mono}" font-size="14" fill="${colors.ink}">See you in the next commit.</text>`, `.wave{animation:flow 8s linear infinite}.w1{animation-duration:12s}.w2{animation-duration:16s}@keyframes flow{to{transform:translateX(-${width}px)}}`);
}

async function main() {
  const refresh = process.argv.includes('--refresh');
  if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Usage: node scripts/profile/render.mjs [--refresh]');
  const snapshot = refresh ? await refreshDownloads() : JSON.parse(await readFile(new URL('data/downloads.json', root), 'utf8'));
  if (snapshot.author !== profile.curseforge.author || !snapshot.projects?.length || snapshot.total !== snapshot.projects.reduce((sum, project) => sum + project.downloads, 0)) {
    throw new Error('Download snapshot is incomplete or belongs to a different author.');
  }
  const files = [];
  for (const theme of Object.keys(themes)) {
    for (const mobile of [false, true]) {
      const suffix = `${theme}${mobile ? '-mobile' : ''}`;
      files.push([`header-${suffix}.svg`, heading(theme, mobile)], [`stack-${suffix}.svg`, await stack(theme, mobile)], [`downloads-${suffix}.svg`, downloads(theme, mobile, snapshot)], [`footer-${suffix}.svg`, footer(theme, mobile)]);
    }
  }
  await mkdir(new URL('assets/profile/', root), { recursive: true });
  for (const [name, content] of files) await writeFile(new URL(`assets/profile/${name}`, root), content);
  if (refresh) await writeFile(new URL('data/downloads.json', root), `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`${profile.username}: ${files.length} SVGs, ${snapshot.projects.length} projects, ${format(snapshot.total)} downloads -> ${fileURLToPath(new URL('assets/profile/', root))}`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
