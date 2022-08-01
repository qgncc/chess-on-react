<<<<<<< HEAD
import { useWebSocket } from "./useWebSocket";

type IncomingMessage = {type: "move", move: string} 
                        |{type: "game_started"} 
=======
import { ShortMove } from "chess.js";
import { useReducer, useRef, useState } from "react";
import { Color } from "../types";
import { useWebSocket } from "./useWebSocket";

type IncomingMessage = {type: "move", move: string} 
                        |{type: "game_joined", roomID: string} 
                        |{type: "game_started", side: Color} 
>>>>>>> ChessBoardRefactor
                        |{type: "game_ended", reason: string}
type OutgoingMessage = {type: "move", move: string}
                        |{type: "game_ended", reason: string}

<<<<<<< HEAD
export function useChessWebSocket(url: string){
    
    
    
    
    function onMessage(message: IncomingMessage) {
        
    }
    const ws = useWebSocket<IncomingMessage, OutgoingMessage>(url, onMessage)





    return{

=======
type UpdateBoardFunc = (move: ShortMove)=>boolean

export function useChessGameManager(url: string, updateBoard: UpdateBoardFunc){
    
    function stringMoveToObject(move: string) {
        return{
            from: move[0]+move[1],
            to: move[2]+move[3],
            promotion: move[4] || undefined,
        } as ShortMove
    }
    let [gameStatus, setGameStatus] = useState<"joined"|"started"|"ended"|"created">("created")
    let [isConnected, setIsConnected] = useState<boolean>(false)

    function onMessage(message: IncomingMessage) {
        switch (message.type) {
            case "game_joined":
                setGameStatus("joined")
                break;
            case "game_started":
                setGameStatus("started")
                break;
            case "game_ended":
                setGameStatus("ended")
                break;
            case "move":
                const move = stringMoveToObject(message.move)
                updateBoard(move)
                break;
        
            default:
                break;
        }
    }
    function onClose(event: CloseEvent) {
        setIsConnected(false)
    }
    function onOpen(event: Event) {
        setIsConnected(true)
    }
    const ws = useWebSocket<IncomingMessage, OutgoingMessage>(url, onMessage, {onClose, onOpen})
    

    function joinRoom(roomID: string) {
        console.log("Joining room", roomID)
    }


    return{
        joinRoom,
        gameStatus,
        isConnected,
>>>>>>> ChessBoardRefactor
    }
}