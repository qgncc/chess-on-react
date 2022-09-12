import { ShortMove } from "chess.js";
import { useCallback, useRef, useState } from "react";
import { AlgebraicNotation, SquareObject, Color, AlgebraicMove } from "../types";
import { DropEvent, PickEvent } from "../components/ChessBoard/ChessBoard";
import { useChessLogic } from "./useChessLogic";
import { useWebSocket } from "./useWebSocket";
import sound from "../utils/chessGameSoundsPlayer";

type IncomingMessage = {type: "move", move: string} 
                        |{type: "game_joined", side: Color, roomID: string} 
                        |{type: "game_created", roomID: string} 
                        |{type: "game_started", side: Color} 
                        |{type: "game_ended", reason: string}
                        |{type: "error", errorID: number}
type OutgoingMessage = {type: "move", move: string, side: Color}
                        |{type: "create_room", side?:Color}
                        |{type: "join_room", roomID:string}
                        |{type: "game_ended", reason: string}

export type UpdateBoardFunc = (move: ShortMove)=>boolean


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

export function useChessGameManager(url: string, color?: Color){
    const HIGHLIGHT_SQUARE_COLOR = "#ffff00";
    const [side, setSide] = useState<Color|any>(color);
    const {position, checkIfPromotion,  updatePositon, turn, reset, inCheck} = useChessLogic();
    const roomID =  useRef<string|null>(null)

    const promotionPawn = useRef<HTMLDivElement|null>(null)
    const promotionSquares = useRef<{squareFrom:SquareObject, squareTo: SquareObject}|null>(null)

    const [seletePieceSquare, setSelectedPieceSquare] = useState<AlgebraicNotation|null>(null);
    const [highlightedSquares, setHighlightedSquares] = useState<{[key in AlgebraicNotation]?: string}>({});

    const [gameStatus, setGameStatus] = useState<"joined"|"started"|"ended"|"created">("created")
    const [isConnected, setIsConnected] = useState<boolean>(false)
    
    const ws = useWebSocket<IncomingMessage, OutgoingMessage>(url, onMessage, {onClose, onOpen, shouldReconnect: true, exponentialBackOff: true})

    
    function onMessage(message: IncomingMessage) {
        console.log(message);
        switch (message.type) {
            case "game_created":
                setGameStatus("created")
                joinRoom(message.roomID, side);
                break;
            case "game_started":
                console.log("game_started")
                startGame(message.side)
                break;
            case "game_joined":
                setGameStatus("joined");
                setSide(message.side);
                console.log(message.roomID)
                roomID.current = message.roomID
                break;
            case "game_ended":
                setGameStatus("ended")
                sound.play("gameEnded")
                break;
            case "move":
                const move = stringMoveToObject(message.move)
                updateBoard(move)
                break;
        
            default:
                break;
        }
    }
    function startGame(side: Color) {
        setGameStatus("started");
        setSide(side);
        setHighlightedSquares({});
        setSelectedPieceSquare(null);
        reset();
        sound.play("gameStarted");
    }
    function onClose(event: CloseEvent) {
        setIsConnected(false)
    }
    function onOpen(event: Event) {
        setIsConnected(true)
    }
    


    const sendRematchReq = useCallback((roomID: string) => {
        ws.sendMessageJSON({type:"rematch_request", side, roomID})
    }, [side, ws])    
    const joinRoom =  useCallback((roomID: string, side?: Color) => {
        ws.sendMessageJSON({type:"join_room", roomID, side})
    }, [ws])
    const sendMove = useCallback((roomID: string, move: AlgebraicMove) => {
        ws.sendMessageJSON({type:"move", roomID, move: objectMoveToString(move), side});
    }, [ws, side])
    const createRoom = useCallback((roomID: string) => {
        ws.sendMessageJSON({type:"create_room", roomID});
    }, [ws])
    
    const updateBoard = useCallback((move: AlgebraicMove) => {
        
        const result = updatePositon(move)
        if(!roomID.current) throw new Error("No roomID")
        if(result) {
            setHighlightedSquares({
                [move.from]: HIGHLIGHT_SQUARE_COLOR,
                [move.to]: HIGHLIGHT_SQUARE_COLOR,
            })
            setSelectedPieceSquare(null);

            if(inCheck()){
                sound.play("check")
            }else if(result.flags.includes("c")){
                sound.play("capture");
            }else{
                sound.play("move")
            }
            return true
        }else{
            if(turn() === side && inCheck()){
                sound.play("cantMove")
            }
            return false
        }
    }, [updatePositon, inCheck, side, turn, setHighlightedSquares, setSelectedPieceSquare])

    const makeMove = useCallback((move: AlgebraicMove) => {
        let result = updateBoard(move);
        if(!roomID.current) throw new Error("No roomID")
        if(result) sendMove(roomID.current, move);
        return result;

    }, [updateBoard, sendMove])

    
    //-----------------CALLBACKS
    function onPick(event: PickEvent) {
        setSelectedPieceSquare(event.square.algebraic);
        return true
    }

    function onDrop(dropEvent: DropEvent) {
        if(side !== turn()) return false

        const squareFrom = dropEvent.initialSquare;
        const squareTo = dropEvent.dropSquare;

        const newMove = {
            from: squareFrom.algebraic,
            to: squareTo.algebraic
        }

        
        if(checkIfPromotion(newMove))
        {
            dropEvent.openPromotionWindow(squareTo.numeric.file, dropEvent.color, true);
            promotionSquares.current = {squareFrom, squareTo};
            if(dropEvent.htmlElement){
                promotionPawn.current = dropEvent.htmlElement
                promotionPawn.current.style.display = "none";
            }
            
            return false
        }
        
        return makeMove(newMove);
    }
    function onPromotion(
        isCancled: boolean, 
        piece?:{type: "q"|"r"|"b"|"n", color: Color}
    ){
        if(!isCancled) {
            if(!promotionSquares.current) throw new Error("No promotion squares!");
            const {squareFrom: from, squareTo: to} = promotionSquares.current
            const newMove = {from:from.algebraic, to: to.algebraic, promotion: piece?.type}
            makeMove(newMove)
            promotionPawn.current = null
        }else{
            promotionPawn.current && (promotionPawn.current.style.display = "block")
        }
    }
    //------------------------


    return{
        position,
        gameStatus,
        isConnected,
        side,
        get highlightedSquares(){
            if(seletePieceSquare){
                return {...highlightedSquares, [seletePieceSquare]: HIGHLIGHT_SQUARE_COLOR}
            }else{
                return highlightedSquares
            }
        },
        joinRoom,
        createRoom,
        sendMove,
        sendRematchReq,
        onPick: useCallback(onPick, []),
        onDrop: useCallback(onDrop, [ checkIfPromotion, side, turn, makeMove]),
        onPromotion: useCallback(onPromotion, [makeMove]),
    }
}