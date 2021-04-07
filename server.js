let WebSocket = require('ws');

// redis 客户端
let redis = require('redis');
let client = redis.createClient(); // key value

let wss = new WebSocket.Server({ port: 6379 });
let clientArr = [];
// 原生的websocket 只有两个常用的方法 on('message') send()
wss.on('connection', function(ws) {
    clientArr.push(ws);
    client.lrange('barrages', 0, -1, function(err, applies) { // 取全部
        applies = applies.map(item => JSON.parse(item));
        ws.send(JSON.stringify({
            type: 'INIT',
            data: applies
        }));
    });
    ws.on('message', function(data) {
        // data 的格式 "{value. time, color, speed}"
        client.rpush('barrages', data, redis.print);
        clientArr.forEach(w => {
            w.send(JSON.stringify({ type: 'ADD', data: JSON.parse(data) }));
        });
    });
    ws.on('close', function() {
        clientArr = clientArr.filter(client => client != ws);
    });
});