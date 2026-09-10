const {chromium}=require('playwright');
const {readFileSync}=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5191';
const password=readFileSync('.context/admin-access.txt','utf8').split('\n')[0].split(': ')[1];
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(process.env.VERCEL_TEST_SHARE_URL) await page.goto(process.env.VERCEL_TEST_SHARE_URL);
 await page.goto(base+'/admin/');assert.ok(page.url().includes('/access/'));
 await page.locator('#password').fill('wrong');await page.locator('button[type=submit]').click();await page.getByText('That password did not match. Try again.').waitFor();
 await page.locator('#password').fill(password);await page.locator('button[type=submit]').click();await page.waitForURL('**/admin/');
 assert.equal(await page.locator('.card').count(),17);
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'.context/admin-'+width+'.png',fullPage:true});}
 await page.locator('#search').fill('luka');assert.equal(await page.locator('.card').count(),2);await page.locator('#search').fill('');
 const links=await page.locator('.card').evaluateAll(a=>a.map(a=>a.href));
 for(const url of links){const response=await context.request.head(url,{maxRedirects:0});assert.equal(response.status(),200,url);}
 console.log('PASS deployed sign-in, library and all file routes');
 for(const route of ['lukadoncic','lewishamilton','aspensnowmass','clubamerica']){
  await page.goto(`${base}/${route}/`);await page.waitForTimeout(3100);
  assert.equal(await page.locator('#asfc-login').count(),0,route);const before=await page.locator('.slide.active').evaluate(e=>Array.from(e.parentNode.children).indexOf(e));
  await page.keyboard.press('ArrowRight');const after=await page.locator('.slide.active').evaluate(e=>Array.from(e.parentNode.children).indexOf(e));assert.notEqual(before,after,route+' navigation');
 }
 for(const route of ['lukaslovenia','parisvsslovenia']){await page.goto(`${base}/${route}/`);assert.equal(await page.locator('#asfc-login').count(),0);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('gated')),false);}
 await page.goto(base+'/admin/');await page.locator('#logout').click();await page.waitForURL('**/access/');
 await page.goto(base+'/lukadoncic/index.html');assert.ok(page.url().includes('/access/'));
 assert.deepEqual(errors,[]);console.log('PASS maintenance sign-in, wrong password, 17 library links, mobile/desktop, search, deck navigation, reports, logout');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
