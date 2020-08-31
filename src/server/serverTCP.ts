import net from 'net';
import {validateHl7,addlog,IreqFront, delay} from './utils';

let serverTCP:net.Server=new net.Server();

const openServer:Function=(req:IreqFront)=>{
    console.log(req.message);
    serverTCP=net.createServer((socket)=>{
        addlog('sendMessageServer',`client connected ${socket.localAddress}`);
        socket.setEncoding(req.encoding);
        socket.on('data',(data)=>{
            addlog('sendMessageServer',data.toString());
            let valhl7=validateHl7(data.toString(req.encoding),req.start,req.end);
            if (valhl7.length<=10){
                if (req.async===false){
                    socket.write(`${valhl7.split(',')[0]}${req.message}${valhl7.split(',')[1]}`);
                    addlog('sendMessageServer',`${valhl7.split(',')[0]}${req.message}${valhl7.split(',')[1]}`);
                }
                    delay(100);
            }
            else
                addlog('sendMessageServer',valhl7);
            if (req.multimessage===false)
                socket.destroy();
        });

        socket.on('close',()=>{
            addlog('sendMessageServer','Client has closed the connection');
        });

        socket.on('error',(error:Error)=>{
            addlog('sendMessageServer',error.message);
        });
    }).listen(req.port,()=>{
        addlog('sendMessageServer',`Server is running on port ${req.port}`);
    });

    serverTCP.on('error',(error:Error)=>{
        addlog('sendMessageServer',error.message);
    });
    
    serverTCP.on('close',()=>{
        addlog('sendMessageServer','It has been closed the port');
    });
}

const closeServer=()=>{
    serverTCP.close();
}

export{openServer,closeServer};