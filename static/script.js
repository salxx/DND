var worker = new Worker('worker.js');

var nameInput = document.getElementById("nameInput");
var chatInput = document.getElementById("chatInput");
var chatSendButton = document.getElementById("chatSendButton");
var dummySendImageButton = document.getElementById("dummyImageButton");
var chatDisplay = document.getElementById("chatDisplay");

chatSendButton.addEventListener("click", () => {
    if (chatInput.value.trim()) {
        var text = chatInput.value.trim();
        chatInput.value = "";
        worker.postMessage({ type: "Message", message: { client: nameInput.value.trim(), dateTime: new Date().toISOString(), message: text } });
    }
});

dummyImageButton.addEventListener("click", () => {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvasID");
    const ctx = canvas.getContext('2d');
    var img = new Image(100, 200);
    canvas.width = img.width;
    canvas.height = img.height;
    // Draw the image
    ctx.drawImage(img, 0, 0);
    worker.postMessage({ type: "Image", message: { message: canvas.toDataURL('image/jpeg') } });

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
                chatDisplay.innerHTML = combinedText;
                break;
        }
    }
})