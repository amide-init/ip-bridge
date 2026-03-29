# vercel-ip-bridge

A lightweight Node.js + Express proxy server that provides a **static outgoing IP** for serverless apps (e.g., Vercel). Deployed on a VM (Oracle Cloud / AWS free tier), it acts as a bridge so all outbound requests originate from one fixed IP — enabling IP whitelisting with databases and restricted APIs.

## Architecture

```
Vercel App → vercel-ip-bridge (static IP VM) → Target API / Database
```

## Project Structure

```
vercel-ip-bridge/
├── server/
│   ├── index.js       # Express entry point, starts HTTP server
│   ├── proxy.js       # Request forwarding logic (all HTTP methods)
│   ├── auth.js        # API key validation middleware
│   └── config.json    # targetBaseUrl + allowedUsers (API keys)
├── bin/
│   └── cli.js         # CLI commands (init, start)
├── client/            # Future: client SDK
├── package.json
└── README.md
```

## Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Auth**: API key via `x-api-key` header (no database)
- **Config**: `server/config.json`

## Dev Commands

```bash
npm install          # install dependencies
node server/index.js # start server (default: http://localhost:3000)
```

## Authentication

All requests must include:
```
x-api-key: YOUR_API_KEY
```

## Config Format

```json
{
  "targetBaseUrl": "https://api.example.com",
  "allowedUsers": [
    { "apiKey": "your-secret-key" }
  ]
}
```

## Routing

Requests to `/bridge/*` are forwarded to `targetBaseUrl/*` with the original method and body.

## Roadmap

- **v1**: Basic proxy + API key auth + CLI (init, start)
- **v2**: Client SDK, logging, rate limiting, env var support
- **v3**: `deploy` command, Docker support, multi-target routing

## Security Notes

- Never commit `config.json` with real API keys — use env vars or `.gitignore`
- Validate `x-api-key` on every request before forwarding
- Do not expose internal error details in proxy responses
