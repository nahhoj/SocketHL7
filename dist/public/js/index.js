'use strict';

var socket = io();
socket.on('connect', function(){
    console.log('connected');
});
socket.on('disconnect', function(){
    console.log('disconnected');
});

socket.on('sendMessageClient',(msg)=>{
    talog.value+=`${formatDate(new Date(),'yyyy-MM-dd hh:mm:ss')} - ${msg}\r`;
});

socket.on('sendMessageServer',(msg)=>{
    tssalog.value+=`${formatDate(new Date(),'yyyy-MM-dd hh:mm:ss')} - ${msg}\r`;
});

bsend.onclick=function(){
    if (tamessage.value==='' || iserver.value==='' || iport.value===''){
        alert('message, server and port cannot be empty');
        return;
    }
    const hl7=(tamessage.value.match(/MSH\|\^\~/g) || []).length >0?true:false;
    if (!hl7)
        alert('there is not hl7 message');
    socket.emit('sendMessage',{
        server:iserver.value,
        port:iport.value,
        message:tamessage.value,
        async:sasync.value==='true'?true:false,
        multimessage:smultimessage.value==='true'?true:false,
        start:istartmessage.value.toUpperCase(),
        end:iendmessage.value.toUpperCase(),
        encoding:sencoding.value,
        hl7:Boolean(hl7)
    },function(response){
        talog.value+=`${formatDate(new Date(),'yyyy-MM-dd hh:mm:ss')} - ${response}\r`;
    })
}

bsopen.onclick=function(){
    if(tassmessage.value==='' || issport.value===''){
        alert('message and port cannot be empty');
        return;
    }
    const hl7=(tassmessage.value.match(/MSH\|\^\~/g) || []).length >0?true:false;
    if (!hl7)
        alert('there is not hl7 message');
    socket.emit('openServer',{
        port:issport.value,
        message:tassmessage.value,
        async:ssasync.value==='true'?true:false,
        multimessage:ssmultimessage.value==='true'?true:false,
        start:isstartmessage.value.toUpperCase(),
        end:issendmessage.value.toUpperCase(),
        encoding:ssencoding.value,
        hl7:Boolean(hl7)
    },function(response){
        tssalog.value+=`${formatDate(new Date(),'yyyy-MM-dd hh:mm:ss')} - ${response}\r`;
    });
}

bsclose.onclick=function(){
    socket.emit('closeServer',(response)=>{
        tssalog.value+=`${response}\r`;
    });
}

iclear.onclick=function(){
    talog.value='';
}

isclear.onclick=function(){
    tssalog.value='';
}

function formatDate(x, y) {
    var z = {
        M: x.getMonth() + 1,
        d: x.getDate(),
        h: x.getHours(),
        m: x.getMinutes(),
        s: x.getSeconds()
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });

    return y.replace(/(y+)/g, function(v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}