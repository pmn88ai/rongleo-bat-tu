/**
 * LRU Cache Service — Vercel serverless compatible
 * Same interface as backendjs/src/services/cache.service.js
 * NOTE: Cache is per-instance in serverless (no shared memory across invocations).
 * This is acceptable for bazi calculations — cache still helps within warm instances.
 */

'use strict';

const LRUCache = require('lru-cache');

const cache = new LRUCache({
    max: 500,
    ttl: 1000 * 60 * 60 * 6, // 6 hours (shorter than original 24h — suits serverless)
    allowStale: false,
    updateAgeOnGet: true
});

module.exports = {
    get: function(key) {
        return cache.get(key);
    },

    set: function(key, value) {
        cache.set(key, value);
    },

    generateKey: function(params) {
        try {
            const { year, month, day, hour, minute, gender, calendar } = params;
            const core = { year: year, month: month, day: day, hour: hour, minute: minute, gender: gender, calendar: calendar };
            return JSON.stringify(core, Object.keys(core).sort());
        } catch(e) {
            return JSON.stringify(params);
        }
    },

    getOrSet: async function(key, asyncFn) {
        const cached = cache.get(key);
        if (cached !== undefined) return cached;
        const result = await asyncFn();
        cache.set(key, result);
        return result;
    }
};
