const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','Yu Gothic UI',Meiryo,system-ui,sans-serif";
const THEMES = {
  light: { ink: '#1d1d1f', secondary: '#414751', page: '#edf0f2', veil: '#ffffff', veilOpacity: '.12', shadow: '#293b49', rim: '.9', glass: '#ffffff', glassOpacity: '.4' },
  dark: { ink: '#f7f8fa', secondary: '#d8dce3', page: '#141719', veil: '#101216', veilOpacity: '.12', shadow: '#020609', rim: '.56', glass: '#111519', glassOpacity: '.62' },
};
const xml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);
const number = value => new Intl.NumberFormat('en-US').format(value);
const motionCSS = '.profile-icon{animation:icon-breathe 9s ease-in-out infinite}.glass-sheen{animation:glass-sheen 12s ease-in-out infinite;animation-delay:var(--phase,0s)}@keyframes icon-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}@keyframes glass-sheen{0%,15%{transform:translateX(-240px);opacity:0}30%{opacity:.18}68%,100%{transform:translateX(1000px);opacity:0}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}';

function layout(profile, mobile) {
  const width = mobile ? 420 : 840;
  let top = mobile ? 280 : 224;
  const groups = profile.groups.map(group => {
    const columns = mobile ? (group.items.length === 4 ? 4 : 3) : group.items.length;
    const entry = { group, columns, top };
    top += mobile ? 48 + Math.ceil(group.items.length / columns) * 104 : 146;
    return entry;
  });
  const statistics = mobile ? 244 : 184;
  const footer = 64;
  return { width, mobile, inset: mobile ? 28 : 40, overview: top, statistics, footer, total: top + statistics * 2 + footer, groups };
}

function surfaceDefinitions(theme) {
  const palette = THEMES[theme];
  return `<linearGradient id="rim" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff" stop-opacity="${palette.rim}"/><stop offset=".3" stop-color="#fff" stop-opacity=".12"/><stop offset=".68" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>
<linearGradient id="surface"><stop stop-color="${palette.glass}" stop-opacity="${palette.glassOpacity}"/><stop offset="1" stop-color="${palette.glass}" stop-opacity="${Number(palette.glassOpacity) * .8}"/></linearGradient>
<linearGradient id="reflection"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".48" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="icon-shadow" x="-35%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="${palette.shadow}" flood-opacity="${theme === 'dark' ? '.25' : '.16'}"/></filter>
<filter id="surface-shadow" x="-10%" y="-30%" width="120%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="${palette.shadow}" flood-opacity="${theme === 'dark' ? '.2' : '.1'}"/></filter>
<filter id="soft-refraction" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="1.2"/></filter>`;
}

