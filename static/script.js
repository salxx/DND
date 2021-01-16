var worker = new Worker('worker.js');

var nameInput = document.getElementById("nameInput");
var chatInput = document.getElementById("chatInput");
var chatSendButton = document.getElementById("chatSendButton");
var chatDisplay = document.getElementById("chatDisplay");
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var img = new Image();
var img2 = new Image();
const imgs = {};
var mousePos;
var click = false;
var selected = 0;

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
                chatDisplay.innerHTML  = combinedText;
                break;
        }
    }
})

window.onload = function () {
    img.src = "maps/canyon_map.jpg";
    img2.src = "images/LTR.png";
    imgs[0] = {image:img2, posX:(canvas.width / 2), posY:(canvas.height / 2)};
    imgs[1] = {image:img2, posX:(canvas.width / 2), posY:(canvas.height / 2)};
    imgs[2] = {image:img2, posX:(canvas.width / 2), posY:(canvas.height / 2)};
    img.addEventListener("load", function () {
        renderMap();
    });
}

function renderMap() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    Object.entries(imgs).forEach(([key,value]) => {
        ctx.drawImage(value.image, value.posX, value.posY, value.image.width, value.image.height);
    });
}

function updatePosition() {
    imgs[selected].posX = mousePos.x - (imgs[selected].image.width / 2);
    imgs[selected].posY = mousePos.y - (imgs[selected].image.height / 2);
}


function myClick(canvas) {
    if(click)
      click = false;
    else {
        Object.entries(imgs).forEach(([key,value]) => {
            if(mousePos.x > value.posX && mousePos.x < value.posX + value.image.width && mousePos.y > value.posY && mousePos.y < value.posY + value.image.height) {
                click = true;
                selected = key;
            }
        });
      }
}

canvas.addEventListener('mousemove', function(evt) {
   mousePos = getMousePos(canvas, evt);
   if(click)
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