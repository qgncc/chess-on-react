import {useRef, useCallback, useState} from "react"
import { DropEvent } from "../ChessBoard/ChessBoard";
import { Color, SquareObject } from "../types";

const Chess = require("chess.js");
export function useChessBoard() {
    const chessRef = useRef(Chess());
    const chess = chessRef.current;
    const [position, setPosition] = useState<ReturnType<typeof chess.board>>(chess.board());
    const LAST_RANK ={
        b:1,
        w:8
    } as const
    const promotionPawn = useRef<HTMLDivElement|null>(null)
    const promotionSquares = useRef<{squareFrom:SquareObject, squareTo: SquareObject}|null>(null)


    function drop(dropEvent: DropEvent) {
        const squareFrom = dropEvent.initialSquare;
        const squareTo = dropEvent.dropSquare;

        if(!chess) return false
        const newMove = {
            from: squareFrom.algebraic,
            to: squareTo.algebraic
        }

        function some(move: any){
            console.log("Some move",move);
            return (move.to === squareTo.algebraic && move.flags.includes("p"));
        }

        if(dropEvent.type === "p" 
            && squareTo.numeric.rank === LAST_RANK[chess.turn() as Color]
            && chess.moves({square: squareFrom.algebraic, verbose: true})
            .some(some)
        ){
            dropEvent.openPromotionWindow(squareTo.numeric.file, dropEvent.color, true);
            promotionSquares.current = {squareFrom, squareTo};
            if(dropEvent.htmlElement){
                promotionPawn.current = dropEvent.htmlElement
                promotionPawn.current.style.display = "none";
            }
            
            return false
        }
        console.log(newMove);
        const move = chess.move(newMove)
        setPosition(chess.board());
        console.log(chess.ascii());
        return !!move;
    }
    function onPromotion(
        isCancled: boolean, 
        piece?:{type: "q"|"r"|"b"|"n", color: Color}
    ){
        if(!isCancled) {
            if(!promotionSquares.current) throw new Error("No promotion squares!");
            const {squareFrom: from, squareTo: to} = promotionSquares.current
            const move = chess.move({from:from.algebraic, to: to.algebraic, promotion: piece?.type});
            console.log({from:from.algebraic, to: to.algebraic, promotion: piece?.type});
            setPosition(chess.board());
            promotionPawn.current = null
        }else{
            promotionPawn.current && (promotionPawn.current.style.display = "block")
        }
    }
    return{
        position,
        onPromotion: useCallback(onPromotion,[]),
        onDrop: drop,
        chess
    }
    
}