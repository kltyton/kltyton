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

const METAL = {
  dark: { face: '#202326', chassis: '#090b0c', top: '#828e91', middle: '#31383b', bottom: '#15191b', bright: '#e2eceb', seam: '#465052', grain: '#bed0d2', shade: '#050809', reflection: '.14' },
  light: { face: '#e9eff0', chassis: '#98a8ad', top: '#ffffff', middle: '#c2d0d4', bottom: '#a6b5ba', bright: '#ffffff', seam: '#83979e', grain: '#596f77', shade: '#455a62', reflection: '.18' },
};

function cutPath(x, y, width, height, cut = 14) {
  return `M${x + cut} ${y}H${x + width - cut}L${x + width} ${y + cut}V${y + height - cut}L${x + width - cut} ${y + height}H${x + cut}L${x} ${y + height - cut}V${y + cut}Z`;
}

function metalDefinitions(theme, width) {
  const metal = METAL[theme];
  return `<linearGradient id="metal-face" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="${metal.face}"/><stop offset=".48" stop-color="${metal.middle}"/><stop offset="1" stop-color="${metal.face}"/></linearGradient>
<linearGradient id="metal-chrome" x1="0" y1="0" x2=".1" y2="1"><stop stop-color="${metal.bright}"/><stop offset=".12" stop-color="${metal.top}"/><stop offset=".35" stop-color="${metal.middle}"/><stop offset=".51" stop-color="${metal.bright}"/><stop offset=".58" stop-color="${metal.bottom}"/><stop offset="1" stop-color="${metal.top}"/></linearGradient>
<linearGradient id="metal-glare"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".38" stop-color="#8bf4ee" stop-opacity=".08"/><stop offset=".48" stop-color="#fff" stop-opacity=".36"/><stop offset=".53" stop-color="#f4a9d0" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="metal-scan" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#81f4e6" stop-opacity="0"/><stop offset=".85" stop-color="#81f4e6" stop-opacity=".08"/><stop offset="1" stop-color="#e8fff9" stop-opacity=".3"/></linearGradient>
<pattern id="metal-grain" width="12" height="4" patternUnits="userSpaceOnUse"><path d="M0 .5H12M3 2.5H8" stroke="${metal.grain}" stroke-opacity=".065" stroke-width=".5"/></pattern>
<pattern id="metal-raster" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 .5H6" stroke="${metal.grain}" stroke-opacity=".08" stroke-width=".5"/></pattern>
<filter id="metal-shadow" x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="7" stdDeviation="4" flood-color="${metal.shade}" flood-opacity=".6"/></filter>
${prism('metal-foil', width)}${prism('mount-foil', 96)}`;
}

function metalPanel(width, height, prefix, theme, accent, band = false) {
  const metal = METAL[theme];
  const face = cutPath(0, 0, width, height - 10);
  return `<defs><clipPath id="${prefix}-face"><path d="${face}"/></clipPath></defs>
<path d="${cutPath(0, 7, width, height - 7)}" fill="${metal.chassis}"/>
<path d="${face}" fill="url(#metal-face)"/>
<g clip-path="url(#${prefix}-face)">
<path d="M${width * .45} -30L${width * .72} -30L${width * .43} ${height + 30}L${width * .17} ${height + 30}Z" fill="url(#metal-foil)" opacity="${metal.reflection}"/>
<rect width="${width}" height="${height}" fill="url(#metal-grain)"/>
<path class="m-sweep" d="M-400 -40H-290L-40 ${height + 40}H-150Z" fill="url(#metal-glare)"/>
<rect class="m-scan" y="-48" width="${width}" height="48" fill="url(#metal-scan)" style="--scan-distance:${height + 70}px"/>
<path d="M${width - 180} 0H${width - 144}L${width - 28} ${height}H${width - 64}Z" fill="${accent}" opacity=".045"/>
</g>
${band ? '' : `<path d="${face}" stroke="url(#metal-chrome)" stroke-width="1"/>`}
<path d="M15 1H${width - 15}M1 15V${height - 26}M15 ${height - 10}H${width - 15}" stroke="url(#metal-chrome)" stroke-width="1"/>
<path d="M16 ${height - 5}H${width - 16}" stroke="${metal.seam}" stroke-width="1"/>
<path class="m-tracer" d="M24 1H${width - 24}" stroke="url(#metal-foil)" stroke-width="1.4" pathLength="100" stroke-dasharray="12 88"/>
<path d="M${width - 50} ${height - 17}L${width - 44} ${height - 23}M${width - 40} ${height - 17}L${width - 34} ${height - 23}M${width - 30} ${height - 17}L${width - 24} ${height - 23}" stroke="${metal.top}" stroke-width="2"/>`;
}

