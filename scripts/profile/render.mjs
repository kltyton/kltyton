import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { renderProfile } from './graphics.mjs';

const run = promisify(execFile);
const root = new URL('../../', import.meta.url);
const profile = JSON.parse(await readFile(new URL('data/profile.json', root), 'utf8'));

async function getJson(url) {
  const { stdout } = await run('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '45', '--user-agent', `${profile.username}-profile`, url], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  return JSON.parse(stdout);
}

async function refreshCurseForge() {
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

async function refreshModrinth() {
  const user = await getJson(`https://api.modrinth.com/v2/user/${encodeURIComponent(profile.modrinth.username)}`);
  if (user.id !== profile.modrinth.id || user.username?.toLowerCase() !== profile.modrinth.username.toLowerCase()) {
    throw new Error('Modrinth account does not match the configured identity.');
  }
  const response = await getJson(`https://api.modrinth.com/v2/user/${user.id}/projects`);
  if (!Array.isArray(response) || !response.length) throw new Error('Modrinth project list is empty.');
  const ids = new Set();
  const projects = response.map(project => {
    if (typeof project.id !== 'string' || !project.id || ids.has(project.id) || !Number.isSafeInteger(project.downloads) || project.downloads < 0) {
      throw new Error('Invalid or duplicate Modrinth project identity or download count.');
    }
    ids.add(project.id);
    return { id: project.id, title: project.title, downloads: project.downloads, source: `https://api.modrinth.com/v2/project/${project.id}` };
  }).sort((left, right) => left.id.localeCompare(right.id));
  return { author: profile.modrinth.username, userId: user.id, updatedAt: new Date().toISOString().slice(0, 10), total: projects.reduce((sum, project) => sum + project.downloads, 0), projects };
}

function validateSnapshot(snapshot, author) {
  if (snapshot.author !== author || !Array.isArray(snapshot.projects) || !snapshot.projects.length || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.updatedAt) || !Number.isSafeInteger(snapshot.total) || snapshot.projects.some(project => !Number.isSafeInteger(project.downloads) || project.downloads < 0) || new Set(snapshot.projects.map(project => project.id)).size !== snapshot.projects.length || snapshot.total !== snapshot.projects.reduce((sum, project) => sum + project.downloads, 0)) {
    throw new Error('Download snapshot is incomplete or belongs to a different author.');
  }
}

async function main() {
  const refresh = process.argv.includes('--refresh');
  if (process.argv.slice(2).some(argument => argument !== '--refresh')) throw new Error('Usage: node scripts/profile/render.mjs [--refresh]');
  const snapshot = refresh ? { curseforge: await refreshCurseForge(), modrinth: await refreshModrinth() } : JSON.parse(await readFile(new URL('data/downloads.json', root), 'utf8'));
  validateSnapshot(snapshot.curseforge, profile.curseforge.author);
  validateSnapshot(snapshot.modrinth, profile.modrinth.username);
  if (snapshot.modrinth.userId !== profile.modrinth.id) throw new Error('Modrinth snapshot account ID does not match.');
  const names = [...new Set([...profile.groups.flatMap(group => group.items.map(item => item.icon)), 'Modrinth'])];
  const icons = Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(new URL(`assets/icons/${name}.svg`, root), 'utf8')])));
  const files = renderProfile(profile, snapshot, icons);
  await mkdir(new URL('assets/profile/', root), { recursive: true });
  for (const [name, content] of files) await writeFile(new URL(`assets/profile/${name}`, root), content);
  if (refresh) await writeFile(new URL('data/downloads.json', root), `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`${profile.username}: ${files.length} SVGs; ${Object.entries(snapshot).map(([platform, data]) => `${platform}: ${data.projects.length} projects, ${new Intl.NumberFormat('en-US').format(data.total)} downloads`).join('; ')} -> ${fileURLToPath(new URL('assets/profile/', root))}`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
