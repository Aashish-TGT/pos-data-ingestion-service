# POS Data Ingestion Service 🚀

A microservice to accept and validate POS/ATM transaction data, enqueue messages to **Azure Service Bus**, and support retries & dead-lettering.

---

## 📌 Purpose
- Accepts incoming POS/ATM transaction data via REST API.
- Validates request payload using **JSON schema**.
- Enqueues valid transactions into **Azure Service Bus** for downstream processing.

---

## 🧰 Tech Stack
- **Node.js + Express** – REST API.
- **Zod** – JSON schema validation.
- **Azure Service Bus** – Internal messaging (with retry & DLQ support).
- **API key** – Authentication.
- **Azure API Gateway (APIM)** – Rate limiting (configured outside the service).

---

## ⚙️ Features
- ✅ **JSON Schema Validation** with Zod.  
- ✅ **API Key Authentication** (`x-api-key` header).  
- ✅ **Idempotency check** (basic in-memory cache).  
- ✅ **Azure Service Bus integration** (retries + DLQ support).  
- ✅ **Health Check** (`GET /health`).  
- ✅ **Rate Limiting** via Azure API Gateway policies.  

---
## 📂 Project Structure
pos-data-ingestion-service/
├─ package.json
├─ .env.example
├─ src/
│ ├─ server.js # Express API (validation + enqueue)
│ ├─ consumer.js # Worker for processing messages
│ ├─ bus.js # Azure Service Bus client factory
│ ├─ schemas/ # Zod validation schemas
│ └─ utils/ # Helpers (API key, idempotency)
└─ docker/
└─ Dockerfile


---

## 🔑 Environment Variables
Copy `.env.example` to `.env` and fill with your values:

```env
PORT=8080
API_KEY=change-me-please
SERVICEBUS_CONNECTION_STRING=Endpoint=sb://<namespace>.servicebus.windows.net/;SharedAccessKeyName=<keyname>;SharedAccessKey=<key>
SERVICEBUS_QUEUE_NAME=pos-transactions

# Optional retry settings
SB_RETRY_MAX_TRIES=5
SB_RETRY_DELAY_MS=1000


Run Locally

1.Install dependencies:

npm install


2.Start API:

npm run dev


3.Health check:

curl http://localhost:8080/health


4.Send test transaction:
curl -X POST http://localhost:8080/ingest \
  -H "Content-Type: application/json" \
  -H "x-api-key: change-me-please" \
  -d '{
    "transactionId":"txn_12345",
    "amount":2450.75,
    "currency":"INR",
    "timestamp":"2025-08-30T06:15:30.000Z",
    "posId":"POS-DELHI-01",
    "method":"CARD",
    "cardLast4":"1234"
  }'

Run the Worker

node src/consumer.js
Processes messages from Service Bus.

Retries failed messages.

Moves permanently failing messages to DLQ.



Docker

Build and run with Docker:
docker build -t pos-data-ingestion .
docker run -p 8080:8080 --env-file .env pos-data-ingestion

Security Notes

Use HTTPS behind API Gateway or APIM.

Store secrets in Azure Key Vault (avoid plain .env in production).

Rotate API keys regularly.

Rate Limiting (via Azure APIM)

Apply a policy in APIM:
<policies>
  <inbound>
    <base />
    <rate-limit-by-key calls="1000" renewal-period="60" counter-key="@(context.Request.IpAddress)" />
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
</policies>









