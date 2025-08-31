const { ServiceBusClient } = require('@azure/service-bus');


function createBusClient() {
const connectionString = process.env.SERVICEBUS_CONNECTION_STRING;
const retryOptions = {
// simple retry tuning via env; SDK also supports exponential retry
maxRetries: Number(process.env.SB_RETRY_MAX_TRIES || 5),
retryDelayInMs: Number(process.env.SB_RETRY_DELAY_MS || 1000)
};
return new ServiceBusClient(connectionString, { retryOptions });
}


module.exports = { createBusClient };