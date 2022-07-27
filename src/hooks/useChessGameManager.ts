import { useWebSocket } from "./useWebSocket";

type IncomingMessage = {type: "move", move: string} 
                        |{type: "game_started"} 
                        |{type: "game_ended", reason: string}
type OutgoingMessage = {type: "move", move: string}
                        |{type: "game_ended", reason: string}

export function useChessWebSocket(url: string){
    
    
    
    
    function onMessage(message: IncomingMessage) {
        
    }
    const ws = useWebSocket<IncomingMessage, OutgoingMessage>(url, onMessage)





    return{

    }
}