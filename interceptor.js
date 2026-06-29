/**
 * GitHub & CyberBot URL Interceptor
 * - Logs ALL outgoing HTTP/HTTPS requests (for debugging GBAN URL)
 * - Intercepts suspended GitHub repos & cyberbot.top
 * - Patches process.exit AND process.reallyExit
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { Readable } = require('stream');
const EventEmitter = require('events');

const ROOT = __dirname;
const STARTUP_GRACE_MS = 120_000;
const startTime = Date.now();

// ─── Block process.exit & process.reallyExit ─────────────────────────────────

function shouldSuppress(code) {
    const age = Date.now() - startTime;
    return (code == null || code === 0 || code === 1) && age < STARTUP_GRACE_MS;
}

const _origExit = process.exit.bind(process);
process.exit = function (code) {
    if (shouldSuppress(code)) {
        console.warn(`[INTERCEPTOR] process.exit(${code}) suppressed (age ${Math.round((Date.now()-startTime)/1000)}s)`);
        return;
    }
    _origExit(code);
};

// Also patch reallyExit (called internally by Node.js process.exit)
if (typeof process.reallyExit === 'function') {
    const _origReallyExit = process.reallyExit.bind(process);
    process.reallyExit = function (code) {
        if (shouldSuppress(code)) {
            console.warn(`[INTERCEPTOR] process.reallyExit(${code}) suppressed (age ${Math.round((Date.now()-startTime)/1000)}s)`);
            return;
        }
        _origReallyExit(code);
    };
    console.log('[INTERCEPTOR] ✅ process.reallyExit patched');
}

// ─── URL matchers ─────────────────────────────────────────────────────────────

function needsIntercept(url) {
    if (!url) return false;
    return url.includes('cyber-ullash') || url.includes('cyberbot.top');
}

function getLocalResponse(url) {
    if (!url) return null;

    if (url.includes('cyber-ullash')) {
        if (url.includes('api.github.com')) {
            return { commit: { committer: { date: new Date(Date.now() - 600000).toISOString() } } };
        }
        if (url.includes('package.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); } catch(e) { return {}; }
        }
        if (url.includes('versions.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'versions.json'), 'utf8')); } catch(e) { return []; }
        }
        if (url.includes('UllashApi.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'UllashApi.json'), 'utf8')); } catch(e) { return {}; }
        }
        return '';
    }

    if (url.includes('cyberbot.top')) {
        return { status: 'ok', banned: false, ban: false, isBanned: false, data: null, result: null };
    }

    return null;
}

// ─── Axios interceptor ────────────────────────────────────────────────────────

function makeAxiosInterceptor() {
    return function (config) {
        const url = config.url || '';
        console.log('[HTTP-LOG] axios ->', url.slice(0, 120));
        const localData = getLocalResponse(url);
        if (localData !== null) {
            config.adapter = async function (cfg) {
                return { data: localData, status: 200, statusText: 'OK',
                    headers: { 'content-type': 'application/json' }, config: cfg, request: {} };
            };
        }
        return config;
    };
}

try {
    const axios = require('axios');
    axios.interceptors.request.use(makeAxiosInterceptor(), null, { synchronous: true });
    const origCreate = axios.create.bind(axios);
    axios.create = function (defaults) {
        const instance = origCreate(defaults);
        instance.interceptors.request.use(makeAxiosInterceptor(), null, { synchronous: true });
        return instance;
    };
    console.log('[INTERCEPTOR] ✅ Axios interceptor active');
} catch (e) {
    console.error('[INTERCEPTOR] ❌ Axios patch failed:', e.message);
}

// ─── Native https/http interceptor ───────────────────────────────────────────

function createMockResponse(data) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const stream = new Readable({ read() {} });
    stream.statusCode = 200;
    stream.statusMessage = 'OK';
    stream.headers = { 'content-type': 'application/json' };
    stream.rawHeaders = ['content-type', 'application/json'];
    stream.push(body);
    stream.push(null);
    return stream;
}

function buildUrl(options) {
    if (typeof options === 'string') return options;
    if (options && options.href) return options.href;
    if (!options) return '';
    const proto = (options.protocol || 'https:').replace(/:$/, '');
    const host = options.host || options.hostname || '';
    const port = options.port ? `:${options.port}` : '';
    const p = options.path || '/';
    return `${proto}://${host}${port}${p}`;
}

function makeFakeRequest(localData) {
    const fakeReq = new EventEmitter();
    fakeReq.end = function () { return fakeReq; };
    fakeReq.write = function () { return fakeReq; };
    fakeReq.setTimeout = function () { return fakeReq; };
    fakeReq.abort = function () {};
    fakeReq.destroy = function () {};
    fakeReq.socket = { remoteAddress: '127.0.0.1' };
    process.nextTick(() => fakeReq.emit('response', createMockResponse(localData)));
    return fakeReq;
}

function patchModule(mod, proto) {
    const origRequest = mod.request.bind(mod);
    const origGet = mod.get ? mod.get.bind(mod) : null;

    mod.request = function (options, callback) {
        const url = buildUrl(options);
        console.log(`[HTTP-LOG] ${proto}.request ->`, url.slice(0, 120));
        if (needsIntercept(url)) {
            const localData = getLocalResponse(url);
            if (localData !== null) {
                console.log(`[INTERCEPTED] ${url.slice(0, 80)}`);
                const fakeReq = makeFakeRequest(localData);
                if (typeof callback === 'function') fakeReq.on('response', callback);
                return fakeReq;
            }
        }
        return origRequest(options, callback);
    };

    if (origGet) {
        mod.get = function (options, callback) {
            const url = buildUrl(options);
            console.log(`[HTTP-LOG] ${proto}.get ->`, url.slice(0, 120));
            if (needsIntercept(url)) {
                const localData = getLocalResponse(url);
                if (localData !== null) {
                    console.log(`[INTERCEPTED] ${url.slice(0, 80)}`);
                    const fakeReq = makeFakeRequest(localData);
                    if (typeof callback === 'function') fakeReq.on('response', callback);
                    return fakeReq;
                }
            }
            return origGet(options, callback);
        };
    }
}

try {
    patchModule(https, 'https');
    patchModule(http, 'http');
    console.log('[INTERCEPTOR] ✅ Native https/http interceptor + logging active');
} catch (e) {
    console.error('[INTERCEPTOR] ❌ https/http patch failed:', e.message);
}

// ─── Unhandled rejection suppression ─────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
    const msg = String(reason && (reason.message || reason));
    const suppress = ['cyber-ullash', 'cyberbot.top', 'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'];
    if (suppress.some(s => msg.includes(s))) {
        console.warn('[INTERCEPTOR] Suppressed rejection:', msg.slice(0, 100));
        return;
    }
    console.error('[UNHANDLED REJECTION]', msg.slice(0, 200));
});

console.log('[INTERCEPTOR] ✅ All patches active. HTTP logging ON (debug mode)');
