const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {existsSync, mkdirSync}=require('node:fs');
const base=new URL(process.env.TEST_BASE_URL || 'http://127.0.0.1:5188/').href;
const macChrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executablePath=process.env.CHROME_EXECUTABLE || (existsSync(macChrome) ? macChrome : undefined);
mkdirSync('.context', {recursive:true});
const keys=['CamNewton','4thand1','FunkyFriday','JimGaffigan','KentHeckel','AllTheSmoke','AllTheSmokeFight','KGCertified','TheLateRun','RingChamps'];
(async()=>{
 const browser=await chromium.launch({executablePath,headless:true});
 try {
 const page=await browser.newPage({viewport:{width:420,height:900}});
 if(process.env.ASFC_TEST_PASSWORD){
  const response=await page.request.post(`${base}api/session`,{headers:{Origin:new URL(base).origin},data:{password:process.env.ASFC_TEST_PASSWORD}});
  assert.equal(response.status(),200,'Preview sign-in');
 }
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const failedAssets=[];page.on('response',response=>{
  const url=new URL(response.url());
  if(url.origin===new URL(base).origin && response.status()>=400 && /\/analytics\/strategy|\/images\/channels\//.test(url.pathname)) failedAssets.push(response.url());
 });
 for(const key of keys){
  await page.goto(`${base}analytics/strategy.html?channel=${key}`);
  assert.ok((await page.locator('h1').innerText()).length>10);
  assert.equal(await page.locator('.execution li').count(),3);
  assert.equal(await page.locator('.strategy-flow li').count(),3);
  assert.ok((await page.locator('.strategic-shift p').innerText()).startsWith('We '));
  assert.ok(await page.locator('.client-header img').evaluate(e=>e.complete&&e.naturalWidth>0));
  await page.locator('summary').click();
  assert.equal(await page.locator('details').evaluate(e=>e.open),true);
  const links=await page.locator('a').evaluateAll(items=>items.map(a=>a.getAttribute('href')));
  assert.ok(links.every(href=>href.startsWith('mailto:') || /\.(png|jpg|webp)$/i.test(href)), `${key} exposes an old strategy link`);
  await page.locator('summary').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('details').evaluate(e=>e.open),false);
  await page.keyboard.press('Enter');
  assert.ok((await page.locator('footer a').getAttribute('href')).startsWith('mailto:jordyn@antisocialfriendsclub.com'));
  for(const width of [320,390,440,768]){
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${key} overflows at ${width}`);
  }
  await page.setViewportSize({width:420,height:900});
  if(key==='CamNewton') {
   await page.locator('figure img').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('figure img').naturalWidth>0);
   await page.screenshot({path:'.context/strategy-cam-full.png',fullPage:true});
  }
  if(key==='TheLateRun') {await page.locator('summary').click();await page.screenshot({path:'.context/strategy-late-run-full.png',fullPage:true});}
 }
 console.log('PASS all ten copy mappings, strategy/actions, portraits, no obsolete strategy links, keyboard context expansion, CTA and overflow at four widths');
 await page.setViewportSize({width:1440,height:900});
 await page.goto(base);
 await page.evaluate(()=>document.getElementById('boot-screen')?.remove());
 for(const key of keys){
  await page.evaluate(()=>openModal(document.getElementById('ModalOurWork')));
  await page.locator(`#ModalOurWork [data-channel="${key}"]`).click();
  const loc=page.frameLocator(`#ModalTextBox${key} iframe`);
  await loc.locator('.strategic-shift').waitFor();
  assert.ok(await page.locator(`#ModalAnalytics${key}`).isVisible());
  assert.ok((await page.locator(`#ModalTextBox${key} iframe`).getAttribute('src')).includes('channel='+key));
  if(key==='TheLateRun') {
   await page.waitForTimeout(800);await page.screenshot({path:'.context/strategy-desktop.png'});
   await page.click('#TextBoxMinimizeTheLateRun');
   await page.click('#taskbar-ModalTextBoxTheLateRun');
   assert.ok(await page.locator('#ModalTextBoxTheLateRun').isVisible());
   await page.locator('#ModalTextBoxTheLateRun [data-window-maximize]').click();
   assert.ok(await page.locator('#ModalTextBoxTheLateRun').evaluate(e=>e.classList.contains('is-maximized')));
   await page.locator('#ModalTextBoxTheLateRun [data-window-maximize]').click();
  }
  await page.click(`#TextBoxClose${key}`);
  await page.click(`#AnalyticsClose${key}`);
 }
 await page.evaluate(()=>openChannelModals('SanAntonioSpurs'));
 assert.ok((await page.locator('#ModalTextBoxSanAntonioSpurs iframe').getAttribute('src')).startsWith('Spurs/'));
 const deck=await page.locator('#ModalTextBoxSanAntonioSpurs').boundingBox();assert.ok(deck.width>deck.height);
 console.log('PASS all desktop window destinations and preserved landscape Spurs deck');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{document.getElementById('phone-boot').style.display='none';document.getElementById('phone-home').classList.remove('phone-hidden');});
 for(const key of keys){
  await page.evaluate(k=>openChannelModals(k),key);
  await page.click('#channel-tab-strategy');
  const frame=page.frameLocator('#channel-panel-strategy iframe');
  await frame.locator('.strategic-shift').waitFor();
  assert.equal(await page.locator('#channel-tab-strategy').getAttribute('aria-selected'),'true');
  if(key==='TheLateRun') await page.screenshot({path:'.context/strategy-mobile.png'});
 }
 await page.goto(base+'analytics/strategy.html?channel=toString');assert.equal(await page.locator('.story-index a').count(),10);
 console.log('PASS all ten mobile strategy tabs and invalid-channel fallback');
 assert.deepEqual(failedAssets,[], 'Missing production assets');
 console.log('Page errors:',errors);assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
