#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const command = process.argv[2];

const commands = {
  init() {
    const configPath = path.join(process.cwd(), 'server', 'config.json');
    if (fs.existsSync(configPath)) {
      console.log('config.json already exists.');
      return;
    }
    const defaultConfig = {
      targetBaseUrl: 'https://api.example.com',
      port: 3000,
      allowedUsers: [{ apiKey: 'change-me-before-deploying' }],
    };
    fs.mkdirSync(path.join(process.cwd(), 'server'), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('Created server/config.json — update targetBaseUrl and apiKey before starting.');
  },

  start() {
    const entry = path.join(__dirname, '..', 'server', 'index.js');
    execSync(`node ${entry}`, { stdio: 'inherit' });
  },
};

if (!command || !commands[command]) {
  console.log('Usage: vercel-ip-bridge <command>');
  console.log('Commands:');
  console.log('  init   Create default config.json');
  console.log('  start  Start the proxy server');
  process.exit(1);
}

commands[command]();
