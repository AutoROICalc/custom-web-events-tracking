'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const vm = require('vm');

async function test(format, wrapped) {
  const requests = [];
  const storage = new Map();
  let accesses = 0;
  let allowStorage = false;
  const touch = () => { accesses++; if (!allowStorage) throw new Error('Unexpected storage access'); };
  const localStorage = {
    getItem(key) { touch(); return storage.get(key) || null; },
    setItem(key, value) { touch(); storage.set(key, String(value)); }
  };
  const document = {};
  Object.defineProperty(document, 'cookie', { get() { touch(); return ''; }, set() { touch(); } });
  Object.defineProperty(document, 'referrer', { get() { accesses++; throw new Error('Unexpected referrer read'); } });
  const window = {};
  Object.defineProperty(window, 'location', { get() { accesses++; throw new Error('Unexpected URL read'); } });
  Object.defineProperty(window, 'sessionStorage', { get() { accesses++; throw new Error('Unexpected session storage'); } });
  const sandbox = {
    window, document, localStorage, URL, URLSearchParams, console,
    fetch: async (url, options) => { requests.push({ url, options }); return {}; }
  };
  let arc;
  if (format === 'commonjs') {
    sandbox.module = { exports: {} };
    sandbox.exports = sandbox.module.exports;
  } else if (format === 'amd') {
    sandbox.define = (dependencies, factory) => { arc = factory(); };
    sandbox.define.amd = {};
  }
  vm.runInNewContext(fs.readFileSync(__dirname + '/auto-roi-calc.js', 'utf8'), sandbox);
  arc = arc || (sandbox.module ? sandbox.module.exports : sandbox.AutoRoiCalc);
  if (wrapped) {
    const wrapperModule = { exports: {} };
    vm.runInNewContext(fs.readFileSync(__dirname + '/index.js', 'utf8'), {
      module: wrapperModule, require: name => { assert.equal(name, './auto-roi-calc'); return arc; }
    });
    arc = new wrapperModule.exports.AutoRoiCalc('publisher_tracking_token');
  } else {
    arc.setTrackingId('publisher_tracking_token');
  }
  assert.equal(arc.hasConsent(), false);
  assert.equal(arc.appendNewSource(), false);
  assert.equal(arc.sendEvent('lead', 'signup'), false);
  assert.equal(arc.setSourcesCookie(), false);
  assert.equal(arc.getSources().length, 0);
  assert.equal(accesses, 0);
  assert.equal(requests.length, 0);
  assert.equal(arc.sendAnonymousEvent('', 'signup'), false);
  assert.equal(arc.sendAnonymousEvent('x'.repeat(256), 'signup'), false);
  assert.equal(arc.sendAnonymousEvent(42, 'signup'), false);
  for (let i = 0; i < 2; i++) assert.equal(arc.sendAnonymousEvent('button_click', 'pricing_signup'), true);
  arc.setConsent({ analytics: true });
  assert.equal(arc.sendAnonymousEvent('button_click', 'pricing_signup'), true);
  assert.equal(accesses, 0, 'Anonymous events must remain anonymous after consent');
  assert.equal(requests.length, 3);
  for (const { url, options } of requests) {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/record/collect_anonymous_event');
    assert.deepEqual(Array.from(parsed.searchParams.keys()).sort(), ['desc', 'trackingId', 'type']);
    assert.equal(parsed.searchParams.get('trackingId'), 'publisher_tracking_token');
    assert.equal(parsed.searchParams.get('type'), 'button_click');
    assert.equal(options.mode, 'no-cors');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
  }
  for (const eventType of ['button_hover', 'button_visible']) {
    assert.equal(arc.sendAnonymousEvent(eventType, 'pricing_engagement'), true);
    const request = requests[requests.length - 1];
    assert.equal(new URL(request.url).searchParams.get('type'), eventType);
    assert.deepEqual(Array.from(new URL(request.url).searchParams.keys()).sort(), ['desc', 'trackingId', 'type']);
  }
  assert.equal(accesses, 0, 'Hover and visibility event labels must not access storage');
  allowStorage = true;
  assert.equal(arc.appendNewSource('newsletter', false), true);
  assert.equal(arc.sendEvent('lead', 'signup', 1, false), true);
  assert.equal(arc.setSourcesCookie(), true);
  assert(accesses > 0, 'Attribution should work after consent');
  const previousAccesses = accesses;
  arc.setConsent({ analytics: false, marketing: false });
  assert.equal(arc.sendEvent('lead', 'signup'), false);
  assert.equal(arc.appendNewSource(), false);
  assert.equal(arc.setSourcesCookie(), false);
  assert.equal(arc.getSources().length, 0);
  assert.equal(accesses, previousAccesses, 'Revocation blocks all attribution access');
  assert.equal(arc.sendAnonymousEvent('button_click', 'pricing_signup'), true);
  assert.equal(accesses, previousAccesses);
  await new Promise(resolve => setImmediate(resolve));
}

(async () => {
  for (const format of ['browser', 'commonjs', 'amd']) await test(format, false);
  if (fs.existsSync(__dirname + '/index.js')) await test('commonjs', true);
  console.log('Tracking module privacy and consent tests passed (browser, CommonJS, AMD, npm wrapper when present).');
})().catch(error => { console.error(error); process.exitCode = 1; });
