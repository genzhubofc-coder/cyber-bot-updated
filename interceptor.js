/**
 * GitHub URL Interceptor
 * Intercepts axios requests to suspended GitHub URLs
 * and returns local project files instead.
 * Uses per-request adapter override — no fallback adapter needed.
 */
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;

function getLocalResponse(url) {
    if (!url) return null;

    // cyber-ullash/CYBER-GOAT-BOT repo
    if (url.includes('cyber-ullash') && url.includes('CYBER-GOAT-BOT')) {
        if (url.includes('package.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')); }
            catch (e) { return {}; }
        }
        if (url.includes('versions.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'versions.json'), 'utf8')); }
            catch (e) { return []; }
        }
        return ''; // any other file from this repo
    }

    // GitHub API commits endpoint
    if (url.includes('api.github.com') && url.includes('cyber-ullash')) {
        return {
            commit: {
                committer: {
                    date: new Date(Date.now() - 10 * 60 * 1000).toISOString()
                }
            }
        };
    }

    // cyber-ullash/cyber-ullash repo (UllashApi.json, fonts, etc.)
    if (url.includes('cyber-ullash/cyber-ullash') || url.includes('cyber-ullash%2Fcyber-ullash')) {
        if (url.includes('UllashApi.json')) {
            try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'UllashApi.json'), 'utf8')); }
            catch (e) { return { bank: null, api: null, api2: null, album: null }; }
        }
        return null;
    }

    return null;
}

try {
    const axios = require('axios');

    // Use request interceptor — sets a custom adapter PER REQUEST only for blocked URLs.
    // All other requests continue with axios's default adapter untouched.
    axios.interceptors.request.use(function (config) {
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
    }, null, { synchronous: true });

    // Also patch axios.create so new instances inherit the interceptor
    const origCreate = axios.create.bind(axios);
    axios.create = function (defaults) {
        const instance = origCreate(defaults);
        instance.interceptors.request.use(function (config) {
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
        }, null, { synchronous: true });
        return instance;
    };

    console.log('[INTERCEPTOR] ✅ Suspended GitHub URL interceptor active');
} catch (e) {
    console.error('[INTERCEPTOR] ❌ Failed to patch axios:', e.message);
}
