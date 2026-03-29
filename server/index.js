const express = require('express');
const config = require('./config.json');
const authenticate = require('./auth');

const app = express();
const PORT = process.env.PORT || config.port || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB adapter
if (config.adapters?.mongodb?.uri) {
  const mongoHandler = require('./adapters/mongodb');
  app.post('/bridge/mongo/query', authenticate, async (req, res) => {
    try {
      await mongoHandler(req, res);
    } catch (err) {
      console.error('[mongo]', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  console.log('Adapter enabled: mongodb → POST /bridge/mongo/query');
}

// HTTP adapter
if (config.adapters?.http?.targetBaseUrl) {
  const httpHandler = require('./adapters/http');
  app.all('/bridge/http/*', authenticate, async (req, res) => {
    try {
      await httpHandler(req, res);
    } catch (err) {
      console.error('[http]', err.message);
      res.status(502).json({ error: 'Bad gateway' });
    }
  });
  console.log('Adapter enabled: http → ALL /bridge/http/*');
}

app.listen(PORT, () => {
  console.log(`vercel-ip-bridge running on http://localhost:${PORT}`);
});