function canvas(design, height, offset, theme, background, label, body, definitions = '', css = '') {
  const palette = THEMES[theme];
  const textShadow = theme === 'dark' ? 'filter:drop-shadow(0 1px 1px #0008)' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${design.width}" height="${height}" viewBox="0 0 ${design.width} ${height}" fill="none" role="img" aria-label="${xml(label)}"><style>text{font-family:${FONT};letter-spacing:0}.ink{fill:${palette.ink}}.secondary{fill:${palette.secondary}}.wallpaper-label{${textShadow}}${motionCSS}${css}</style><defs>${surfaceDefinitions(theme)}${definitions}</defs>
<rect width="${design.width}" height="${height}" fill="${palette.page}"/>
<image id="wallpaper" x="0" y="${-offset}" width="${design.width}" height="${design.total}" preserveAspectRatio="xMidYMid slice" href="${background}"/>
<rect width="${design.width}" height="${height}" fill="${palette.veil}" fill-opacity="${palette.veilOpacity}"/>
${body}</svg>\n`;
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

function overview(profile, icons, design, theme, background) {
  const { width, inset, mobile } = design;
  const nameY = mobile ? 88 : 100;
  let body = `<text x="${inset}" y="${nameY}" class="ink wallpaper-label" font-size="${mobile ? 60 : 72}" font-weight="600">${xml(profile.username)}</text>
<text x="${inset}" y="${mobile ? 126 : 145}" class="ink wallpaper-label" font-size="${mobile ? 19 : 20}" font-weight="400">${xml(profile.description)}</text>`;
  for (const [index, context] of profile.contexts.entries()) {
    body += `<text class="profile-context secondary wallpaper-label" x="${mobile ? inset : 432}" y="${(mobile ? 176 : 78) + index * (mobile ? 23 : 27)}" font-size="13">${xml(context.replace(' / ', ' · '))}</text>`;
  }
  let order = 0;
  for (const [groupIndex, entry] of design.groups.entries()) {
    const { group, columns, top } = entry;
    const cell = (width - inset * 2) / columns;
    const iconSize = mobile ? 56 : 64;
    body += `<text x="${inset}" y="${top}" class="ink wallpaper-label" font-size="19" font-weight="600">${xml(group.title)}</text>`;
    for (const [index, item] of group.items.entries()) {
      const center = inset + (index % columns) * cell + cell / 2;
      const y = top + 26 + Math.floor(index / columns) * 104;
      body += `<g transform="translate(${center - iconSize / 2} ${y}) scale(${iconSize / 64})"><g class="profile-icon" filter="url(#icon-shadow)" style="animation-delay:-${order++ * .43}s">${sourceIcon(icons[item.icon], `g${groupIndex}i${index}`, item.color, item.inset)}</g></g>`;
      const lines = mobile && item.name === 'GitHub Actions' ? ['GitHub', 'Actions'] : [item.name];
      body += `<text x="${center}" y="${y + iconSize + 20}" text-anchor="middle" class="ink wallpaper-label" font-size="${mobile ? 14 : 13}" font-weight="500">${lines.map((line, lineIndex) => `<tspan x="${center}" dy="${lineIndex ? 16 : 0}">${xml(line)}</tspan>`).join('')}</text>`;
    }
  }
  const label = `${profile.username}. ${profile.description}. ${profile.groups.map(group => `${group.title}: ${group.items.map(item => item.name).join(', ')}`).join('; ')}`;
  return canvas(design, design.overview, 0, theme, background, label, body);
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

function downloads(snapshot, platform, icons, design, theme, background, offset) {
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
  const definitions = `<clipPath id="surface-clip"><rect x="${cardX}" y="8" width="${cardWidth}" height="${cardHeight}" rx="28"/></clipPath>${counter.clip}`;
  const brandX = mobile ? 98 : 116;
  const body = `<rect x="${cardX}" y="8" width="${cardWidth}" height="${cardHeight}" rx="28" fill="url(#surface)" filter="url(#surface-shadow)"/>
<g clip-path="url(#surface-clip)">
<g transform="translate(${width / 2} ${height / 2}) scale(1.015) translate(${-width / 2} ${-height / 2})" filter="url(#soft-refraction)"><use href="#wallpaper"/></g>
<rect x="${cardX}" y="8" width="${cardWidth}" height="${cardHeight}" rx="28" fill="url(#surface)"/>
<path class="glass-sheen" style="--phase:${isModrinth ? '-4s' : '-1s'}" d="M-150 -20H-100L80 ${height + 20}H30Z" fill="url(#reflection)"/>
</g>
<rect x="${cardX + .5}" y="8.5" width="${cardWidth - 1}" height="${cardHeight - 1}" rx="27.5" stroke="url(#rim)" stroke-width=".8"/>
<g transform="translate(${mobile ? 32 : 44} 35) scale(.75)">${mark}</g>
<text x="${brandX}" y="60" class="ink" font-size="20" font-weight="600">${platform}</text>
<text x="${brandX}" y="84" class="secondary" font-size="13">${snapshot.projects.length} projects · total downloads</text>
${counter.body}
<text x="${width - (mobile ? 32 : 44)}" y="${height - 28}" text-anchor="end" class="secondary" font-size="11">${snapshot.updatedAt} · ${isModrinth ? 'Modrinth API' : 'CFWidget'}</text>`;
  return canvas(design, height, offset, theme, background, `${platform}: ${number(snapshot.total)} downloads, ${snapshot.projects.length} projects. Updated ${snapshot.updatedAt}.`, body, definitions, `.count{font-variant-numeric:tabular-nums;font-size:${size}px;font-weight:600;fill:${THEMES[theme].ink}}${counter.rules}`);
}

export function renderProfile(profile, snapshot, icons, backgrounds) {
  const files = [];
  for (const theme of Object.keys(THEMES)) {
    for (const mobile of [false, true]) {
      const design = layout(profile, mobile);
      const suffix = `${theme}${mobile ? '-mobile' : ''}`;
      const background = backgrounds[theme];
      files.push(
        [`header-${suffix}.svg`, overview(profile, icons, design, theme, background)],
        [`downloads-${suffix}.svg`, downloads(snapshot.curseforge, 'CurseForge', icons, design, theme, background, design.overview)],
        [`modrinth-${suffix}.svg`, downloads(snapshot.modrinth, 'Modrinth', icons, design, theme, background, design.overview + design.statistics)],
        [`footer-${suffix}.svg`, canvas(design, design.footer, design.overview + design.statistics * 2, theme, background, '', '')],
      );
    }
  }
  return files;
}
