require('dotenv').config();
const net = require('net');
const tls = require('tls');

const MONGODB_TARGET = process.env.MONGODB_TARGET;
const LISTEN_PORT = parseInt(process.env.PORT || '27017');

if (!MONGODB_TARGET) {
  console.error('Error: MONGODB_TARGET is not set in .env (e.g. cluster.mongodb.net:27017)');
  process.exit(1);
}

const [targetHost, targetPort] = MONGODB_TARGET.split(':');

if (!targetHost || !targetPort) {
  console.error('Error: MONGODB_TARGET must be in format host:port (e.g. cluster.mongodb.net:27017)');
  process.exit(1);
}

const server = net.createServer((clientSocket) => {
  const targetSocket = tls.connect({
    host: targetHost,
    port: parseInt(targetPort),
    servername: targetHost,
  });

  clientSocket.pipe(targetSocket);
  targetSocket.pipe(clientSocket);

  targetSocket.on('error', () => clientSocket.destroy());
  clientSocket.on('error', () => targetSocket.destroy());
});

server.listen(LISTEN_PORT, () => {
  console.log(`ip-bridge TCP proxy running on port ${LISTEN_PORT}`);
  console.log(`Forwarding → ${targetHost}:${targetPort}`);
});
