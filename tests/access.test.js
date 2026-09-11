import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { hashPassword, checkPassword, createSession, hasSession, accessDecision, safeNext, TTL } from '../server/access.js';
import { decks } from '../admin/decks.js';
process.env.ASFC_ADMIN_PASSWORD_HASH=hashPassword('test-only-password');
process.env.ASFC_SESSION_SECRET='test-only-secret-that-is-at-least-32-characters';
process.env.ASFC_MAINTENANCE='true';
test('password, tampering, expiry, rotation, and fail-closed configuration',()=>{
 assert.equal(checkPassword('test-only-password'),true); assert.equal(checkPassword('wrong'),false);
 const now=Date.now(); const session=createSession(now); const cookie='asfc_access='+session;
 assert.equal(hasSession(cookie,now),true);assert.equal(hasSession(cookie,now+TTL*1000),false);
 assert.equal(hasSession(cookie.slice(0,-1)+(cookie.endsWith('a')?'b':'a'),now),false);
 const secret=process.env.ASFC_SESSION_SECRET;process.env.ASFC_SESSION_SECRET+='rotated';assert.equal(hasSession(cookie,now),false);
 process.env.ASFC_SESSION_SECRET=secret;
 const hash=process.env.ASFC_ADMIN_PASSWORD_HASH;process.env.ASFC_ADMIN_PASSWORD_HASH=hashPassword('new');assert.equal(hasSession(cookie,now),false);
 process.env.ASFC_ADMIN_PASSWORD_HASH='';assert.equal(hasSession(cookie,now),false);assert.equal(checkPassword(''),false);process.env.ASFC_ADMIN_PASSWORD_HASH=hash;
});
test('maintenance and permanent private routes cannot be bypassed with direct links',()=>{
 const cookie='asfc_access='+createSession();
 for(const path of ['/','/index.html','/agency/index.html',...decks.map(d=>d.href)]){assert.equal(accessDecision(path),'login',path);assert.equal(accessDecision(path,cookie),'allow',path);}
 for(const path of ['/server/access.js','/.env.local','/foo/.git/config','/tests/access.test.js','/supabase/file.sql','/api/unknown','/%2eenv'])assert.equal(accessDecision(path,cookie),'deny',path);
 assert.equal(accessDecision('/pitch/data/network-stats.json',cookie),'allow');
 assert.equal(accessDecision('/pitch/data/network-stats.json'),'login');
 assert.equal(accessDecision('/access/'),'allow');assert.equal(accessDecision('/api/session'),'allow');
 process.env.ASFC_MAINTENANCE='false';assert.equal(accessDecision('/'),'allow');assert.equal(accessDecision('/Documents/ThumbpresentationV3.png'),'allow');
 for(const path of ['/admin/','/lewishamilton/index.html','/lukadoncic/','/pitch/exports/ASFC-Pitch-Teams.pdf','/Documents/Cam%20Newton%20Youtube.pptx','/LUKADONCIC/'])assert.equal(accessDecision(path),'login',path);
 process.env.ASFC_MAINTENANCE='true';
});
test('post-login redirects stay on this site',()=>{
 for(const value of ['https://evil.test','//evil.test','/\\evil.test','/access/','/x\r\nLocation: evil',null])assert.equal(safeNext(value),'/');
 assert.equal(safeNext('/admin/?q=luka'),'/admin/?q=luka');
});
test('library targets exist in the built release; Cam result matches original monthly history',()=>{
 for(const deck of decks){let file='public'+decodeURIComponent(deck.href);if(file.endsWith('/'))file+='index.html';assert.ok(existsSync(file),file);}
 const context={window:{}};vm.runInNewContext(readFileSync('analytics/cam-view-history.js','utf8'),context);
 const data=context.window.ASFC_CAM_VIEW_HISTORY;
 assert.equal(data.points.length,24);assert.equal(data.viewsGenerated,292462209);
 assert.equal(data.points.at(-1)[1]-data.openingViews,data.viewsGenerated);
 for(const file of ['agency/index.html','analytics/indexYouTubeStudioCamNewton.html']){const text=readFileSync(file,'utf8');assert.ok(text.includes('292.5M'));assert.ok(!text.includes('309.6M'));}
});
test('database clock drives counter across days; offline growth stops after ten minutes',async()=>{
 let tick=0, day=0;const window={addEventListener(){},dispatchEvent(){}};
 const context={window,document:{addEventListener(){}},performance:{now:()=>tick},localStorage:{getItem:()=>null,setItem(){}},AbortSignal,Event,setInterval(){},fetch:async()=>({ok:true,json:async()=>[{total_views:6801000000+day*1000000,daily_growth:1000000,as_of:`2026-09-${10+day}T00:00:00Z`,server_now:`2026-09-${10+day}T12:00:00Z`}]})};
 vm.runInNewContext(readFileSync('agency/network-counter.js','utf8'),context);await new Promise(resolve=>setImmediate(resolve));
 assert.equal(window.getASFCNetworkViews(),6801500000);tick=1000;assert.equal(window.getASFCNetworkViews(),6801500011);
 tick=600000;const frozen=window.getASFCNetworkViews();tick=86400000;assert.equal(window.getASFCNetworkViews(),frozen);
 day=1;await window.refreshASFCNetworkViews();assert.equal(window.getASFCNetworkViews(),6802500000);
});

test('Spurs access stays private after launch and never grants admin or other deck access', () => {
 process.env.ASFC_SPURS_PASSWORD_HASH = hashPassword('spurs-test-password');
 process.env.ASFC_MAINTENANCE = 'false';
 try {
  const now = Date.now();
  const token = createSession(now, 'spurs');
  const cookie = 'asfc_spurs_access=' + token;
  assert.equal(checkPassword('spurs-test-password', 'spurs'), true);
  assert.equal(checkPassword('spurs-test-password'), false);
  for (const path of ['/Spurs/', '/Spurs/ASFC%20Spurs%20Season%20Story%20Deck%20v5%20-%20Presentation%20Mode.html', '/spurs/anything.pdf', '/%53purs/assets.png']) {
   assert.equal(accessDecision(path), 'spurs-login', path);
   assert.equal(accessDecision(path, cookie), 'allow', path);
  }
  assert.equal(hasSession('asfc_access=' + token), false);
  assert.equal(hasSession(cookie, now + TTL * 1000, 'spurs'), false);
  assert.equal(hasSession(cookie.slice(0,-1)+(cookie.endsWith('a')?'b':'a'), now, 'spurs'), false);
  for (const path of ['/admin/', '/lukadoncic/', '/lewishamilton/']) assert.equal(accessDecision(path, cookie), 'login');
  for (const path of ['/analytics/strategy.html?channel=AllTheSmoke', '/analytics/indexYouTubeStudioSanAntonioSpurs.html']) assert.equal(accessDecision(path), 'allow');
  assert.equal(accessDecision('/Spurs/deck.html', 'asfc_access='+createSession()), 'allow');
  process.env.ASFC_SPURS_PASSWORD_HASH = hashPassword('rotated-spurs-password');
  assert.equal(hasSession(cookie, now, 'spurs'), false);
  process.env.ASFC_SPURS_PASSWORD_HASH = '';
  assert.equal(accessDecision('/Spurs/deck.html', cookie), 'spurs-login');
  process.env.ASFC_MAINTENANCE = 'true';
  assert.equal(accessDecision('/', cookie), 'login');
 } finally { process.env.ASFC_MAINTENANCE = 'true'; }
});
