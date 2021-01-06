const express = require('express');
const app = express();
const port = 8080;

const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server })

wss.on('connection', function connection(webSocket) {
    webSocket.on('message', function incoming(data) {
        wss.clients.forEach(function each(player) {
            if (player !== webSocket && player.readyState === WebSocket.OPEN) {
                player.send(data);
            }
        })
    })
    webSocket.send(JSON.stringify({client: "Server", message: "Ahoi!"}));
});

app.use(express.static('static'));

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})