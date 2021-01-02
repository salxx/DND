/**
 * 
 * Message: {
 *  dateTime: "2011-10-05T14:48:00.000Z", //(ISO 8601)
 *  author: "Dorf the Dwarf"
 *  Message: "I roll [1d20]" //[1d20] is replaced by RNG Value by the dungeon master client
 * }
 * 
 * Message Endpoints:
 * -> sendMessage({type: 'Message', message: Message})
 * <- receiveMessage({type: 'MessageHistory', messages: Message[]})
 */

if(window.Worker){

    function sendMessage(message){
        console.log(message);
        postMessage(message)
    }

    onmessage = function(message){
        if(message.type){
            switch(message.type){
                case "Message":
                    sendMessage(message.message);
                    break;
            }
        }
    }
}