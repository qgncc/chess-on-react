import { ShortMove } from "chess.js";
import { useReducer, useRef, useState } from "react";
import { Color } from "../types";
import { useChessBoardCallbacks } from "./useChessBoardCallbacks";
import { useChessLogic } from "./useChessLogic";
import { useWebSocket } from "./useWebSocket";

type IncomingMessage = {type: "move", move: string} 
                        |{type: "game_joined", roomID: string, side: Color} 
                        |{type: "game_created", roomID: string} 
                        |{type: "game_started"} 
                        |{type: "game_ended", reason: string}
type OutgoingMessage = {type: "move", move: string}
                        |{type: "create_room", roomID:string}
                        |{type: "join_room", roomID:string}
                        |{type: "game_ended", reason: string}

export type UpdateBoardFunc = (move: ShortMove)=>boolean

export function useChessGameManager(url: string, roomID: string, color?: Color| undefined){
    
    const {position, checkIfPromotion,  updatePositon:updateBoard} = useChessLogic();
    const {onDrop, onPromotion} = useChessBoardCallbacks(updateBoard, checkIfPromotion)
    const [side, setSide] = useState<Color|any>(color? color:"any")
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
            case "game_created":
                setGameStatus("created")
                joinRoom()
                break;
            case "game_joined":
                setGameStatus("joined")
                setSide(message.side)
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
    function sendMove(move: ShortMove) {
        ws.sendMessageJSON(move);
    }
    const ws = useWebSocket<IncomingMessage, OutgoingMessage>(url, onMessage, {onClose, onOpen})
    

    function joinRoom() {
        ws.sendMessageJSON({type:"join_room", roomID, side: side.current})
    }
    function createRoom() {
        ws.sendMessageJSON({type:"create_room", roomID});
        joinRoom();
    }


    return{
        position,
        gameStatus,
        isConnected,
        joinRoom,
        createRoom,
        sendMove,
        onDrop,
        onPromotion,
    }
}