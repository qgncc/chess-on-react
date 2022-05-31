import "./Piece.scss"
import {Color, PieceType, Square} from "../types";
import {MouseEventHandler} from "react";

export interface PieceProps {
    color:Color
    type:PieceType,
    className?: string,
    square?:Square,
    isPromotion?: true
    onMouseDown?:MouseEventHandler<HTMLDivElement>
}



function Piece(props: PieceProps) {
    let {color,type,square} = props;
    let className = props.className === undefined? "": props.className;
    let squareClass = square === undefined? "":"square-"+square.file+square.rank;
    let pieceClass = color+type;

    return (
        <div onMouseDown={props.onMouseDown} className={(props.isPromotion?"promotion-piece ":"piece ")+className+" "+pieceClass+" "+squareClass}/>
    );
}

export default Piece;
