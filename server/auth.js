const config = require('./config.json');

function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Missing x-api-key header' });
  }

  const isValid = config.allowedUsers.some((user) => user.apiKey === apiKey);

  if (!isValid) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}

module.exports = authenticate;
