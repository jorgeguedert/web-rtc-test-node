var fs = require('fs');
var app = require('express');
var cors = require('cors')
const { on } = require('process');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sslPort = process.env.PORT || 3000;
var port = 3001;

var https = require('https');
var privateKey  = fs.readFileSync('./sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('./sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

//app.application.options('*', cors());

io.on('connection', socket=>{
    socket.on('room_join_request', payload=>{
        socket.join(payload.roomName, err=>{
            if(!err){
                io.in(payload.roomName).clients((err, clients)=>{
                    if(!err){
                        io.in(payload.roomName).emit('room_users', clients);
                    }
                });
            }
        });
    });

    socket.on('offer_signal', payload=>{
        io.to(payload.calleeId).emit('offer', {signalData: payload.signalData, callerId: payload.callerId});
    });

    socket.on('answer_signal', payload=>{
        io.to(payload.callerId).emit('offer', {signalData:payload.signalData, callerId: payload.callerId});
    })

    socket.on('disconnect', payload=>{
        io.emit('room_left', {type:'disconnected', socketId:socket.id});
    })


});


var httpsServer = https.createServer(credentials, app);
http.listen( port,'0.0.0.0', ()=> console.log('listening on *: '+port));

httpsServer.listen(sslPort,'0.0.0.0', ()=> console.log('listening on *: '+sslPort));

//var httpsServer = https.createServer(credentials, app);

