import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import http from 'node:http';
import { chromium } from 'playwright';

// Exercise the real canvas, storage events and Web Locks in Chrome. The shared
// service is controlled so failures/races can be reproduced without changing art.
const source = readFileSync(new URL('../paint.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const modal = index.slice(index.indexOf('<div id="ModalPaint"'), index.indexOf('<!-- MARK:', index.indexOf('<div id="ModalPaint"') + 1));
const html = `<button id="paintBtn">Paint.exe</button>${modal.split('<script')[0]}<script src="/paint.js"></script>`;
const key = row => `${row.x},${row.y}`;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, message) {
    for (let i = 0; i < 100; i++) {
        if (await fn()) return;
        await pause(50);
    }
    assert.fail(message);
}

function fakeClient() {
    window.supabase = { createClient() {
        return {
            from() {
                return {
                    select() { return this; },
                    order() { return this; },
                    async range(from, to) {
                        return (await fetch(`/pixels?from=${from}&to=${to}`)).json();
                    },
                    async upsert(rows) {
                        return (await fetch('/pixels', { method: 'POST', body: JSON.stringify(rows) })).json();
                    },
                };
            },
            channel() {
                return {
                    on(type, filter, callback) { window.receivePixel = callback; return this; },
                    subscribe(callback) {
                        window.channelStatus = callback;
                        setTimeout(() => callback('SUBSCRIBED'), 0);
                        return this;
                    },
                };
            },
        };
    } };
}

const colorAt = (page, x, y) => page.evaluate(({ x, y }) => {
    const rgb = document.getElementById('paintCanvas').getContext('2d').getImageData(x * 5 + 2, y * 5 + 2, 1, 1).data;
    return '#' + [...rgb].slice(0, 3).map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}, { x, y });
const paint = (page, x, y) => page.locator('#paintCanvas').click({ position: { x: x * 5 + 2, y: y * 5 + 2 } });
const settled = page => page.waitForFunction(() => document.getElementById('paintStatus').textContent.startsWith('Live'));

test('Paint persistence and collaboration', async t => {
    let rows, failWrites, holdWrite, holdRead, writes, pages;
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, 'http://localhost');
        res.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/paint.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(source); return; }
        if (url.pathname !== '/pixels') { res.setHeader('Content-Type', 'text/html'); res.end(html); return; }
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'POST') {
            let body = ''; for await (const part of req) body += part;
            const batch = JSON.parse(body);
            writes.push(batch);
            if (holdWrite) await holdWrite;
            if (failWrites) { res.end(JSON.stringify({ error: { message: 'Simulated outage' } })); return; }
            batch.forEach(row => rows.set(key(row), row));
            res.end(JSON.stringify({ error: null }));
            for (const page of pages) for (const row of batch) {
                if (!page.isClosed()) page.evaluate(row => window.receivePixel?.({ eventType: 'UPDATE', new: row }), row).catch(() => {});
            }
        } else {
            const data = [...rows.values()].sort((a, b) => a.x - b.x || a.y - b.y)
                .slice(Number(url.searchParams.get('from')), Number(url.searchParams.get('to')) + 1);
            const gate = holdRead;
            if (gate) { holdRead = null; await gate; }
            res.end(JSON.stringify({ data, error: null }));
        }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${server.address().port}`;
    const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || (existsSync(chrome) ? chrome : undefined) });
    t.after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });
    let context;
    async function reset(initial = []) {
        if (context) await context.close();
        rows = new Map(initial.map(row => [key(row), row]));
        failWrites = false; holdWrite = null; holdRead = null; writes = []; pages = [];
        context = await browser.newContext();
        await context.addInitScript(fakeClient);
    }
    async function open(ctx = context) {
        const page = await ctx.newPage();
        pages.push(page);
        await page.goto(url);
        await page.locator('#paintBtn').click();
        await settled(page);
        return page;
    }

    await t.test('reloads pixels beyond the first 1,000, including the last cell', async () => {
        await reset(Array.from({ length: 4021 }, (_, i) => ({ x: Math.floor(i / 100), y: i % 100, color: '#3F48CC' }))
            .concat({ x: 99, y: 99, color: '#22B14C' }));
        const page = await open();
        assert.equal(await colorAt(page, 40, 20), '#3F48CC');
        assert.equal(await colorAt(page, 99, 99), '#22B14C');
        await paint(page, 90, 90);
        await settled(page);
        await page.locator('#paintClose').click();
        await page.reload(); await page.locator('#paintBtn').click(); await settled(page);
        assert.equal(await colorAt(page, 90, 90), '#ED1C24');
    });

    await t.test('another tab sees strokes before the server finishes saving', async () => {
        await reset();
        const a = await open(), b = await open();
        let release; holdWrite = new Promise(resolve => { release = resolve; });
        await paint(a, 8, 9);
        await until(async () => await colorAt(b, 8, 9) === '#ED1C24', 'Tab B missed the local stroke');
        assert.equal(rows.size, 0, 'Stroke should be visible while the save is still pending');
        release(); holdWrite = null;
        await settled(a); await settled(b);
        assert.equal(rows.get('8,9').color, '#ED1C24');
    });

    await t.test('failed saves survive closing the drawing tab and retry on reopen', async () => {
        await reset(); failWrites = true;
        const a = await open();
        await paint(a, 21, 22);
        await a.waitForFunction(() => document.getElementById('paintStatus').textContent.includes('retrying'));
        await a.close();
        const b = await context.newPage(); pages.push(b);
        await b.goto(url); await b.locator('#paintBtn').click();
        assert.equal(await colorAt(b, 21, 22), '#ED1C24');
        failWrites = false;
        await b.evaluate(() => window.dispatchEvent(new Event('online')));
        await settled(b);
        assert.equal(rows.get('21,22').color, '#ED1C24');
        assert.equal(await b.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('asfc-paint-pending')).length), 0);
    });

    await t.test('an older save cannot discard a newer color on the same cell', async () => {
        await reset(); const page = await open();
        let release; holdWrite = new Promise(resolve => { release = resolve; });
        await paint(page, 12, 13);
        await until(() => writes.length === 1, 'First stroke did not start saving');
        await page.locator('[data-color="#22B14C"]').click();
        await paint(page, 12, 13);
        release(); holdWrite = null;
        await settled(page);
        assert.equal(rows.get('12,13').color, '#22B14C');
        assert.equal(await colorAt(page, 12, 13), '#22B14C');
    });

    await t.test('a slow snapshot cannot overwrite painting or newer realtime events', async () => {
        await reset([{ x: 1, y: 1, color: '#000000' }]); const page = await open();
        let release; holdRead = new Promise(resolve => { release = resolve; });
        await page.evaluate(() => window.dispatchEvent(new Event('focus')));
        await until(() => holdRead === null, 'Snapshot did not start');
        await paint(page, 1, 1);
        await page.evaluate(() => window.receivePixel({ eventType: 'UPDATE', new: { x: 2, y: 2, color: '#22B14C' } }));
        await until(() => rows.get('1,1').color === '#ED1C24', 'Stroke did not save');
        release();
        await settled(page);
        assert.equal(await colorAt(page, 1, 1), '#ED1C24');
        assert.equal(await colorAt(page, 2, 2), '#22B14C');
    });

    await t.test('separate browsers get realtime strokes and catch up after reconnect', async () => {
        await reset(); const a = await open();
        const other = await browser.newContext(); await other.addInitScript(fakeClient);
        try {
            const b = await open(other);
            await paint(a, 30, 31); await settled(a);
            await until(async () => await colorAt(b, 30, 31) === '#ED1C24', 'Remote browser missed the saved stroke');
            await b.evaluate(() => window.channelStatus('CHANNEL_ERROR'));
            rows.set('32,33', { x: 32, y: 33, color: '#3F48CC' });
            await b.evaluate(() => window.channelStatus('SUBSCRIBED')); await settled(b);
            assert.equal(await colorAt(b, 32, 33), '#3F48CC');
            rows.delete('32,33');
            await b.evaluate(() => window.receivePixel({ eventType: 'DELETE', old: { x: 32, y: 33 } }));
            assert.equal(await colorAt(b, 32, 33), '#FFFFFF');
        } finally { await other.close(); }
    });
});
