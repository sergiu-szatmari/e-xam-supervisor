import express, { Request, Response } from 'express';
import http from 'http';
import config from 'config';
import { ExpressPeerServer } from 'peer';
import { v4 as generateClientId } from 'uuid';
import { green, yellow } from 'cli-color';
import { uploadRouter } from './src/routers';
import morgan from 'morgan';
import { headers } from './src/middleware';

const app = express();
const server = http.createServer(app);
const port = config.get('server.port') as string;

const peerServer = ExpressPeerServer(server, {
  path: '/signal',
  generateClientId
});

peerServer.on('connection', (client) => {
  console.log(`New peer: `, client.getId());
});

app.use(peerServer);

app.use(headers);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/upload', uploadRouter);
app.get('/', (req: Request, res: Response) => res.status(200).json({ message: 'E-xam Supervisor API works' }));

server.listen(port, () => {
  console.log(`Server is ${ green('up and running') } on port ${ yellow(port)}`);
});
