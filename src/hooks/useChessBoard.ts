import {useRef, useCallback, useState} from "react"
import { DropEvent } from "../ChessBoard/ChessBoard";
import { AlgebraicMove, Color, SquareObject } from "../types";

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

    function updateBoard(move: AlgebraicMove) {
        const newMove = chess.move(move);
        if(newMove) setPosition(chess.board());
        return !!newMove
    }
    function onDrop(dropEvent: DropEvent) {
        const squareFrom = dropEvent.initialSquare;
        const squareTo = dropEvent.dropSquare;

        if(!chess) return false
        const newMove = {
            from: squareFrom.algebraic,
            to: squareTo.algebraic
        }

        function some(move: any){
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
        const result = updateBoard(newMove)
        console.log(chess.ascii());
        return result;
    }
    function onPromotion(
        isCancled: boolean, 
        piece?:{type: "q"|"r"|"b"|"n", color: Color}
    ){
        if(!isCancled) {
            if(!promotionSquares.current) throw new Error("No promotion squares!");
            const {squareFrom: from, squareTo: to} = promotionSquares.current
            updateBoard({from:from.algebraic, to: to.algebraic, promotion: piece?.type});
            promotionPawn.current = null
        }else{
            promotionPawn.current && (promotionPawn.current.style.display = "block")
        }
    }
    return{
        position,
        onPromotion: useCallback(onPromotion,[chess, promotionPawn.current, promotionSquares.current]),
        onDrop: useCallback(onDrop, [chess]),
        updateBoard: useCallback(updateBoard, [chess])
    }
    
}