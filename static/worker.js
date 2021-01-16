/**
 * 
 * Message: {
 *  dateTime: "2011-10-05T14:48:00.000Z", //(ISO 8601)
 *  author: "Dorf the Dwarf"
 *  message: "I roll [1d20]" //[1d20] is replaced by RNG Value by the dungeon master client
 * }
 * 
 * Message Endpoints:
 * -> sendMessage({type: 'Message', message: Message})
 * <- receiveMessage({type: 'MessageHistory', messages: Message[]})
 */

const mHistory = [];

const addMessageToHistory = (message) => {
    console.log(message);
    mHistory.push(message);
    postMessage({ type: "MessageHistory", messages: mHistory })
}

const sendMessageOverWs = (message) => {
    if (!ws) {
        showMessage("No websocket connection available!");
        return;
    }
    ws.send(JSON.stringify({ client: message.client, message: message.message }));
}

onmessage = ({ data }) => {
    if (data && data.type) {
        switch (data.type) {
            case "Message":
                console.log("Message received");
                addMessageToHistory(data.message);
                sendMessageOverWs(data.message);
                break;
            case "Image":
                console.log("Image received");
                console.log(data.message);
                var canvas = document.getElementById('myCanvas'),
                    context = canvas.getContext('2d');
                var image = new Image();
                image.src = data.message;
                context.drawImage(image, 100, 100);
                break;
        }
    }
}

let ws;

if (ws) {
    ws.onerror = ws.onopen = ws.onclose = null;
    ws.close();
}

ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
    console.log('Connection opened!');
}
ws.onmessage = ({ data }) => {
    console.log(data);
    data = JSON.parse(data);
    addMessageToHistory({ client: data.client, dateTime: new Date().toISOString(), message: data.message });
}

ws.onclose = function () {
    ws = null;
}