function metalCSS(width) {
  return `.m-sweep{animation:m-sweep 8.4s cubic-bezier(.4,0,.2,1) infinite;animation-delay:var(--section-phase,0s)}.m-scan{animation:m-scan 9s linear infinite;animation-delay:calc(var(--section-phase,0s) - 2s)}.m-tracer{animation:m-tracer 10s linear infinite;animation-delay:var(--section-phase,0s)}.m-float{transform-origin:48px 40px;animation:m-float 6.2s ease-in-out infinite}.m-shadow{transform-origin:48px 74px;animation:m-shadow 6.2s ease-in-out infinite}.m-lens{animation:m-lens 6.8s ease-in-out infinite}.m-watermark{animation:m-watermark 12s ease-in-out infinite alternate}@keyframes m-sweep{0%,12%{transform:translateX(0)}56%,100%{transform:translateX(${width + 650}px)}}@keyframes m-scan{0%,60%{transform:translateY(0);opacity:0}64%{opacity:1}88%,100%{transform:translateY(var(--scan-distance));opacity:0}}@keyframes m-tracer{to{stroke-dashoffset:-100}}@keyframes m-float{0%,100%{transform:translateY(-6px) rotate(-3deg)}50%{transform:translateY(-13px) rotate(3deg)}}@keyframes m-shadow{0%,100%{transform:scaleX(1);opacity:.42}50%{transform:scaleX(.72);opacity:.2}}@keyframes m-lens{0%,18%{transform:translateX(-100px)}58%,100%{transform:translateX(120px)}}@keyframes m-watermark{to{transform:translate(-10px,7px)}}`;
}

function tile(item, source, prefix, index, theme) {
  const metal = METAL[theme];
  const phase = -index * .43;
  return `<path d="M7 66H76L91 76H22Z" fill="url(#metal-chrome)"/>
<path d="M22 76H91V84H22Z" fill="${metal.bottom}"/><path d="M7 66L22 76V84L7 74Z" fill="${metal.top}"/>
<path d="M24 77H86" stroke="url(#mount-foil)" stroke-width="1.5"/>
<path class="m-shadow" style="animation-delay:${phase}s" d="M18 69H75L84 75H27Z" fill="${metal.shade}"/>
<g class="m-float" style="animation-delay:${phase}s" filter="url(#metal-shadow)">
<path d="${cutPath(10, 4, 76, 72, 10)}" fill="${metal.chassis}"/>
<path d="${cutPath(10, -2, 76, 72, 10)}" fill="url(#metal-chrome)"/>
<defs><clipPath id="${prefix}-lens"><path d="${cutPath(16, 4, 64, 60, 6)}"/></clipPath></defs>
<g clip-path="url(#${prefix}-lens)"><g transform="translate(16 2)">${sourceIcon(source, prefix, item.color, item.inset)}</g>
<path d="M16 4H80V28L16 51Z" fill="url(#mount-foil)" opacity=".13"/>
<path class="m-lens" style="animation-delay:${-index * .57}s" d="M-26 -10H-10L90 80H74Z" fill="url(#metal-glare)"/></g>
<path d="M20 1H73L83 11M13 16V54" stroke="${metal.bright}" stroke-opacity=".5" stroke-width=".8"/>
<path d="M20 66H75" stroke="url(#mount-foil)" stroke-width="1.2"/>
</g>`;
}

