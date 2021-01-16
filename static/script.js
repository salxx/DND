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


function dropHandler(ev) {
    console.log("drop detected");

    //stop browser default reaction when dropping into, so we can run our custom code
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        //use DataTransferItemList interface for the image
        for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            //only images
            if(ev.dataTransfer.items[i].type.match('image.*')){
                alert("trying to draw");
                var file = ev.dataTransfer.items[i].getAsFile();
                console.log('... image[' + i + '].name = ' + file.name);

                var canv = document.getElementById("myCanvas");
                var canvtx = canv.getContext("2d");
                var mouse_x = e.dataTransfer.getData("mouse_position_x");
                var mouse_y = e.dataTransfer.getData("mouse_position_y");
                var image = new Image(0, 0);
                image = ev.dataTransfer.items[i];

            }
        }
}

function dragOverHandler(ev) {
    console.log("image dropped");

    //stop browser default reaction when dropping into, so we can run our custom code
    ev.preventDefault();
}