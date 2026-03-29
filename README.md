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
# 1. Create config
ip-bridge init

# 2. Edit server/config.json with your credentials

# 3. Start the server
ip-bridge start
```

## Configuration

Copy `server/config.example.json` to `server/config.json` and fill in your values:

```json
{
  "port": 3000,
  "allowedUsers": [
    { "apiKey": "your-secret-key" }
  ],
  "adapters": {
    "mongodb": {
      "uri": "mongodb+srv://user:password@cluster.mongodb.net/dbname"
    },
    "http": {
      "targetBaseUrl": "https://api.example.com"
    }
  }
}
```

Adapters are **auto-enabled** based on what's present in config — only include what you need.

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

Forwards any HTTP request to `targetBaseUrl`.

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

## Health Check

```
GET /health
→ { "status": "ok" }
```

## Deployment

Deploy on any VM with a static IP:

- [Oracle Cloud](https://www.oracle.com/cloud/free/) (Always Free tier)
- [AWS EC2](https://aws.amazon.com/free/) (Free tier for 12 months)

```bash
# On your VM
git clone https://github.com/amide-init/ip-bridge
cd ip-bridge
npm install
cp server/config.example.json server/config.json
# edit config.json
node server/index.js
```

Then **whitelist your VM's static IP** in MongoDB Atlas or your target service.

## License

MIT
