#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const command = process.argv[2];

const commands = {
  init() {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      console.log('.env already exists.');
      return;
    }
    const defaultEnv = `# ip-bridge configuration

# Port to listen on (MongoDB default is 27017)
PORT=27017

# Your MongoDB Atlas cluster host and port
# Find this in Atlas: Connect → Drivers → copy the host from the URI
# Format: your-cluster.mongodb.net:27017
MONGODB_TARGET=your-cluster.mongodb.net:27017
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('Created .env — set MONGODB_TARGET to your Atlas cluster host before starting.');
  },

  start() {
    const entry = path.join(__dirname, '..', 'server', 'proxy.js');
    execSync(`node ${entry}`, { stdio: 'inherit' });
  },
};

if (!command || !commands[command]) {
  console.log('Usage: ip-bridge <command>');
  console.log('Commands:');
  console.log('  init   Create default .env config');
  console.log('  start  Start the TCP proxy');
  process.exit(1);
}

commands[command]();
