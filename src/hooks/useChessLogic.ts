import { ShortMove } from "chess.js";
import {useRef, useCallback, useState} from "react"
import { DropEvent } from "../ChessBoard/ChessBoard";
import { AlgebraicMove, Color, SquareObject } from "../types";

const Chess = require("chess.js");
export function useChessLogic() {
    const chessRef = useRef(Chess());
    const chess = chessRef.current;
    const [position, setPosition] = useState<ReturnType<typeof chess.board>>(chess.board());
    
    function onMove(move: AlgebraicMove) {
        const newMove = chess.move(move);
        if(newMove) setPosition(chess.board());
        console.log(chess.ascii())
        return !!newMove
    }

    function checkIfPromotion(move: ShortMove) {
        const LAST_RANK ={
            b:"1",
            w:"8"
        } as const

        function some(m: any){
            return (m.to === move.to && m.flags.includes("p"));
        }

        const piece = chess.get(move.from);
        return (
            piece
            && piece.type === "p" 
            && move.to[1] === LAST_RANK[chess.turn() as Color]
            && chess.moves({square: move.from, verbose: true})
            .some(some))
    }
    function reset() {
        chess.reset()
    }

    return{
        position,
        reset,
        updatePositon: useCallback(onMove, [chess]),
        checkIfPromotion: useCallback(checkIfPromotion, [chess]),
        turn: useCallback(()=>chess.turn(), [chess])
    }
    
}