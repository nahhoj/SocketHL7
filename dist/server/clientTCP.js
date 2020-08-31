"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSocket = void 0;
const net_1 = __importDefault(require("net"));
const utils_1 = require("./utils");
let countHl7Message = 0;
let hl7Message = [];
let request;
let count = 0;
let errorFlag = false;
const clientTCP = new net_1.default.Socket();
const sendMessageSocket = (req) => {
    countHl7Message = 0;
    let start = utils_1.convertHexString2ascii(req.start);
    let end = utils_1.convertHexString2ascii(req.end);
    hl7Message = [];
    count = 0;
    request = req;
    if (req.hl7) {
        let c = 0;
        let l = [];
        for (let x = 0; x < req.message.length; x++) {
            c = req.message.substring(x, req.message.length).search(/MSH\|\^\~/g);
            if (c >= 0) {
                x += c;
                l.push(x);
            }
        }
        l.push(req.message.length);
        for (let x = 0; x < l.length - 1; x++) {
            hl7Message[x] = start + req.message.substring(l[x], l[x + 1]) + end;
        }
        countHl7Message = l.length;
        connectServer();
    }
};
exports.sendMessageSocket = sendMessageSocket;
const connectServer = () => {
    try {
        if (request.server) {
            clientTCP.connect(request.port, request.server, () => __awaiter(void 0, void 0, void 0, function* () {
                clientTCP.setEncoding(request.encoding);
                utils_1.addlog('sendMessageClient', `Connected to ${request.server}:${request.port}`);
                if (request.async === false) {
                    clientTCP.write(hl7Message[count]);
                    utils_1.addlog('sendMessageClient', 'Sent');
                    utils_1.addlog('sendMessageClient', hl7Message[count]);
                    count++;
                }
                else {
                    if (request.multimessage === true) {
                        for (let x = 0; x < hl7Message.length; x++) {
                            clientTCP.write(hl7Message[count]);
                            utils_1.addlog('sendMessageClient', 'Sent');
                            utils_1.addlog('sendMessageClient', hl7Message[count]);
                            yield utils_1.delay(100);
                        }
                        clientTCP.destroy();
                    }
                    else {
                        clientTCP.write(hl7Message[count]);
                        utils_1.addlog('sendMessageClient', 'Sent');
                        utils_1.addlog('sendMessageClient', hl7Message[count]);
                        count++;
                        clientTCP.destroy();
                    }
                }
            }));
        }
    }
    catch (error) {
        utils_1.addlog('sendMessageClient', error);
    }
};
clientTCP.on('data', (data) => {
    if (request.async === true) {
        return;
    }
    utils_1.addlog('sendMessageClient', 'Received');
    utils_1.addlog('sendMessageClient', data.toString());
    if (request.multimessage === true) {
        if (count >= countHl7Message - 1) {
            clientTCP.destroy();
            return;
        }
        clientTCP.write(hl7Message[count]);
        utils_1.addlog('sendMessageClient', 'Sent');
        utils_1.addlog('sendMessageClient', hl7Message[count]);
        count++;
    }
    else {
        clientTCP.destroy();
    }
});
clientTCP.on('close', function () {
    if (errorFlag === true) {
        errorFlag = false;
        return;
    }
    utils_1.addlog('sendMessageClient', 'Connection closed');
    if (request.async === false) {
        if (request.multimessage === false) {
            if (count >= countHl7Message - 1) {
                return;
            }
            connectServer();
        }
    }
    else {
        if (request.multimessage === false) {
            if (count >= countHl7Message - 1)
                return;
            connectServer();
        }
    }
});
clientTCP.on('error', (error) => {
    errorFlag = true;
    utils_1.addlog('sendMessageClient', error.message);
});
