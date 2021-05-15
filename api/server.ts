import express from 'express';
import http from 'http';
import config from 'config';
import { ExpressPeerServer } from 'peer';
import { v4 as generateClientId } from 'uuid';
import { green, yellow } from 'cli-color';

const app = express();
const server = http.createServer(app);
const port = config.get('server.port') as string;

const peerServer = ExpressPeerServer(server, {
  path: '/signal',
  generateClientId
});

peerServer.on('connection', (client) => {
  console.log(client);
  console.log(client.getId());
});

app.use(peerServer);

server.listen(port, () => {
  console.log(`Server is ${ green('up and running') } on port ${ yellow(port)}`);
});
