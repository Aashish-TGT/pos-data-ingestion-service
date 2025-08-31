require('dotenv').config();
const { createBusClient } = require('./bus');


const busClient = createBusClient();
const queueName = process.env.SERVICEBUS_QUEUE_NAME;
const receiver = busClient.createReceiver(queueName, { receiveMode: 'peekLock' });


// Simulated processing function
async function processTransaction(message) {
const tx = message.body;
// Example: randomly fail to demonstrate retries/DLQ
if (tx.amount > 1_000_000) {
throw new Error('Amount too large – business rule');
}
console.log('Processed', tx.transactionId, tx.amount);
}


receiver.subscribe({
async processMessage(message) {
try {
await processTransaction(message);
await receiver.completeMessage(message);
} catch (err) {
console.error('Processing error for', message.messageId, err.message);


// Option A: abandon -> message will be retried until MaxDeliveryCount, then auto DLQ
// await receiver.abandonMessage(message);


// Option B: explicit dead-letter to send immediately to DLQ with reason
await receiver.deadLetterMessage(message, {
deadLetterReason: 'BusinessRuleViolation',
deadLetterErrorDescription: err.message
});
}
},
async processError(err) {
console.error('Receiver error:', err);
}
});


process.on('SIGINT', async () => {
await receiver.close();
await busClient.close();
process.exit(0);
});