function stack(profile, icons, theme, mobile) {
  const palette = PALETTES[theme];
  const width = mobile ? 420 : 840;
  const rowHeight = 116;
  let top = 0;
  let body = '';
  let index = 0;
  for (const [groupIndex, group] of profile.groups.entries()) {
    const columns = mobile ? (group.items.length === 4 ? 4 : 3) : group.items.length;
    const height = 64 + Math.ceil(group.items.length / columns) * rowHeight;
    const cell = (width - 40) / columns;
    const prefix = `section${groupIndex}`;
    body += `<g transform="translate(0 ${top})" style="--section-phase:-${groupIndex * 1.7}s">${metalPanel(width, height, prefix, theme, group.color, true)}
<path d="M22 25L29 18H42M22 25V35" stroke="url(#metal-chrome)" stroke-width="1"/>
<text x="38" y="34" fill="${palette.ink}" font-size="20" font-weight="700">${xml(group.title)}</text>
<path d="M${width - 129} 25H${width - 32}" stroke="${METAL[theme].seam}" stroke-width="1"/>
<path d="M${width - 120} 21L${width - 110} 29M${width - 103} 21L${width - 93} 29M${width - 86} 21L${width - 76} 29" stroke="url(#metal-foil)" stroke-opacity=".7" stroke-width="1"/>`;
    for (const [itemIndex, item] of group.items.entries()) {
      const center = 20 + (itemIndex % columns) * cell + cell / 2;
      const y = 57 + Math.floor(itemIndex / columns) * rowHeight;
      const size = mobile ? (columns === 4 ? 70 : 80) : 88;
      body += `<g transform="translate(${center - size / 2} ${y}) scale(${size / 96})">${tile(item, icons[item.icon], `g${groupIndex}i${itemIndex}`, index++, theme)}</g>`;
      const lines = mobile && item.name === 'GitHub Actions' ? ['GitHub', 'Actions'] : [item.name];
      const textY = y + size + 11;
      body += `<text x="${center}" y="${textY}" text-anchor="middle" font-size="${mobile ? 14 : 13}" font-weight="600" fill="${palette.ink}">${lines.map((line, lineIndex) => `<tspan x="${center}" dy="${lineIndex ? 16 : 0}">${xml(line)}</tspan>`).join('')}</text>`;
    }
    body += '</g>';
    top += height + 16;
  }
  return image(width, top - 16, profile.groups.map(group => `${group.title}: ${group.items.map(item => item.name).join(', ')}`).join('; '), body, metalDefinitions(theme, width), metalCSS(width));
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
  const height = mobile ? 252 : 192;
  const size = mobile ? 50 : 64;
  const baseline = mobile ? 174 : 116;
  const isModrinth = platform === 'Modrinth';
  const accent = isModrinth ? '#36dc99' : '#ff986a';
  const countStart = isModrinth ? (theme === 'dark' ? '#9ef3b5' : '#087744') : (theme === 'dark' ? '#ffd08a' : '#aa3c2b');
  const countEnd = isModrinth ? (theme === 'dark' ? '#58dddc' : '#087487') : (theme === 'dark' ? '#ff91c6' : '#ac2866');
  const counterWidth = [...number(snapshot.total)].reduce((sum, character) => sum + size * (character === ',' ? .28 : .64), 0);
  const counter = rollingNumber(snapshot.total, mobile ? (width + counterWidth) / 2 : width - 32, baseline, size);
  const brandX = mobile ? 112 : 120;
  const brandY = mobile ? 54 : 65;
  const forge = 'M18.326 9.2145S23.2261 8.4418 24 6.1882h-7.5066V4.4H0l2.0318 2.3576V9.173s5.1267-.2665 7.1098 1.2372c2.7146 2.516-3.053 5.917-3.053 5.917L5.0995 19.6c1.5465-1.4726 4.494-3.3775 9.8983-3.2857-2.0565.65-4.1245 1.6651-5.7344 3.2857h10.9248l-1.0288-3.2726s-7.918-4.6688-.8336-7.1127z';
  const mark = isModrinth ? sourceIcon(icons.Modrinth, 'platform-mark', accent, 5) : `<path d="${forge}" transform="translate(1 10) scale(2.6)" fill="${accent}"/>`;
  const definitions = `${metalDefinitions(theme, width)}<linearGradient id="count"><stop stop-color="${countStart}"/><stop offset="1" stop-color="${countEnd}"/></linearGradient>${counter.clip}`;
  const body = `<g style="--section-phase:${isModrinth ? '-3.4s' : '-.7s'}">${metalPanel(width, height, 'platform', theme, accent)}
<g clip-path="url(#platform-face)">
<g transform="translate(${width - 195} -34) scale(3.8)"><g class="m-watermark" opacity="${theme === 'dark' ? '.055' : '.07'}">${mark}</g></g>
<path d="M${mobile ? 24 : 475} ${mobile ? 110 : 48}H${width - 27}V${height - 56}H${mobile ? 24 : 475}Z" fill="url(#metal-raster)"/>
</g>
<g transform="translate(30 ${mobile ? 24 : 38})">${mark}</g>
<text x="${brandX}" y="${brandY}" font-size="23" font-weight="700" fill="${palette.ink}">${platform}</text>
<text x="${brandX}" y="${brandY + 25}" font-size="${mobile ? 12 : 13}" fill="${palette.muted}">${snapshot.projects.length} projects · total downloads</text>
${counter.body}
<path d="M24 ${height - 48}H${width - 24}" stroke="${METAL[theme].seam}" stroke-opacity=".55" stroke-width=".7"/>
<text x="${width - 28}" y="${height - 27}" text-anchor="end" font-size="11" fill="${palette.muted}">${snapshot.updatedAt} · ${isModrinth ? 'Modrinth API' : 'CFWidget'}</text></g>`;
  const css = `${metalCSS(width)}.count{font-family:${FONT};font-variant-numeric:tabular-nums;font-size:${size}px;font-weight:800;fill:url(#count)}${counter.rules}`;
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
