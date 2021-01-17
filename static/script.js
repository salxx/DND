var worker = new Worker('worker.js');

var nameInput = document.getElementById("nameInput");
var chatInput = document.getElementById("chatInput");
var chatSendButton = document.getElementById("chatSendButton");
var rollDiceButton = document.getElementById("rollButton");
var chatDisplay = document.getElementById("chatDisplay");
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var img = new Image();
var img2 = new Image();
const imgs = {};
var mousePos;
var click = false;
var selected = 0;

rollDiceButton.addEventListener("click", () => {
    worker.postMessage({ type: "Message", message: { client: nameInput.value.trim(), dateTime: new Date().toISOString(), message: "1d20" } });
});

chatSendButton.addEventListener("click", () => {
    if (chatInput.value.trim()) {
        var text = chatInput.value.trim();
        chatInput.value = "";
        worker.postMessage({ type: "Message", message: { client: nameInput.value.trim(), dateTime: new Date().toISOString(), message: text } });
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
                chatDisplay.innerHTML = combinedText;
                break;
            case "ImageReceived":
                imageType = data.image;
                var receivedImage = new Image();
                receivedImage.src = imageType.image;
                imgs[Object.entries(imgs).length] = { image: receivedImage, posX: imageType.posX, posY: imageType.posY };
                renderMap();
                break;
            case "ImageReplaced":
                const receivedMap = JSON.parse(data.imageMap);
                for (i = 0; i < Object.entries(receivedMap).length; i++) {
                    imgs[i].posX = receivedMap[i].posX;
                    imgs[i].posY = receivedMap[i].posY;
                }
                renderMap();
                break;
            case "ImageDeleted":
                console.log("delete: " + data.message);
                delete imgs[data.message];
                renderMap();
                break;
        }
    }
})

window.onload = function () {
    img.src = "maps/canyon_map.jpg";
    img2.src = "images/LTR.png";
    img.addEventListener("load", function () {
        renderMap();
    });
}

function renderMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    Object.entries(imgs).forEach(([key, value]) => {
        ctx.drawImage(value.image, value.posX, value.posY, value.image.width, value.image.height);
    });
}

function updatePosition() {
    imgs[selected].posX = mousePos.x - (imgs[selected].image.width / 2);
    imgs[selected].posY = mousePos.y - (imgs[selected].image.height / 2);
}


function myClick(canvas) {
    if (click) {
        click = false;
        //TODO: send to other clients
        worker.postMessage({ type: "ImagePositionChanged", message: JSON.stringify(imgs) });
    }
    else {
        Object.entries(imgs).forEach(([key, value]) => {
            if (mousePos.x > value.posX && mousePos.x < value.posX + value.image.width && mousePos.y > value.posY && mousePos.y < value.posY + value.image.height) {
                if(ctrlPressed) {
                    delete imgs[key];
                    worker.postMessage({ type: "ImageDeleted", message: key });
                    renderMap();
                } else {
                    click = true;
                    selected = key;
                }
            }
        });
    }
}

var ctrlPressed = false;

window.addEventListener("keydown", function (event) {
    if (event.ctrlKey) {
        ctrlPressed = true;
    }
});

window.addEventListener("keyup", function (event) {
    if (!event.ctrlKey) {
        ctrlPressed = false;
    }
});

canvas.addEventListener('mousemove', function (evt) {
    mousePos = getMousePos(canvas, evt);
    if (click)
        updatePosition();
    renderMap();
}, false)

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

/*---------- pushing enter from text input box calls submit button ----------*/

var chat_text_input = document.getElementById("chatInput");
chat_text_input.addEventListener("keyup", function(event){
   //enter key pressed
   if(event.keyCode === 13){
     event.preventDefault();
     document.getElementById("chatSendButton").click();
   }
});

/*---------- adding image to canvas logic --------------*/

function dropHandler(evt) {
    console.log("drop detected");

    //stop browser default reaction when dropping into, so we can run our custom code
    evt.preventDefault();

    if (evt.dataTransfer.items) {
        //use DataTransferItemList interface for the image
        for (var i = 0; i < evt.dataTransfer.items.length; i++) {
            //only images
            if (evt.dataTransfer.items[i].type.match('image.*')) {
                var file = evt.dataTransfer.items[i].getAsFile();
                drawImageOnCanvas(file);
            }
        }
    }
}

function dragOverHandler(ev) {
    console.log("image dropped");

    //stop browser default reaction when dropping into, so we can run our custom code
    ev.preventDefault();
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
function handleFileSelect(evt){
    var files = evt.target.files; //FileList of File objects
    for(var i = 0, file; file = files[i]; i++){
        drawImageOnCanvas(file);
    }
}

function drawImageOnCanvas(file){

    var img_in = new Image();
    var fileReader = new FileReader();
    fileReader.addEventListener("load", e => {
        var img_in = new Image();
        img_in.src = fileReader.result;
        imgs[Object.entries(imgs).length] = { image: img_in, posX: (canvas.width / 2), posY: (canvas.height / 2) };
        //TODO FIXME FL
        worker.postMessage({ type: "ImageAdded", message: { image: fileReader.result, posX: (canvas.width / 2), posY: (canvas.height / 2) } });
    });
    fileReader.readAsDataURL(file);
}