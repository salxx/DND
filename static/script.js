var worker = new Worker('worker.js');

var chatInput = document.getElementById("chatInput");
var chatSendButton = document.getElementById("chatSendButton");
var chatDisplay = document.getElementById("chatDisplay");

chatSendButton.addEventListener("click", () => {
    if (chatInput.value.trim()) {
        var text = chatInput.value.trim();
        chatInput.value = "";
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