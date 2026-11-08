import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const html = readFileSync('public/wavelume/index.html', 'utf8');
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
let css = style.replace(/html,\s*body/g, ':host');
css = css.replace(/body((?:\.[A-Za-z0-9_-]+)+)/g, ':host($1)');

const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script>')).trim();
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.indexOf('</script>', scriptStart);
let code = html.slice(scriptStart, scriptEnd).trim();
code = code.replace('window.VIZ={canPlay:()=>true,onBlocked:()=>{}};', '');
code = code.replace(
  'const $=id=>document.getElementById(id);',
  'const $=id=>shadow.querySelector("#"+id);'
);
code = code.replaceAll('document.body', 'host');
code = code.replace(
  'function frame(now){\n  requestAnimationFrame(frame);',
  "function frame(now){\n  if(host.dataset.paused==='1'){host.__raf=0;return;}\n  host.__raf=requestAnimationFrame(frame);"
);
code = code.replace(
  'requestAnimationFrame(frame);',
  'host.__resume=()=>{if(!host.__raf)host.__raf=requestAnimationFrame(frame);};host.__resume();'
);
code = code.replace(
  "addEventListener('keydown',e=>{",
  "addEventListener('keydown',e=>{if(host.dataset.paused==='1')return;"
);
code = code.replace(
  "addEventListener('drop',e=>{",
  "addEventListener('drop',e=>{if(host.dataset.paused==='1')return;"
);

mkdirSync('src/wavelume', { recursive: true });
writeFileSync('src/wavelume/wavelume.css', css);
writeFileSync('src/wavelume/markup.html', body + '\n');
writeFileSync(
  'src/wavelume/engine.js',
  `export function startWavelume(host) {
  const shadow = host.shadowRoot;
  window.VIZ = { canPlay: () => true, onBlocked: () => {} };
${code}
}
`
);

let timer = readFileSync('public/wavelume/timer.js', 'utf8');
timer = timer.replace('const $ = (id) => document.getElementById(id);', 'const $ = (id) => shadow.querySelector("#" + id);');
timer = timer.replaceAll('document.body', 'host');
timer = timer.replace('document.head.appendChild(st);', 'shadow.appendChild(st);');
timer = timer.replace(
  'addEventListener("keydown", (e) => {',
  'addEventListener("keydown", (e) => { if (host.dataset.paused === "1") return;'
);
const timerCssOld = 'body.hideui #tpanel,body.locked #tpanel{display:none}';
const timerCssNew = ':host(.hideui) #tpanel,:host(.locked) #tpanel{display:none}';
timer = timer.replace(timerCssOld, timerCssNew);
timer = timer.replace('body.timeron #start{display:none!important}', ':host(.timeron) #start{display:none!important}');
timer = timer.replace('body.timeron #timerbtn{color:#4fc3ff;background:rgba(79,195,255,.15)}', ':host(.timeron) #timerbtn{color:#4fc3ff;background:rgba(79,195,255,.15)}');
if (!timer.includes('export function startWavelumeTimer')) {
  timer = timer.replace('(() => {', 'export function startWavelumeTimer(host) {\n  const shadow = host.shadowRoot;\n  (() => {');
  timer = timer.replace(/\}\)\(\);\s*$/, '})();\n}\n');
}
writeFileSync('src/wavelume/timer.js', timer);
console.log('extracted', css.length, body.length, code.length);
