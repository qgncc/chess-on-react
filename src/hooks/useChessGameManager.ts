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
    
    const {position, checkIfPromotion,  updatePositon:updateBoard} = useChessLogic();
    const {onDrop, onPromotion} = useChessBoardCallbacks(updateBoard, checkIfPromotion)

    const onDropWrapper: typeof onDrop = function(event) {
        
        const isLegal = onDrop(event);
        console.log(isLegal)
        if(isLegal){
            console.log(roomID.current)
            if(roomID.current){ 
                sendMove(
                    roomID.current,
                    {
                        from:event.initialSquare.algebraic, 
                        to: event.dropSquare.algebraic
                    }, 
                );
            }
            return true;
        }
        else return false
    }
    function onPromotionWrapper() {
    }
    const [side, setSide] = useState<Color|any>(color);
    const roomID =  useRef<string|null>(null)
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
    let [gameStatus, setGameStatus] = useState<"joined"|"started"|"ended"|"created">("created")
    let [isConnected, setIsConnected] = useState<boolean>(false)
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
        onDrop: onDropWrapper,
        onPromotion,
    }
}