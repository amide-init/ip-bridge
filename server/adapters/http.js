const config = require('../config.json');

async function handle(req, res) {
  const targetPath = req.params[0];
  const { targetBaseUrl } = config.adapters.http;
  const targetUrl = `${targetBaseUrl}/${targetPath}`;

  const queryString = new URLSearchParams(req.query).toString();
  const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  const fetchOptions = {
    method: req.method,
    headers: {
      'Content-Type': req.headers['content-type'] || 'application/json',
    },
  };

  if (!['GET', 'HEAD'].includes(req.method) && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  const { default: fetch } = await import('node-fetch');
  const response = await fetch(fullUrl, fetchOptions);

  const contentType = response.headers.get('content-type') || '';
  res.status(response.status);

  if (contentType.includes('application/json')) {
    return res.json(await response.json());
  }

  res.set('Content-Type', contentType);
  return res.send(await response.text());
}

module.exports = handle;
