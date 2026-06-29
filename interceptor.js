/**
 * GitHub URL Interceptor
 * Intercepts all axios requests to suspended GitHub URLs
 * and returns local project files instead.
 */
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;

function getLocalResponse(url) {
    if (!url) return null;

    // cyber-ullash/CYBER-GOAT-BOT repo requests
    if (url.includes('cyber-ullash') && url.includes('CYBER-GOAT-BOT')) {
        if (url.includes('package.json')) {
            try {
                return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
            } catch (e) { return {}; }
        }
        if (url.includes('versions.json')) {
            try {
                return JSON.parse(fs.readFileSync(path.join(ROOT, 'versions.json'), 'utf8'));
            } catch (e) { return []; }
        }
        // Any other file from the repo — return empty string
        return '';
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
            try {
                return JSON.parse(fs.readFileSync(path.join(ROOT, 'UllashApi.json'), 'utf8'));
            } catch (e) { return { bank: null, api: null, api2: null, album: null }; }
        }
        return null;
    }

    return null;
}

try {
    const axios = require('axios');

    // Save reference to original adapter
    let originalAdapter = axios.defaults.adapter;

    // Create intercepted adapter
    const interceptedAdapter = async function (config) {
        const url = config.url || '';
        const localData = getLocalResponse(url);

        if (localData !== null) {
            return {
                data: localData,
                status: 200,
                statusText: 'OK',
                headers: { 'content-type': 'application/json' },
                config: config,
                request: {}
            };
        }

        // Resolve actual adapter for non-intercepted URLs
        if (!originalAdapter || typeof originalAdapter !== 'function') {
            try {
                originalAdapter = require('axios/lib/adapters/http');
            } catch (e) {
                try {
                    const adapters = require('axios/lib/adapters/adapters');
                    originalAdapter = adapters.getAdapter ? adapters.getAdapter('http') : adapters;
                } catch (e2) { }
            }
        }

        if (typeof originalAdapter === 'function') {
            return originalAdapter(config);
        }

        throw new Error('No valid axios adapter found');
    };

    // Apply to global axios defaults
    axios.defaults.adapter = interceptedAdapter;

    // Patch axios.create so new instances also get intercepted
    const origCreate = axios.create.bind(axios);
    axios.create = function (defaults) {
        const instance = origCreate(defaults);
        instance.defaults.adapter = interceptedAdapter;
        return instance;
    };

    console.log('[INTERCEPTOR] ✅ Suspended GitHub URL interceptor active');
} catch (e) {
    console.error('[INTERCEPTOR] ❌ Failed to patch axios:', e.message);
}
