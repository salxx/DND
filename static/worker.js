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

const addMessageToHistory = (data) => {
    console.log(data.message);
    mHistory.push(data.message);
    postMessage({ type: "MessageHistory", messages: mHistory })
}

const addImage = (message) => {
    postMessage({ type: "ImageReceived", image: message })
}

const updateImagePositions = (message) => {
    postMessage({ type: "ImageReplaced", imageMap: message })
}

const sendDataOverWs = (message) => {
    if (!ws) {
        showMessage("No websocket connection available!");
        return;
    }
    ws.send(JSON.stringify({ client: message.client, message: message }));
}

onmessage = ({ data }) => {
    if (data && data.type) {
        switch (data.type) {
            case "Message":
                console.log("Message received");
                addMessageToHistory(data);
                sendDataOverWs(data);
                break;
            case "ImageAdded":
                console.log("Image received");
                sendDataOverWs(data);
                break;
            case "ImagePositionChanged":
                console.log("Image position changed");
                sendDataOverWs(data);
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
    data = JSON.parse(data);
    message = data.message;
    switch (message.type) {
        case "Message":
            addMessageToHistory({ client: data.client, dateTime: new Date().toISOString(), message: message.message });
            break;
        case "ImageAdded":
            addImage(message.message);
            break;
        case "ImagePositionChanged":
            updateImagePositions(message.message);
            break;
    }
}

ws.onclose = function () {
    ws = null;
}