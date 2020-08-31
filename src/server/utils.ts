import { setInterval } from 'timers';
import {io} from './server';
import { endianness } from 'os';

const conver=(val:string):number=>{
    let zero:number=val.charCodeAt(0);
    let one:number=val.charCodeAt(1);

    if (zero>=48 && zero<=57)
        zero-=48;
    else
        zero-=65;

    if (one>=48 && one<=57)
        one-=48;
    else
        one-=55;

    return (zero*16) + one;
}

const convertHexString2ascii=(srt:string):string=>{
    let rsrt='';
    for(let x=0,y=0;x<srt.length;x+=2,y++){
        rsrt+=String.fromCharCode(conver(srt.substring(x,x+2)));
    }
    return rsrt;
}

const validateHl7=(hl7:string,start:string,end:string):string=>{
    start=convertHexString2ascii(start);
    end=convertHexString2ascii(end);
    if (hl7.search(/MSH\|\^\~/g)<=0){
        return 'The message is not HL7';
    }
    if (!(start===hl7.substring(0,start.length)) && !(end===hl7.substring(0,end.length))){
        return 'The start and end charecters are not equal to the configuration';
    }
    return `${start},${end}`;
}

const delay=(time:number):Promise<void>=>{
    return new Promise((resolve, reject)=>{
        let id=setInterval(()=>{
            clearInterval(id);
            resolve();
        },time);
    });
}

const addlog=(event:string,msg:string)=>{
    console.log(msg);
    io.emit(event,msg);
}

interface IreqFront{
    server?:string,
    port:number,
    message:string,
    async:boolean,
    multimessage:boolean,
    start:string,
    end: string,
    encoding:"ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined
    hl7: boolean
}

export{convertHexString2ascii,validateHl7,delay,addlog,IreqFront}