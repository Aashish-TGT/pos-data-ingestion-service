require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { createBusClient } = require('./bus');
const { transactionSchema } = require('./schemas/transaction');
const apiKey = require('./utils/apiKey');
const { wasProcessed, markProcessed } = require('./utils/idempotency');


const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));


const busClient = createBusClient();
const queueName = process.env.SERVICEBUS_QUEUE_NAME;
const sender = busClient.createSender(queueName);


// health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));


// ingest endpoint
app.post('/ingest', apiKey, async (req, res) => {
// Validate
const parsed = transactionSchema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ error: 'ValidationError', details: parsed.error.flatten() });
}


const tx = parsed.data;


// Idempotency (demo): reject duplicates
if (wasProcessed(tx.transactionId)) {
return res.status(200).json({ status: 'duplicate', transactionId: tx.transactionId });
}


try {
// Enqueue one message with useful properties
await sender.sendMessages({
body: tx,
applicationProperties: {
schema: 'transaction-v1',
method: tx.method
},
messageId: tx.transactionId
});


markProcessed(tx.transactionId);
return res.status(202).json({ status: 'enqueued', transactionId: tx.transactionId });
} catch (err) {
console.error('Failed to send to Service Bus:', err);
return res.status(503).json({ error: 'QueueUnavailable', message: err.message });
}
});


const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log(`API listening on :${port}`));


// graceful shutdown
async function shutdown() {
console.log('Shutting down...');
try { await sender.close(); } catch {}
try { await busClient.close(); } catch {}
server.close(() => process.exit(0));
}


process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);