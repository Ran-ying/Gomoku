var http = require('http').createServer((req, res)=>{
    if(req.url=="/" || req.url=="/index.html" || req.url == "/jquery.min.js"){
        res.setHeader('content-type','text/html');
        require('fs').readFile(`.${req.url=="/"?"/index.html":req.url }`,(err, data)=>{
            res.end(data);
        })
    }
    else{
        res.end("NOT FOUND!")
    }
}).listen(6500);
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({server: http});
var users = {}
var players = Array()
var log = JSON.stringify(require("./log.json"));
wss.on('connection',(ws,req)=>{
    let url = req.url.split('/')
    let user = url[1];
    users[user] = ws;
    if(players.length <2) players.push(user)
    for(let user in users){
        users[user].send(log);
    }
    ws.on('message',(data)=>{
        if(players.indexOf(user)!=-1){
            log = data;
            require('fs').writeFile('./log.json',data.toString(),()=>{});
            for(let user in users){
                users[user].send(log);
            }
        }
    })
    ws.on('close',()=>{
        delete users[user]
        if(players.indexOf(user)!=-1) delete players[players.indexOf(user)]
    })
})