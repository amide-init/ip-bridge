# ip-bridge

A TCP proxy that gives serverless apps (Vercel, Netlify, etc.) a **static outgoing IP** for MongoDB Atlas.

Serverless platforms use dynamic IPs, making it impossible to whitelist your app in MongoDB Atlas. ip-bridge runs on a VM with a static IP and transparently forwards your MongoDB connections — no code changes needed.

```
Next.js on Vercel (dynamic IP) → ip-bridge on Oracle VM (static IP) → MongoDB Atlas
```

## Install

```bash
npm install -g ip-bridge
```

## Setup on your VM (Oracle Cloud / AWS)

```bash
# 1. Create .env config
ip-bridge init

# 2. Edit .env — set MONGODB_TARGET to your Atlas cluster host
nano .env

# 3. Start the proxy
ip-bridge start
```

## Configuration

`.env` on your VM:

```env
# Port to listen on (MongoDB default is 27017)
PORT=27017

# Your MongoDB Atlas cluster host and port
# Find this in Atlas: Connect → Drivers → copy the host from the URI
# Format: your-cluster.mongodb.net:27017
MONGODB_TARGET=your-cluster.mongodb.net:27017
```

To find `MONGODB_TARGET`: go to MongoDB Atlas → Connect → Drivers → copy the hostname from the connection string.

## Usage in your Next.js / Vercel app

No code changes needed. Just update your environment variable:

```env
# .env.local (Vercel environment variables)
# Before:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# After:
MONGODB_URI=mongodb://user:pass@vm-ip:27017/dbname
```

Your `connectDB`, Mongoose models, and all queries stay exactly the same.

## Deployment

### Oracle Cloud (recommended — always free)

1. Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Create an **Always Free** VM instance (Ampere A1 or AMD E2)
3. Note the **public IP** — this is your static IP
4. Open port `27017` in the Oracle Cloud security list
5. SSH into the VM and run the setup above
6. **Whitelist the VM's public IP** in MongoDB Atlas → Network Access

### Keep it running with PM2

```bash
npm install -g pm2
pm2 start "ip-bridge start" --name ip-bridge
pm2 save && pm2 startup
```

### Other providers

- [AWS EC2](https://aws.amazon.com/free/) (free tier, 12 months)
- Any VPS with a static IP (DigitalOcean, Hetzner, etc.)

## How it works

ip-bridge is a TCP proxy using Node.js built-in `net` and `tls` modules. It listens on port 27017, accepts raw MongoDB connections, and forwards them to Atlas over TLS. From Atlas's perspective, all traffic comes from one IP — your VM.

## Security

- Atlas only accepts connections from your VM's whitelisted IP
- MongoDB credentials are still required — anyone connecting through the VM still needs a valid username and password
- Only one dependency: `dotenv`

## License

MIT
