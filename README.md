# ip-bridge

A lightweight proxy server that provides a **static outgoing IP** for serverless platforms like Vercel.

Serverless platforms use dynamic IPs, making it impossible to whitelist your app's IP with databases (MongoDB Atlas, PostgreSQL) or restricted APIs. ip-bridge runs on a VM with a static IP and acts as the middleman.

```
Vercel App (dynamic IP) → ip-bridge (static IP VM) → MongoDB / API
```

## Install

```bash
npm install -g ip-bridge
```

## Quick Start

```bash
# 1. Create .env config
ip-bridge init

# 2. Edit .env with your credentials

# 3. Start the server
ip-bridge start
```

## Configuration

Run `ip-bridge init` to generate a `.env` file, then fill in your values:

```env
PORT=3000

# Comma-separated API keys for authenticating requests
API_KEYS=your-secret-key

# MongoDB adapter (remove if not needed)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# HTTP adapter (remove if not needed)
HTTP_TARGET_BASE_URL=https://api.example.com
```

Adapters are **auto-enabled** based on which env vars are present — only include what you need.

## Adapters

### MongoDB

**Route:** `POST /bridge/mongo/query`

```js
const res = await fetch("http://VM_IP:3000/bridge/mongo/query", {
  method: "POST",
  headers: {
    "x-api-key": "your-secret-key",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    collection: "users",
    operation: "find",
    filter: { status: "active" }
  })
});

const { result } = await res.json();
```

**Supported operations:**

| Operation | Description |
|-----------|-------------|
| `find` | Find multiple documents |
| `findOne` | Find a single document |
| `insertOne` | Insert one document |
| `insertMany` | Insert multiple documents |
| `updateOne` | Update a single document |
| `updateMany` | Update multiple documents |
| `deleteOne` | Delete a single document |
| `deleteMany` | Delete multiple documents |
| `aggregate` | Run an aggregation pipeline |
| `countDocuments` | Count matching documents |

### HTTP

**Route:** `ALL /bridge/http/*`

Forwards any HTTP request to `HTTP_TARGET_BASE_URL`.

```js
const res = await fetch("http://VM_IP:3000/bridge/http/users", {
  method: "GET",
  headers: { "x-api-key": "your-secret-key" }
});
```

## Authentication

All requests must include the `x-api-key` header:

```
x-api-key: your-secret-key
```

Multiple keys are supported — set `API_KEYS` as a comma-separated list:

```env
API_KEYS=key-for-vercel,key-for-local-dev
```

## Health Check

```
GET /health
→ { "status": "ok" }
```

## Deployment

The recommended host is **Oracle Cloud Free Tier** — it provides a VM with a permanent public IP at no cost, which is exactly what this tool needs.

### Oracle Cloud (recommended)

1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Create an **Always Free** VM instance (Ampere A1 or AMD E2 shape)
3. Note the public IP — this is the static IP you'll whitelist

```bash
# SSH into your Oracle VM, then:
npm install -g ip-bridge
ip-bridge init
# Edit .env with your credentials
ip-bridge start
```

4. Open port `3000` in the Oracle Cloud security list (or your chosen port)
5. **Whitelist your VM's public IP** in MongoDB Atlas / your target service

### Keep it running with PM2

```bash
npm install -g pm2
pm2 start "ip-bridge start" --name ip-bridge
pm2 save
pm2 startup
```

### Other providers

- [AWS EC2](https://aws.amazon.com/free/) (Free tier, 12 months)
- Any VPS with a static IP (DigitalOcean, Hetzner, etc.)

## License

MIT
