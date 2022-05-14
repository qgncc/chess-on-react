import "./PromotionWindow.scss"
import {ChessNumbers, Color} from "../types";
import Piece from "../Piece/Piece";
import {ReactChild} from "react";
interface PromotionProps {
    file: ChessNumbers,
    color: Color,
    position: "top"|"bottom"
    children: ReactChild|ReactChild[]
}


export function PromotionWindow(props: PromotionProps) {
    let positionClass = props.position === "top"? "promotion-window--top ": "";
    return(
        <div className ={"promotion-window "+positionClass}
             style={{transform:`translateX(${props.file*100}%)`}}>
            {props.children}
        </div>
    )
}