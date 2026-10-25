const FONT = "'Segoe UI','Yu Gothic UI',Meiryo,system-ui,sans-serif";
const MONO = "'Cascadia Code',Consolas,'Liberation Mono',monospace";
const PALETTES = {
  dark: { ink: '#eef3fc', muted: '#a6b1c3', surface: '#15171e', surfaceEnd: '#1b1925', line: '#333743', tile: '#272b37', gloss: '.24', accent: ['#ffd474', '#89e8b6', '#89d8ff'] },
  light: { ink: '#202734', muted: '#596575', surface: '#f5f8fc', surfaceEnd: '#f8f4fb', line: '#d5deea', tile: '#e7edf6', gloss: '.5', accent: ['#8b5b00', '#08704c', '#156489'] },
};
const xml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const number = value => new Intl.NumberFormat('en-US').format(value);
const commonCSS = `text{font-family:${FONT};letter-spacing:0}.mono{font-family:${MONO}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}`;

function image(width, height, label, body, definitions, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="${xml(label)}"><style>${commonCSS}${css}</style><defs>${definitions}</defs>${body}</svg>\n`;
}

function prism(id, width) {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" x2="${width}" spreadMethod="repeat"><stop stop-color="#ffc55d"/><stop offset=".24" stop-color="#ff78b6"/><stop offset=".48" stop-color="#c19aff"/><stop offset=".72" stop-color="#35d9ef"/><stop offset=".87" stop-color="#a3e46d"/><stop offset="1" stop-color="#ffc55d"/></linearGradient>`;
}

function edge(width, height, color, radius = 8) {
  return `<rect class="edge" x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}" stroke="${color}" stroke-width="1" pathLength="100" stroke-dasharray="9 91"/>`;
}

function header(profile, mobile) {
  const width = mobile ? 420 : 840;
  const height = mobile ? 300 : 310;
  const center = width / 2;
  const size = mobile ? 80 : 112;
  const titleY = mobile ? 118 : 142;
  const title = `<text x="${center}" y="${titleY}" font-size="${size}" font-weight="800" text-anchor="middle">${xml(profile.username)}</text>`;
  const barY = mobile ? 233 : 239;
  const barX = mobile ? 24 : 76;
  const barWidth = width - barX * 2;
  const intro = mobile ? profile.descriptionLines.map((line, index) => `<text x="${center}" y="${167 + index * 26}" text-anchor="middle" font-size="16" fill="#e2e8f3">${xml(line)}</text>`).join('') : `<text x="${center}" y="196" text-anchor="middle" font-size="18" fill="#e2e8f3">${xml(profile.description)}</text>`;
  const contexts = profile.contexts.map((line, index) => `<text class="context c${index} mono" x="${barX + 17}" y="${barY + 28}" font-size="${mobile ? 12 : 15}" fill="#f0e9ff">${xml(line)}</text>`).join('');
  const definitions = `${prism('prism', width)}
<linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff9c6b" stop-opacity=".02"/><stop offset=".36" stop-color="#ff76b0" stop-opacity=".25"/><stop offset=".68" stop-color="#39d8ec" stop-opacity=".22"/><stop offset="1" stop-color="#b8ec68" stop-opacity=".02"/></linearGradient>
<linearGradient id="sheen"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="weave" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M0 16L16 0M16 32L32 16" stroke="#fff" stroke-opacity=".025"/></pattern>
<clipPath id="frame"><rect width="${width}" height="${height}" rx="8"/></clipPath><clipPath id="word">${title}</clipPath>
<filter id="glow" x="-30%" y="-40%" width="160%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`;
  const body = `<rect width="${width}" height="${height}" rx="8" fill="#101219"/>
<g clip-path="url(#frame)"><rect width="${width}" height="${height}" fill="url(#weave)"/>
<path class="ribbon" d="M-160 340L260 -80H430L10 340ZM400 380L860 -80H1030L570 380Z" fill="url(#ribbon)"/>
<path class="wire" d="M-80 280L270 -70M100 360L550 -90M530 390L970 -50" stroke="url(#prism)" stroke-opacity=".26" stroke-width="1"/>
<path d="M0 64L${width} 64M0 ${height - 63}L${width} ${height - 63}" stroke="#fff" stroke-opacity=".035"/></g>
<g fill="url(#prism)" opacity=".38" filter="url(#glow)">${title}</g>
<g fill="url(#prism)">${title}</g>
<g clip-path="url(#word)"><rect class="color-flow" x="${-width}" y="22" width="${width * 3}" height="150" fill="url(#prism)"/></g>
${intro}
<rect x="${barX}" y="${barY}" width="${barWidth}" height="43" rx="6" fill="#ffffff" fill-opacity=".035" stroke="#c8d4ed" stroke-opacity=".15"/>
${contexts}
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="8" stroke="#4b5163" stroke-opacity=".65"/>
${edge(width, height, 'url(#prism)')}`;
  const css = `.color-flow{animation:color-flow 8s linear infinite}.ribbon{animation:ribbon 16s ease-in-out infinite alternate}.wire{animation:wire 12s ease-in-out infinite alternate}.edge{animation:edge 12s linear infinite}.context{opacity:0}.c0{opacity:1;animation:context0 12s infinite}.c1{animation:context1 12s infinite}.c2{animation:context2 12s infinite}@keyframes color-flow{to{transform:translateX(${width}px)}}@keyframes ribbon{to{transform:translate(52px,-18px)}}@keyframes wire{to{transform:translateX(-34px)}}@keyframes edge{to{stroke-dashoffset:-100}}@keyframes context0{0%,28%,100%{opacity:1;transform:translateY(0)}32%,96%{opacity:0;transform:translateY(-8px)}}@keyframes context1{0%,31%,64%,100%{opacity:0;transform:translateY(8px)}35%,60%{opacity:1;transform:translateY(0)}}@keyframes context2{0%,64%,100%{opacity:0;transform:translateY(8px)}68%,94%{opacity:1;transform:translateY(0)}}`;
  return image(width, height, `${profile.username}. ${profile.description}`, body, definitions, css);
}

