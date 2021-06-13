import express, { Request, Response } from 'express';
import http from 'http';
import config from 'config';
import { ExpressPeerServer } from 'peer';
import { v4 as generateClientId } from 'uuid';
import { green, yellow } from 'cli-color';
import morgan from 'morgan';

import error from './src/middleware/error';
import headers from './src/middleware/headers';
import { apiRouter } from './src/routes';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
const port = config.get('server.port') as string;

const peerServer = ExpressPeerServer(server, {
  path: '/signal',
  generateClientId
});

peerServer.on('message', (client, msg) => {
  // console.log({ client, msg });
})

peerServer.on('connection', (client) => {
  console.log(`New peer: `, client.getId());
  console.log('Token: ', client.getToken());
  // client.send('zzz');
});


app.use(headers);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/peer',
  (req: Request, res, next) => { if (!req.headers['custom_field']) console.log('Custom field not found'); return next(); },
  peerServer
);
app.use('/', apiRouter);

app.use(error);

const { dbConnectionUri } = config.get('server')
mongoose
  .connect(dbConnectionUri, {
    useNewUrlParser: true, useUnifiedTopology: true,
    useFindAndModify: false, useCreateIndex: true
  })
  .then(() => {
    console.log(`Connected to ${ green('Mongo DB') }`);
    server.listen(port, () => console.log(`Server is ${ green('up and running') } on port ${ yellow(port)}`));
  })
  .catch(console.error);
