/**
 * GitHub URL Interceptor
 * Blocks ALL requests to suspended cyber-ullash GitHub accounts
 * and returns local data or safe empty responses instead.
 */
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;

function getLocalResponse(url) {
    if (!url) return null;

    const isCyberUllash = url.includes('cyber-ullash');
    if (!isCyberUllash) return null;

    // === cyber-ullash/CYBER-GOAT-BOT repo ===
    if (url.includes('CYBER-GOAT-BOT')) {
        if (url.includes('package.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); }
            catch (e) { return {}; }
        }
        if (url.includes('versions.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'versions.json'), 'utf8')); }
            catch (e) { return []; }
        }
        // Any other file from CYBER-GOAT-BOT repo → empty
        return '';
    }

    // === GitHub API for cyber-ullash ===
    if (url.includes('api.github.com') && url.includes('cyber-ullash')) {
        return {
            commit: {
                committer: {
                    date: new Date(Date.now() - 10 * 60 * 1000).toISOString()
                }
            }
        };
    }

    // === cyber-ullash/cyber-ullash repo (ALL files) ===
    if (url.includes('cyber-ullash')) {
        if (url.includes('UllashApi.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'UllashApi.json'), 'utf8')); }
            catch (e) { return { bank: null, api: null, api2: null, album: null }; }
        }
        // startedversion.txt, english.ttf, and any other file → safe empty response
        return '';
    }

    return null;
}

function makeInterceptor() {
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

    // Add interceptor to default axios instance
    axios.interceptors.request.use(makeInterceptor(), null, { synchronous: true });

    // Patch axios.create so all new instances also get the interceptor
    const origCreate = axios.create.bind(axios);
    axios.create = function (defaults) {
        const instance = origCreate(defaults);
        instance.interceptors.request.use(makeInterceptor(), null, { synchronous: true });
        return instance;
    };

    console.log('[INTERCEPTOR] ✅ Suspended GitHub URL interceptor active');
} catch (e) {
    console.error('[INTERCEPTOR] ❌ Failed to patch axios:', e.message);
}

// Prevent unhandled promise rejections from crashing the process
process.on('unhandledRejection', (reason, promise) => {
    const msg = reason && (reason.message || String(reason));
    if (msg && (msg.includes('cyber-ullash') || msg.includes('404') || msg.includes('No valid axios'))) {
        console.warn('[INTERCEPTOR] Suppressed unhandled rejection:', msg);
        return;
    }
    console.error('[UNHANDLED REJECTION]', reason);
});
