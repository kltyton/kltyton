const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Yu Gothic UI',Meiryo,system-ui,sans-serif";
const THEMES = {
  light: { ink: '#1d1d1f', secondary: '#59636e', shadow: '#647080', highlight: '#ffffff', highlightOpacity: '.9', rim: '#bac3ce', rimOpacity: '.38', glass: '#e9eef5', glassOpacity: '.35', tintOpacity: '.17', glossOpacity: '.7' },
  dark: { ink: '#f7f8fa', secondary: '#aeb8c5', shadow: '#000000', highlight: '#e1ebff', highlightOpacity: '.08', rim: '#c5d4e8', rimOpacity: '.17', glass: '#64748b', glassOpacity: '.09', tintOpacity: '.18', glossOpacity: '.12' },
};
const ICON_COLORS = {
  'Java-Dark': ['#e88853', '#a74f21', '#ffb78e'], CS: ['#b18ce6', '#7545b4', '#d1b1ff'],
  JavaScript: ['#e7c95c', '#826500', '#f4db82'], 'Python-Dark': ['#73b3d5', '#32769b', '#9dd8f4'],
  HTML: ['#ef9977', '#b9532c', '#ffbaa0'], CSS: ['#75b6e7', '#2874ac', '#a2d5ff'],
  ForgeMC: ['#95a9bc', '#4d657d', '#c1d1e4'], FabricMC: ['#cbb58b', '#85704d', '#e7d0a3'],
  NeoForge: ['#e9a16d', '#a95e2a', '#ffc18d'], Mixin: ['#9ec8a0', '#507e53', '#bce5be'],
  'Gradle-Dark': ['#8bbdb5', '#3c7a70', '#b4e4d9'], DotNet: ['#a69fe1', '#6554b1', '#c8bdff'],
  Git: ['#e89a91', '#b14e44', '#ffb5ab'], 'GithubActions-Dark': ['#8ab8ec', '#3978ba', '#b0d6ff'],
  'Powershell-Dark': ['#8ba8e9', '#486fba', '#b1caff'], Blockbench: ['#7fc7df', '#32849e', '#a7e8f9'],
};
const xml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const number = value => new Intl.NumberFormat('en-US').format(value);
const motionCSS = '.profile-icon{animation:icon-breathe 9s ease-in-out infinite}@keyframes icon-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}';

function layout(profile, mobile) {
  const width = mobile ? 420 : 840;
  let top = mobile ? 312 : 336;
  const groups = profile.groups.map(group => {
    const columns = mobile ? (group.items.length === 4 ? 4 : 3) : group.items.length;
    const entry = { group, columns, top };
    top += mobile ? 48 + Math.ceil(group.items.length / columns) * 104 : 146;
    return entry;
  });
  const statistics = mobile ? 244 : 184;
  const footer = 64;
  return { width, mobile, inset: mobile ? 28 : 40, overview: top, statistics, footer, groups };
}

function surfaceDefinitions(theme) {
  const palette = THEMES[theme];
  return `<linearGradient id="rim" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="${palette.highlight}" stop-opacity="${palette.highlightOpacity}"/><stop offset=".5" stop-color="${palette.rim}" stop-opacity="${palette.rimOpacity}"/><stop offset="1" stop-color="${palette.highlight}" stop-opacity="${Number(palette.highlightOpacity) * .5}"/></linearGradient>
<linearGradient id="surface" x2="0" y2="1"><stop stop-color="${palette.glass}" stop-opacity="${palette.glassOpacity}"/><stop offset="1" stop-color="${palette.glass}" stop-opacity="${Number(palette.glassOpacity) * .45}"/></linearGradient>
<linearGradient id="gloss" x2=".25" y2="1"><stop stop-color="${palette.highlight}" stop-opacity="${palette.glossOpacity}"/><stop offset=".5" stop-color="${palette.highlight}" stop-opacity="0"/></linearGradient>
<filter id="jelly-shadow" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="3" dy="5" stdDeviation="3.5" flood-color="${palette.shadow}" flood-opacity="${theme === 'dark' ? '.34' : '.15'}"/><feDropShadow dx="-3" dy="-3" stdDeviation="3" flood-color="${palette.highlight}" flood-opacity="${palette.highlightOpacity}"/></filter>
<filter id="surface-shadow" x="-10%" y="-30%" width="120%" height="170%"><feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="${palette.shadow}" flood-opacity="${theme === 'dark' ? '.25' : '.1'}"/><feDropShadow dx="-3" dy="-3" stdDeviation="5" flood-color="${palette.highlight}" flood-opacity="${palette.highlightOpacity}"/></filter>`;
}