function sourceIcon(source, prefix, color = '#fff', inset = 0) {
  const opening = source.match(/<svg\b[^>]*>/)?.[0];
  const viewBox = opening?.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox || !source.trim().endsWith('</svg>')) throw new Error(`Invalid icon SVG: ${prefix}`);
  let body = source.slice(source.indexOf(opening) + opening.length, source.lastIndexOf('</svg>'));
  for (const [, id] of [...body.matchAll(/\bid="([^"]+)"/g)]) {
    body = body.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`).replaceAll(`url(#${id})`, `url(#${prefix}-${id})`).replaceAll(`href="#${id}"`, `href="#${prefix}-${id}"`);
  }
  return `<svg x="${inset}" y="${inset}" width="${64 - inset * 2}" height="${64 - inset * 2}" viewBox="${viewBox}" fill="${color}">${body}</svg>`;
}

function tile(item, source, prefix, x, y, index, palette) {
  const face = sourceIcon(source, prefix, item.color, item.inset);
  return `<g transform="translate(${x} ${y})"><g class="tile" style="animation-delay:-${index * .31}s">
<defs><clipPath id="${prefix}-clip"><rect width="64" height="64" rx="8"/></clipPath></defs>
<rect width="64" height="64" rx="8" fill="${palette.tile}"/>
<g clip-path="url(#${prefix}-clip)">${face}<rect width="64" height="64" fill="url(#gloss)"/><path class="shine" style="animation-delay:-${index * .37}s" d="M-44 -14L-10 -14L94 90L60 90Z" fill="url(#tile-shine)"/></g>
<rect x=".5" y=".5" width="63" height="63" rx="7.5" stroke="#fff" stroke-opacity=".18"/>
<rect class="rim" style="animation-delay:-${index * .53}s" x=".5" y=".5" width="63" height="63" rx="7.5" stroke="url(#tile-rim)" stroke-width="1" pathLength="100" stroke-dasharray="16 84"/>
</g></g>`;
}

