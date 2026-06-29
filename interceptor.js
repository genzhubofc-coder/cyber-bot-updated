/**
 * GitHub & CyberBot URL Interceptor
 * Blocks ALL requests to suspended cyber-ullash GitHub accounts
 * AND cyberbot.top APIs, returning local/safe responses.
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { Readable } = require('stream');

const ROOT = __dirname;

// ─── URL matchers ────────────────────────────────────────────────────────────

function isSuspendedGitHub(url) {
    return url && url.includes('cyber-ullash');
}

function isCyberBotTop(url) {
    return url && url.includes('cyberbot.top');
}

function needsIntercept(url) {
    return isSuspendedGitHub(url) || isCyberBotTop(url);
}

// ─── Local data lookup ───────────────────────────────────────────────────────

function getLocalResponse(url) {
    if (!url) return null;

    // All cyber-ullash GitHub repos
    if (isSuspendedGitHub(url)) {
        if (url.includes('CYBER-GOAT-BOT')) {
            if (url.includes('package.json')) {
                try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); }
                catch (e) { return {}; }
            }
            if (url.includes('versions.json')) {
                try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'versions.json'), 'utf8')); }
                catch (e) { return []; }
            }
            return ''; // any other CYBER-GOAT-BOT file
        }
        if (url.includes('api.github.com')) {
            return { commit: { committer: { date: new Date(Date.now() - 10 * 60 * 1000).toISOString() } } };
        }
        if (url.includes('UllashApi.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'UllashApi.json'), 'utf8')); }
            catch (e) { return { bank: null, api: null, api2: null, album: null }; }
        }
        return ''; // any other cyber-ullash URL
    }

    // cyberbot.top — return "not banned" for GBAN checks, empty for others
    if (isCyberBotTop(url)) {
        if (url.includes('gban') || url.includes('ban') || url.includes('check')) {
            return { status: 'ok', banned: false, ban: false, isBanned: false, data: { banned: false } };
        }
        // Other cyberbot.top APIs (bank, namaz, quiz, etc.) — return empty success
        return { status: 'ok', data: null, result: null };
    }

    return null;
}

// ─── Axios interceptor (per-request adapter) ─────────────────────────────────

function makeAxiosInterceptor() {
    return function (config) {
        const url = config.url || '';
        const localData = getLocalResponse(url);
        if (localData !== null) {
            config.adapter = async function (cfg) {
                return {
                    data: localData,
                    status: 200,
                    statusText: 'OK',
                    headers: { 'content-type': 'application/json' },
                    config: cfg,
                    request: {}
                };
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

// ─── Native https/http interceptor (for obfuscated code that bypasses axios) ──

function createMockResponse(data) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const stream = new Readable({ read() {} });
    stream.statusCode = 200;
    stream.statusMessage = 'OK';
    stream.headers = { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(body)) };
    stream.push(body);
    stream.push(null);
    return stream;
}

function buildUrl(options) {
    if (typeof options === 'string') return options;
    const proto = options.protocol || 'https:';
    const host = options.host || options.hostname || '';
    const p = options.path || '/';
    return `${proto}//${host}${p}`;
}

function patchModule(mod, proto) {
    const origRequest = mod.request.bind(mod);
    const origGet = mod.get.bind(mod);

    mod.request = function (options, callback) {
        const url = buildUrl(options);
        const localData = getLocalResponse(url);
        if (localData !== null) {
            const mockRes = createMockResponse(localData);
            if (callback) process.nextTick(() => callback(mockRes));
            // Return a fake ClientRequest-like object
            const fakeReq = new (require('events').EventEmitter)();
            fakeReq.end = () => fakeReq;
            fakeReq.write = () => fakeReq;
            fakeReq.setTimeout = () => fakeReq;
            fakeReq.abort = () => {};
            fakeReq.destroy = () => {};
            process.nextTick(() => fakeReq.emit('response', mockRes));
            return fakeReq;
        }
        return origRequest(options, callback);
    };

    mod.get = function (options, callback) {
        const url = buildUrl(options);
        const localData = getLocalResponse(url);
        if (localData !== null) {
            const mockRes = createMockResponse(localData);
            if (callback) process.nextTick(() => callback(mockRes));
            const fakeReq = new (require('events').EventEmitter)();
            fakeReq.end = () => fakeReq;
            fakeReq.abort = () => {};
            fakeReq.destroy = () => {};
            return fakeReq;
        }
        return origGet(options, callback);
    };
}

try {
    patchModule(https, 'https');
    patchModule(http, 'http');
    console.log('[INTERCEPTOR] ✅ Native https/http interceptor active');
} catch (e) {
    console.error('[INTERCEPTOR] ❌ https/http patch failed:', e.message);
}

// ─── Prevent unhandled rejections from crashing the process ──────────────────

process.on('unhandledRejection', (reason) => {
    const msg = reason && (reason.message || String(reason));
    if (!msg) return;
    const suppress = ['cyber-ullash', 'cyberbot.top', '404', 'No valid axios', 'ECONNREFUSED', 'ENOTFOUND'];
    if (suppress.some(s => msg.includes(s))) {
        console.warn('[INTERCEPTOR] Suppressed rejection:', msg.slice(0, 120));
        return;
    }
    console.error('[UNHANDLED REJECTION]', msg);
});
