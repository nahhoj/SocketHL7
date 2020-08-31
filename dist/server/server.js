"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = __importDefault(require("socket.io"));
const clientTCP_1 = require("./clientTCP");
const serverTCP_1 = require("./serverTCP");
const app = express_1.default();
app.use(express_1.default.static(path_1.default.resolve(__dirname, '../public')));
const option = {
    key: fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'certs/private.key')),
    cert: fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'certs/certificate.crt'))
};
const serverhttps = https_1.default.createServer(option, app)
    .listen(443, () => { console.log('Server is running on port 443'); });
const io = socket_io_1.default(serverhttps, {
    pingTimeout: 60000 //avoid disconnects from frontEnd
});
exports.io = io;
io.on('connection', (client) => {
    console.log(`connected: ${client.id}`);
    client.on('disconnect', () => {
        console.log(`disconnected: ${client.id}`);
    });
    client.on('sendMessage', (req, callback) => {
        clientTCP_1.sendMessageSocket(req);
        callback('Message sent to backEnd');
    });
    client.on('openServer', (req, callback) => {
        serverTCP_1.openServer(req);
        callback('port opended');
    });
    client.on('closeServer', (callback) => {
        serverTCP_1.closeServer();
        callback('Port closed');
    });
});