function stack(profile, icons, theme, mobile) {
  const palette = PALETTES[theme];
  const width = mobile ? 420 : 840;
  let top = 0;
  let body = '';
  let index = 0;
  for (const [groupIndex, group] of profile.groups.entries()) {
    const columns = mobile ? (group.items.length === 4 ? 4 : 3) : group.items.length;
    const rows = Math.ceil(group.items.length / columns);
    const rowHeight = 104;
    const height = 52 + rows * rowHeight;
    const cell = (width - 48) / columns;
    body += `<rect y="${top}" width="${width}" height="${height}" fill="url(#surface)"/>
<text x="24" y="${top + 29}" fill="${palette.ink}" font-size="18" font-weight="700">${xml(group.title)}</text>
<path d="M${width - 118} ${top + 24}H${width - 24}" stroke="${palette.accent[groupIndex]}" stroke-opacity=".22"/>
<path d="M0 ${top + height - .5}H${width}" stroke="${palette.line}"/>`;
    for (const [itemIndex, item] of group.items.entries()) {
      const center = 24 + (itemIndex % columns) * cell + cell / 2;
      const y = top + 49 + Math.floor(itemIndex / columns) * rowHeight;
      const size = mobile ? 58 : 64;
      const source = item.icon ? icons[item.icon] : undefined;
      const prefix = `g${groupIndex}i${itemIndex}`;
      body += `<g transform="translate(${center - size / 2} ${y}) scale(${size / 64})">${tile(item, source, prefix, 0, 0, index++, palette)}</g>`;
      const lines = mobile && item.name === 'GitHub Actions' ? ['GitHub', 'Actions'] : [item.name];
      body += `<text x="${center}" y="${y + size + 21}" text-anchor="middle" font-size="${mobile ? 14 : 13}" font-weight="600" fill="${palette.ink}">${lines.map((line, lineIndex) => `<tspan x="${center}" dy="${lineIndex ? 16 : 0}">${xml(line)}</tspan>`).join('')}</text>`;
    }
    top += height + 12;
  }
  const definitions = `<linearGradient id="surface" x1="0" x2="1" y2=".65"><stop stop-color="${palette.surface}"/><stop offset="1" stop-color="${palette.surfaceEnd}"/></linearGradient>
<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff" stop-opacity="${palette.gloss}"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".13"/></linearGradient>
<linearGradient id="tile-shine"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
${prism('tile-rim', 64)}`;
  const css = '.tile{transform-box:fill-box;transform-origin:center;animation:lift 5s ease-in-out infinite;filter:drop-shadow(0 5px 5px #0003)}.shine{animation:shine 5.4s ease-in-out infinite}.rim{animation:rim 9s linear infinite}@keyframes lift{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-5px) rotate(1deg)}}@keyframes shine{0%,12%{transform:translateX(-96px)}42%,100%{transform:translateX(96px)}}@keyframes rim{to{stroke-dashoffset:-100}}';
  return image(width, top - 12, profile.groups.map(group => `${group.title}: ${group.items.map(item => item.name).join(', ')}`).join('; '), body, definitions, css);
}

function rollingNumber(total, right, baseline, size) {
  const formatted = number(total);
  const digitWidth = size * .64;
  const commaWidth = size * .28;
  const step = size * 1.3;
  const width = [...formatted].reduce((sum, character) => sum + (character === ',' ? commaWidth : digitWidth), 0);
  const left = right - width;
  let x = left;
  let body = '';
  let order = 0;
  const rules = new Set();
  for (const character of formatted) {
    if (character === ',') {
      body += `<text x="${x}" y="${baseline}" class="count">,</text>`;
      x += commaWidth;
      continue;
    }
    const target = 20 + Number(character);
    const distance = target * step;
    rules.add(`@keyframes digit${character}{from{transform:translateY(0)}to{transform:translateY(-${distance}px)}}`);
    body += `<g style="transform:translateY(-${distance}px);animation:digit${character} ${1.25 + order * .12}s cubic-bezier(.16,1,.3,1) ${.1 + order * .04}s both">${Array.from({ length: 30 }, (_, row) => `<text x="${x}" y="${baseline + row * step}" class="count">${row % 10}</text>`).join('')}</g>`;
    x += digitWidth;
    order++;
  }
  return { body: `<g clip-path="url(#digits)">${body}</g>`, rules: [...rules].join(''), clip: `<clipPath id="digits"><rect x="${left - 3}" y="${baseline - size}" width="${width + 6}" height="${step}"/></clipPath>` };
}

