// src/utils/idempotency.js
const seen = new Map(); // transactionId -> timestamp


function wasProcessed(id) {
return seen.has(id);
}


function markProcessed(id) {
if (id) seen.set(id, Date.now());
}


function purgeOlderThan(ms = 3600_000) {
const now = Date.now();
for (const [k, v] of seen) {
if (now - v > ms) seen.delete(k);
}
}


setInterval(() => purgeOlderThan(), 60_000).unref();


module.exports = { wasProcessed, markProcessed };