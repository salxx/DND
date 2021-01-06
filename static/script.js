var worker = new Worker('worker.js');

var chatInput = document.getElementById("chatInput");
var chatSendButton = document.getElementById("chatSendButton");
var chatDisplay = document.getElementById("chatDisplay");

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
    worker.postMessage({ type: "Message", message: { client: data.client, dateTime: new Date().toISOString(), message: data.message } });
}
ws.onclose = function () {
    ws = null;
}

chatSendButton.addEventListener("click", () => {
    if (chatInput.value.trim()) {
        var text = chatInput.value.trim();
        chatInput.value = "";
        if (!ws) {
            showMessage("No websocket connection available!");
            return;
        }
        ws.send(JSON.stringify({client: "myID", message: text}));
        worker.postMessage({ type: "Message", message: { client: "Me", dateTime: new Date().toISOString(), message: text } });
    }
});

formatTime = (time) => {
    return time.match(/T(..:..:..)/)[1];
}

worker.onmessage = (({ data }) => {
    if (data && data.type) {
        switch (data.type) {
            case "MessageHistory":
                var combinedText = "";
                data.messages.forEach(element => {
                    combinedText += "[" + formatTime(element.dateTime) + "] " + element.client + ": " + element.message + "\n";
                });
                chatDisplay.innerHTML  = combinedText;
                break;
        }
    }
})