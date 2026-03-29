const { MongoClient } = require('mongodb');
const config = require('../config.json');

const ALLOWED_OPERATIONS = [
  'find', 'findOne',
  'insertOne', 'insertMany',
  'updateOne', 'updateMany',
  'deleteOne', 'deleteMany',
  'aggregate', 'countDocuments',
];

let client;

async function getDb() {
  if (!client) {
    client = new MongoClient(config.adapters.mongodb.uri);
    await client.connect();
  }
  return client.db();
}

async function handle(req, res) {
  const { collection, operation, filter = {}, update, document, documents, pipeline, options = {} } = req.body;

  if (!collection || !operation) {
    return res.status(400).json({ error: 'collection and operation are required' });
  }

  if (!ALLOWED_OPERATIONS.includes(operation)) {
    return res.status(400).json({ error: `operation must be one of: ${ALLOWED_OPERATIONS.join(', ')}` });
  }

  const db = await getDb();
  const col = db.collection(collection);
  let result;

  switch (operation) {
    case 'find':
      result = await col.find(filter, options).toArray();
      break;
    case 'findOne':
      result = await col.findOne(filter, options);
      break;
    case 'insertOne':
      result = await col.insertOne(document);
      break;
    case 'insertMany':
      result = await col.insertMany(documents);
      break;
    case 'updateOne':
      result = await col.updateOne(filter, update, options);
      break;
    case 'updateMany':
      result = await col.updateMany(filter, update, options);
      break;
    case 'deleteOne':
      result = await col.deleteOne(filter);
      break;
    case 'deleteMany':
      result = await col.deleteMany(filter);
      break;
    case 'aggregate':
      result = await col.aggregate(pipeline, options).toArray();
      break;
    case 'countDocuments':
      result = await col.countDocuments(filter, options);
      break;
  }

  res.json({ result });
}

module.exports = handle;
