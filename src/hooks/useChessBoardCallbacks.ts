import { PieceType, ShortMove } from "chess.js";
import { useCallback, useRef } from "react";
import { DropEvent } from "../ChessBoard/ChessBoard";
import { Color, SquareObject } from "../types";



export function useChessBoardCallbacks(
    tryUpdatePosition: (move: ShortMove)=>boolean,
    sendMove: (move: ShortMove)=>void, 
    checkIfPromotion:(move: ShortMove)=>boolean,
    side: Color,
    turn: ()=>Color
){
    
    const promotionPawn = useRef<HTMLDivElement|null>(null)
    const promotionSquares = useRef<{squareFrom:SquareObject, squareTo: SquareObject}|null>(null)

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
        const result = tryUpdatePosition(newMove)
        if(result) sendMove(newMove)
        return result;
    }
    function onPromotion(
        isCancled: boolean, 
        piece?:{type: "q"|"r"|"b"|"n", color: Color}
    ){
        if(!isCancled) {
            if(!promotionSquares.current) throw new Error("No promotion squares!");
            const {squareFrom: from, squareTo: to} = promotionSquares.current
            const newMove = {from:from.algebraic, to: to.algebraic, promotion: piece?.type}
            let result = tryUpdatePosition(newMove);
            if(result) sendMove(newMove)
            promotionPawn.current = null
        }else{
            promotionPawn.current && (promotionPawn.current.style.display = "block")
        }
    }

    return{
        onDrop: useCallback(onDrop, [tryUpdatePosition, checkIfPromotion, sendMove, side, turn]),
        onPromotion: useCallback(onPromotion, [tryUpdatePosition, sendMove])
    }
}