function downloads(snapshot, theme, mobile, platform, icons) {
  const palette = PALETTES[theme];
  const width = mobile ? 420 : 840;
  const height = mobile ? 214 : 166;
  const size = mobile ? 50 : 64;
  const baseline = mobile ? 147 : 112;
  const isModrinth = platform === 'Modrinth';
  const accent = isModrinth ? '#1bd96a' : '#ff7847';
  const countStart = isModrinth ? (theme === 'dark' ? '#63ed99' : '#087744') : (theme === 'dark' ? '#ff9f50' : '#ba4219');
  const countEnd = isModrinth ? (theme === 'dark' ? '#4ed6e6' : '#087487') : (theme === 'dark' ? '#ff75b1' : '#b42777');
  const counterWidth = [...number(snapshot.total)].reduce((sum, character) => sum + size * (character === ',' ? .28 : .64), 0);
  const counter = rollingNumber(snapshot.total, mobile ? (width + counterWidth) / 2 : width - 28, baseline, size);
  const brandX = mobile ? 100 : 114;
  const brandY = mobile ? 49 : 72;
  const forge = 'M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857-2.0565.65-4.1245 1.6651-5.7344 3.2857h10.9248l-1.0288-3.2726s-7.918-4.6688-.8336-7.1127z';
  const definitions = `<linearGradient id="surface" x1="0" x2="1" y2=".5"><stop stop-color="${palette.surface}"/><stop offset="1" stop-color="${palette.surfaceEnd}"/></linearGradient><linearGradient id="count"><stop stop-color="${countStart}"/><stop offset="1" stop-color="${countEnd}"/></linearGradient>${prism('rim', width)}${counter.clip}<clipPath id="card"><rect width="${width}" height="${height}" rx="8"/></clipPath>`;
  const body = `<rect width="${width}" height="${height}" rx="8" fill="url(#surface)"/>
<g clip-path="url(#card)"><path class="trace" d="M-80 ${height}L120 -40M540 220L800 -40" stroke="url(#rim)" stroke-width="28" stroke-opacity=".035"/></g>
<rect x="24" y="${mobile ? 24 : 45}" width="64" height="64" rx="8" fill="${palette.tile}" stroke="${accent}" stroke-opacity=".35"/>
${isModrinth ? `<g transform="translate(24 ${mobile ? 24 : 45})">${sourceIcon(icons.Modrinth, 'modrinth-mark', accent, 10)}</g>` : `<path d="${forge}" transform="translate(32 ${mobile ? 36 : 57}) scale(2)" fill="${accent}"/>`}
<text x="${brandX}" y="${brandY}" font-size="21" font-weight="700" fill="${palette.ink}">${platform}</text>
<text x="${brandX}" y="${brandY + 25}" font-size="${mobile ? 12 : 13}" fill="${palette.muted}">${snapshot.projects.length} projects · total downloads</text>
${counter.body}
<text x="${width - 24}" y="${height - 15}" text-anchor="end" font-size="11" fill="${palette.muted}">${snapshot.updatedAt} · ${isModrinth ? 'Modrinth API' : 'CFWidget'}</text>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="8" stroke="${palette.line}"/>
${edge(width, height, 'url(#rim)')}`;
  const css = `.count{font-family:${FONT};font-variant-numeric:tabular-nums;font-size:${size}px;font-weight:800;fill:url(#count)}.edge{animation:edge 11s linear infinite}.trace{animation:trace 15s ease-in-out infinite alternate}@keyframes edge{to{stroke-dashoffset:-100}}@keyframes trace{to{transform:translateX(60px)}}${counter.rules}`;
  return image(width, height, `${platform}: ${number(snapshot.total)} downloads, ${snapshot.projects.length} projects. Updated ${snapshot.updatedAt}.`, body, definitions, css);
}

function footer(mobile) {
  const width = mobile ? 420 : 840;
  const height = 70;
  const body = ['#71dfb3', '#40cee7', '#ee8dcd'].map((color, index) => {
    const base = 25 + index * 10;
    return `<path class="wave w${index}" d="M0 ${height}V${base}Q${width / 4} ${base - 23} ${width / 2} ${base}T${width} ${base}T${width * 1.5} ${base}T${width * 2} ${base}V${height}Z" fill="${color}" opacity="${.18 + index * .07}"/>`;
  }).join('');
  return image(width, height, '', body, '', `.wave{animation:wave 10s linear infinite}.w1{animation-duration:14s}.w2{animation-duration:18s}@keyframes wave{to{transform:translateX(-${width}px)}}`);
}

export function renderProfile(profile, snapshot, icons) {
  const files = [];
  for (const theme of Object.keys(PALETTES)) {
    for (const mobile of [false, true]) {
      const suffix = `${theme}${mobile ? '-mobile' : ''}`;
      files.push([`header-${suffix}.svg`, header(profile, mobile)], [`stack-${suffix}.svg`, stack(profile, icons, theme, mobile)], [`downloads-${suffix}.svg`, downloads(snapshot.curseforge, theme, mobile, 'CurseForge', icons)], [`modrinth-${suffix}.svg`, downloads(snapshot.modrinth, theme, mobile, 'Modrinth', icons)], [`footer-${suffix}.svg`, footer(mobile)]);
    }
  }
  return files;
}
