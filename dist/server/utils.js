"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addlog = exports.delay = exports.validateHl7 = exports.convertHexString2ascii = void 0;
const timers_1 = require("timers");
const server_1 = require("./server");
const conver = (val) => {
    let zero = val.charCodeAt(0);
    let one = val.charCodeAt(1);
    if (zero >= 48 && zero <= 57)
        zero -= 48;
    else
        zero -= 65;
    if (one >= 48 && one <= 57)
        one -= 48;
    else
        one -= 55;
    return (zero * 16) + one;
};
const convertHexString2ascii = (srt) => {
    let rsrt = '';
    for (let x = 0, y = 0; x < srt.length; x += 2, y++) {
        rsrt += String.fromCharCode(conver(srt.substring(x, x + 2)));
    }
    return rsrt;
};
exports.convertHexString2ascii = convertHexString2ascii;
const validateHl7 = (hl7, start, end) => {
    start = convertHexString2ascii(start);
    end = convertHexString2ascii(end);
    if (hl7.search(/MSH\|\^\~/g) <= 0) {
        return 'The message is not HL7';
    }
    if (!(start === hl7.substring(0, start.length)) && !(end === hl7.substring(0, end.length))) {
        return 'The start and end charecters are not equal to the configuration';
    }
    return `${start},${end}`;
};
exports.validateHl7 = validateHl7;
const delay = (time) => {
    return new Promise((resolve, reject) => {
        let id = timers_1.setInterval(() => {
            clearInterval(id);
            resolve();
        }, time);
    });
};
exports.delay = delay;
const addlog = (event, msg) => {
    console.log(msg);
    server_1.io.emit(event, msg);
};
exports.addlog = addlog;
