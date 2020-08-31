"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeServer = exports.openServer = void 0;
const net_1 = __importDefault(require("net"));
const utils_1 = require("./utils");
let serverTCP = new net_1.default.Server();
const openServer = (req) => {
    console.log(req.message);
    serverTCP = net_1.default.createServer((socket) => {
        utils_1.addlog('sendMessageServer', `client connected ${socket.localAddress}`);
        socket.setEncoding(req.encoding);
        socket.on('data', (data) => {
            utils_1.addlog('sendMessageServer', data.toString());
            let valhl7 = utils_1.validateHl7(data.toString(req.encoding), req.start, req.end);
            if (valhl7.length <= 10) {
                if (req.async === false) {
                    socket.write(`${valhl7.split(',')[0]}${req.message}${valhl7.split(',')[1]}`);
                    utils_1.addlog('sendMessageServer', `${valhl7.split(',')[0]}${req.message}${valhl7.split(',')[1]}`);
                }
                utils_1.delay(100);
            }
            else
                utils_1.addlog('sendMessageServer', valhl7);
            if (req.multimessage === false)
                socket.destroy();
        });
        socket.on('close', () => {
            utils_1.addlog('sendMessageServer', 'Client has closed the connection');
        });
        socket.on('error', (error) => {
            utils_1.addlog('sendMessageServer', error.message);
        });
    }).listen(req.port, () => {
        utils_1.addlog('sendMessageServer', `Server is running on port ${req.port}`);
    });
    serverTCP.on('error', (error) => {
        utils_1.addlog('sendMessageServer', error.message);
    });
    serverTCP.on('close', () => {
        utils_1.addlog('sendMessageServer', 'It has been closed the port');
    });
};
exports.openServer = openServer;
const closeServer = () => {
    serverTCP.close();
};
exports.closeServer = closeServer;