function canvas(design, height, theme, label, body, definitions = '', css = '') {
  const palette = THEMES[theme];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${design.width}" height="${height}" viewBox="0 0 ${design.width} ${height}" fill="none" role="img" aria-label="${xml(label)}"><style>text{font-family:${FONT};letter-spacing:0}.ink{fill:${palette.ink}}.secondary{fill:${palette.secondary}}${motionCSS}${css}</style><defs>${surfaceDefinitions(theme)}${definitions}</defs>${body}</svg>\n`;
}

function sourceIcon(source, prefix, color = '#fff', inset = 0) {
  const opening = source.match(/<svg\b[^>]*>/)?.[0];
  const viewBox = opening?.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox || !source.trim().endsWith('</svg>')) throw new Error(`Invalid icon SVG: ${prefix}`);
  let body = source.slice(source.indexOf(opening) + opening.length, source.lastIndexOf('</svg>'));
  for (const [, id] of [...body.matchAll(/\bid="([^"]+)"/g)]) {
    body = body.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`).replaceAll(`url(#${id})`, `url(#${prefix}-${id})`).replaceAll(`href="#${id}"`, `href="#${prefix}-${id}"`);
  }
  return `<svg x="${inset}" y="${inset}" width="${64 - inset * 2}" height="${64 - inset * 2}" viewBox="${viewBox}" fill="${color}" color="${color}">${body}</svg>`;
}

function jellyIcon(item, source, prefix, theme) {
  const palette = THEMES[theme];
  const [tint, lightInk, darkInk] = ICON_COLORS[item.icon];
  const foreground = theme === 'dark' ? darkInk : lightInk;
  return `<defs><linearGradient id="${prefix}-tint" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="${tint}" stop-opacity="${palette.tintOpacity}"/><stop offset="1" stop-color="${tint}" stop-opacity="${Number(palette.tintOpacity) * .4}"/></linearGradient></defs>
<rect width="64" height="64" rx="18" fill="url(#${prefix}-tint)" filter="url(#jelly-shadow)"/>
<rect x=".5" y=".5" width="63" height="63" rx="17.5" fill="url(#gloss)" stroke="url(#rim)"/>
${sourceIcon(source, prefix, foreground, 8)}`;
}

function identity(profile, design, theme) {
  const { width, mobile } = design;
  const x = mobile ? 16 : 24;
  const frameHeight = mobile ? 256 : 280;
  const colors = theme === 'dark' ? ['#ffb18d', '#f493ce', '#b7a4ff', '#76d7ec', '#a6deaa', '#ffb18d'] : ['#a64d23', '#b52c7c', '#7751bd', '#11799b', '#318047', '#a64d23'];
  const name = `<text x="${width / 2}" y="${mobile ? 112 : 132}" text-anchor="middle" font-size="${mobile ? 80 : 112}" font-weight="750">${xml(profile.username)}</text>`;
  const definitions = `<linearGradient id="name-prism" gradientUnits="userSpaceOnUse" x1="0" x2="${width}" spreadMethod="repeat">${colors.map((color, index) => `<stop offset="${index / (colors.length - 1)}" stop-color="${color}"/>`).join('')}</linearGradient><clipPath id="name-word">${name}</clipPath>`;
  let body = `<rect x="${x}" y="16" width="${width - x * 2}" height="${frameHeight}" rx="28" fill="url(#surface)" filter="url(#surface-shadow)"/>
<rect x="${x + .5}" y="16.5" width="${width - x * 2 - 1}" height="${frameHeight - 1}" rx="27.5" fill="url(#gloss)" stroke="url(#rim)"/>
<rect class="name-edge" x="${x + .5}" y="16.5" width="${width - x * 2 - 1}" height="${frameHeight - 1}" rx="27.5" stroke="url(#name-prism)" stroke-width="1.2" pathLength="100" stroke-dasharray="12 88"/>
<g fill="url(#name-prism)">${name}</g><g clip-path="url(#name-word)"><rect class="name-flow" x="${-width}" width="${width * 3}" height="180" fill="url(#name-prism)"/></g>
<text x="${width / 2}" y="${mobile ? 157 : 185}" text-anchor="middle" class="ink" font-size="${mobile ? 19 : 20}">${xml(profile.description)}</text>`;
  for (const [index, context] of profile.contexts.entries()) {
    body += `<text class="profile-context secondary" x="${width / 2}" y="${(mobile ? 198 : 218) + index * 23}" text-anchor="middle" font-size="13">${xml(context.replace(' / ', ' · '))}</text>`;
  }
  const css = `.name-flow{animation:name-flow 18s linear infinite}.name-edge{animation:name-edge 18s linear infinite}@keyframes name-flow{to{transform:translateX(${width}px)}}@keyframes name-edge{to{stroke-dashoffset:-100}}`;
  return { body, definitions, css };
}

