import net from 'net';
import {convertHexString2ascii,delay,addlog,IreqFront} from './utils';

let countHl7Message:number=0;
let hl7Message:string[]=[];
let request:IreqFront;
let count:number=0;

let errorFlag:boolean=false;

const clientTCP:net.Socket=new net.Socket();

const sendMessageSocket=(req:IreqFront)=>{
    countHl7Message=0;
    let start=convertHexString2ascii(req.start);
    let end=convertHexString2ascii(req.end);
    hl7Message=[];
    count=0;
    request=req;
    if (req.hl7){
        let c=0;
        let l:Array<number>=[];
        for(let x=0;x<req.message.length;x++){
            c=req.message.substring(x,req.message.length).search(/MSH\|\^\~/g);
            if (c>=0){
                x+=c;
                l.push(x);
            }
        }
        l.push(req.message.length);
        for(let x=0;x<l.length-1;x++){
            hl7Message[x]=start + req.message.substring(l[x],l[x+1]) + end;
        }
        countHl7Message=l.length;
        connectServer();
    }
}

const connectServer=()=>{
    try {
        if (request.server){
            clientTCP.connect(request.port,request.server,async ()=>{
                clientTCP.setEncoding(request.encoding);
                addlog('sendMessageClient',`Connected to ${request.server}:${request.port}`);
                if (request.async===false){
                    clientTCP.write(hl7Message[count]);
                    addlog('sendMessageClient','Sent');
                    addlog('sendMessageClient',hl7Message[count]);
                    count++;
                }
                else{
                    if (request.multimessage===true){
                        for(let x=0;x<hl7Message.length;x++){
                            clientTCP.write(hl7Message[count]);
                            addlog('sendMessageClient','Sent');
                            addlog('sendMessageClient',hl7Message[count]);
                            await delay(100);
                        }
                        clientTCP.destroy();
                    }
                    else{
                        clientTCP.write(hl7Message[count]);
                        addlog('sendMessageClient','Sent');
                        addlog('sendMessageClient',hl7Message[count]);
                        count++;
                        clientTCP.destroy();
                    }
                }
            });
        }
    } catch (error) {
        addlog('sendMessageClient',error);
    }
}

clientTCP.on('data',(data)=>{
    if (request.async===true){
        return
    }
    addlog('sendMessageClient','Received');
    addlog('sendMessageClient',data.toString());
    if (request.multimessage===true){
        if (count>=countHl7Message-1){
            clientTCP.destroy();
            return;
        }
        clientTCP.write(hl7Message[count]);
        addlog('sendMessageClient','Sent')
        addlog('sendMessageClient',hl7Message[count])
        count++
    }
    else{
        clientTCP.destroy();
    }
});

clientTCP.on('close', function(){
    if (errorFlag===true){
        errorFlag=false;
        return;
    }
    addlog('sendMessageClient','Connection closed');
    if (request.async===false){
       if (request.multimessage===false){
            if (count>=countHl7Message-1){
                return;
            }
            connectServer();
        }
    }
    else{
        if (request.multimessage===false){
            if (count>=countHl7Message-1)
                return;
            connectServer();
        }
    }
});

clientTCP.on('error',(error:Error)=>{
    errorFlag=true;
    addlog('sendMessageClient',error.message);
});

export{sendMessageSocket}