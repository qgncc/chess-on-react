import { ShortMove } from "chess.js";
import { useReducer, useRef, useState } from "react";
import { PromotionWindow } from "../PromotionWindow/PromotionWindow";
import { Color } from "../types";
import { useChessBoardCallbacks } from "./useChessBoardCallbacks";
import { useChessLogic } from "./useChessLogic";
import { useWebSocket } from "./useWebSocket";

type IncomingMessage = {type: "move", move: string} 
                        |{type: "game_joined", side: Color, roomID: string} 
                        |{type: "game_created", roomID: string} 
                        |{type: "game_started"} 
                        |{type: "game_ended", reason: string}
                        |{type: "error", errorID: number}
type OutgoingMessage = {type: "move", move: string, side: Color}
                        |{type: "create_room", side?:Color}
                        |{type: "join_room", roomID:string}
                        |{type: "game_ended", reason: string}

export type UpdateBoardFunc = (move: ShortMove)=>boolean

export function useChessGameManager(url: string, color?: Color){
    
    const [side, setSide] = useState<Color|any>(color);
    const {position, checkIfPromotion,  updatePositon:updateBoard, turn} = useChessLogic();
    const roomID =  useRef<string|null>(null)
    const {onDrop, onPromotion} = useChessBoardCallbacks(updateBoard, sendMoveWrapper, checkIfPromotion, side, turn)

    const [gameStatus, setGameStatus] = useState<"joined"|"started"|"ended"|"created">("created")
    const [isConnected, setIsConnected] = useState<boolean>(false)
    

    function sendMoveWrapper(move: ShortMove){
        if(!roomID.current) throw new Error("No roomID")
        sendMove(roomID.current, move);
    }

    function stringMoveToObject(move: string) {
        return{
            from: move[0]+move[1],
            to: move[2]+move[3],
            promotion: move[4] || undefined,
        } as ShortMove
    }
    function objectMoveToString(move: ShortMove) {
        const promotion = move.promotion?move.promotion:""

        return move.from+move.to+promotion
    }
    function onMessage(message: IncomingMessage) {
        console.log(message);
        switch (message.type) {
            case "game_created":
                setGameStatus("created")
                joinRoom(message.roomID, side);
                break;
            case "game_started":
                console.log("game_started")
                setGameStatus("started")
                break;
            case "game_joined":
                setGameStatus("joined");
                setSide(message.side);
                console.log(message.roomID)
                roomID.current = message.roomID
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
    function startGame() {
        setGameStatus("started");
    }
    function onClose(event: CloseEvent) {
        setIsConnected(false)
    }
    function onOpen(event: Event) {
        setIsConnected(true)
    }
    function sendMove(roomID: string, move: ShortMove) {
        ws.sendMessageJSON({type:"move", roomID, move: objectMoveToString(move), side});
    }
    const ws = useWebSocket<IncomingMessage, OutgoingMessage>(url, onMessage, {onClose, onOpen})
    

    function joinRoom(roomID: string, side?: Color) {
        ws.sendMessageJSON({type:"join_room", roomID, side})
    }
    function createRoom(roomID: string) {
        ws.sendMessageJSON({type:"create_room", roomID});
    }


    return{
        position,
        gameStatus,
        isConnected,
        side,
        joinRoom,
        createRoom,
        sendMove,
        onDrop,
        onPromotion,
    }
}