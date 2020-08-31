import https from 'https';
import express from 'express';
import fs, { write } from 'fs';
import path, { format } from 'path'
import socket from 'socket.io';
import {IreqFront} from './utils';
import {sendMessageSocket} from './clientTCP';
import {openServer,closeServer} from './serverTCP';

const app:express.Application=express();

app.use(express.static(path.resolve(__dirname,'../public')));

const option={
    key:fs.readFileSync(path.resolve(__dirname,'certs/private.key')),
    cert:fs.readFileSync(path.resolve(__dirname,'certs/certificate.crt'))
}

const serverhttps:https.Server=https.createServer(option,app)
                               .listen(443,()=>{console.log('Server is running on port 443')});

const io:socket.Server=socket(serverhttps,
    {
        pingTimeout:60000//avoid disconnects from frontEnd
    });

io.on('connection',(client)=>{
    console.log(`connected: ${client.id}`);
    client.on('disconnect',()=>{
        console.log(`disconnected: ${client.id}`);
    });

    client.on('sendMessage',(req:IreqFront,callback:Function)=>{
        sendMessageSocket(req);
        callback('Message sent to backEnd');
    });

    client.on('openServer',(req:IreqFront,callback:Function)=>{
        openServer(req);
        callback('port opended');
    });
    client.on('closeServer',(callback:Function)=>{
        closeServer();
        callback('Port closed');
    });
});

export{io}