function overview(profile, icons, design, theme) {
  const { width, inset, mobile } = design;
  const name = identity(profile, design, theme);
  let body = name.body;
  let order = 0;
  for (const [groupIndex, entry] of design.groups.entries()) {
    const { group, columns, top } = entry;
    const cell = (width - inset * 2) / columns;
    const iconSize = mobile ? 56 : 64;
    body += `<text x="${inset}" y="${top}" class="ink" font-size="19" font-weight="600">${xml(group.title)}</text>`;
    for (const [index, item] of group.items.entries()) {
      const center = inset + (index % columns) * cell + cell / 2;
      const y = top + 26 + Math.floor(index / columns) * 104;
      body += `<g transform="translate(${center - iconSize / 2} ${y}) scale(${iconSize / 64})"><g class="profile-icon" style="animation-delay:-${order++ * .43}s">${jellyIcon(item, icons[item.icon], `g${groupIndex}i${index}`, theme)}</g></g>`;
      const lines = mobile && item.name === 'GitHub Actions' ? ['GitHub', 'Actions'] : [item.name];
      body += `<text x="${center}" y="${y + iconSize + 20}" text-anchor="middle" class="ink" font-size="${mobile ? 14 : 13}" font-weight="500">${lines.map((line, lineIndex) => `<tspan x="${center}" dy="${lineIndex ? 16 : 0}">${xml(line)}</tspan>`).join('')}</text>`;
    }
  }
  const label = `${profile.username}. ${profile.description}. ${profile.groups.map(group => `${group.title}: ${group.items.map(item => item.name).join(', ')}`).join('; ')}`;
  return canvas(design, design.overview, theme, label, body, name.definitions, name.css);
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

function downloads(snapshot, platform, icons, design, theme) {
  const { width, mobile, inset } = design;
  const height = design.statistics;
  const cardX = mobile ? 16 : 24;
  const cardWidth = width - cardX * 2;
  const cardHeight = height - 16;
  const size = mobile ? 48 : 54;
  const baseline = mobile ? 164 : 117;
  const digitsWidth = [...number(snapshot.total)].reduce((sum, character) => sum + size * (character === ',' ? .28 : .64), 0);
  const counter = rollingNumber(snapshot.total, mobile ? (width + digitsWidth) / 2 : width - inset, baseline, size);
  const isModrinth = platform === 'Modrinth';
  const accent = isModrinth ? '#1abd83' : '#ef794c';
  const forge = 'M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857-2.0565.65-4.1245 1.6651-5.7344 3.2857h10.9248l-1.0288-3.2726s-7.918-4.6688-.8336-7.1127z';
  const mark = isModrinth ? sourceIcon(icons.Modrinth, 'platform-mark', accent, 5) : `<path d="${forge}" transform="translate(1 10) scale(2.6)" fill="${accent}"/>`;
  const definitions = counter.clip;
  const brandX = mobile ? 98 : 116;
  const body = `<rect x="${cardX}" y="8" width="${cardWidth}" height="${cardHeight}" rx="28" fill="url(#surface)" filter="url(#surface-shadow)"/>
<rect x="${cardX}" y="8" width="${cardWidth}" height="${cardHeight}" rx="28" fill="url(#gloss)"/>
<rect x="${cardX + .5}" y="8.5" width="${cardWidth - 1}" height="${cardHeight - 1}" rx="27.5" stroke="url(#rim)" stroke-width=".8"/>
<g transform="translate(${mobile ? 32 : 44} 35) scale(.75)">${mark}</g>
<text x="${brandX}" y="60" class="ink" font-size="20" font-weight="600">${platform}</text>
<text x="${brandX}" y="84" class="secondary" font-size="13">${snapshot.projects.length} projects · total downloads</text>
${counter.body}
<text x="${width - (mobile ? 32 : 44)}" y="${height - 28}" text-anchor="end" class="secondary" font-size="11">${snapshot.updatedAt} · ${isModrinth ? 'Modrinth API' : 'CFWidget'}</text>`;
  return canvas(design, height, theme, `${platform}: ${number(snapshot.total)} downloads, ${snapshot.projects.length} projects. Updated ${snapshot.updatedAt}.`, body, definitions, `.count{font-variant-numeric:tabular-nums;font-size:${size}px;font-weight:600;fill:${THEMES[theme].ink}}${counter.rules}`);
}

export function renderProfile(profile, snapshot, icons) {
  const files = [];
  for (const theme of Object.keys(THEMES)) {
    for (const mobile of [false, true]) {
      const design = layout(profile, mobile);
      const suffix = `${theme}${mobile ? '-mobile' : ''}`;
      files.push(
        [`header-${suffix}.svg`, overview(profile, icons, design, theme)],
        [`downloads-${suffix}.svg`, downloads(snapshot.curseforge, 'CurseForge', icons, design, theme)],
        [`modrinth-${suffix}.svg`, downloads(snapshot.modrinth, 'Modrinth', icons, design, theme)],
        [`footer-${suffix}.svg`, canvas(design, design.footer, theme, '', '')],
      );
    }
  }
  return files;
}
