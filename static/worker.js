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


const sendMessage = (message)=>{
    console.log(message);
    postMessage({type: "MessageHistory", messages: [message]})
    // Actually send to server
}

// Receive via Websocket instead of bounceBack

onmessage = ({data})=>{
    if(data && data.type){
        switch(data.type){
            case "Message":
                sendMessage(data.message);
                break;
        }
    }
}