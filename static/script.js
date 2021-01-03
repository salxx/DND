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
    worker.postMessage({ type: "Message", message: { dateTime: new Date().toISOString(), message: data } });
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
        ws.send(text);
        worker.postMessage({ type: "Message", message: { dateTime: new Date().toISOString(), message: text } });
    }
});

worker.onmessage = (({ data }) => {
    if (data && data.type) {
        switch (data.type) {
            case "MessageHistory":
                chatDisplay.innerHTML = JSON.stringify(data.messages);
                // Formatting messages goes HERE
                break;
        }
    }
})