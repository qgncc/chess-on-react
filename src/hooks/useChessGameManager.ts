import { useReducer } from "react";
import { useWebSocket } from "./useWebSocket";

type IncomingMessage = {type: "move", move: string} 
                        |{type: "game_joined", roomID: string} 
                        |{type: "game_started"} 
                        |{type: "game_ended", reason: string}
type OutgoingMessage = {type: "move", move: string}
                        |{type: "game_ended", reason: string}

export function useChessGameManager(url: string){
    
    
    
    function onMessage(message: IncomingMessage) {
        switch (message.type) {
            case "game_joined":
                
                break;
            case "game_started":
                
                break;
            case "game_ended":
                
                break;
            case "move":
                
                break;
        
            default:
                break;
        }
    }
    const ws = useWebSocket<IncomingMessage, OutgoingMessage>(url, onMessage)


    function joinRoom(roomID: string) {
        console.log("Joining room", roomID)
    }


    return{
        joinRoom,
        get isGameStarted(){
            return true
        }
    }
}