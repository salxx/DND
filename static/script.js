var worker = new Worker('worker.js');

var chatInput = document.getElementById("chatInput");
var chatSendButton = document.getElementById("chatSendButton");
var chatDisplay = document.getElementById("chatDisplay")

chatSendButton.addEventListener("click", ()=>{
    if(chatInput.value.trim()){
        var text = chatInput.value.trim();
        chatInput.value = "";
        worker.postMessage({type: "Message", message: {dateTime: new Date().toISOString(), author: "Fel the Elf", message: text}});
    }
});

worker.onmessage = (({data})=>{
    if(data && data.type){
        switch(data.type){
            case "MessageHistory":
                chatDisplay.innerHTML = JSON.stringify(data.messages);
                // Formatting messages goes HERE
                break;
        }
    }
})