import "./PromotionWindow.scss"
import {ChessNumbers, Color} from "../../types";
import { MouseEvent } from "react";
interface PromotionProps {
    file: ChessNumbers,
    color: Color,
    isAtTop: boolean,
    onPromotion: (
        isCancled: boolean, 
        piece?:{color: Color, type: "q"|"r"|"b"|"n"}
    )=>void,
}


export function PromotionWindow(props: PromotionProps) {
    const {color, isAtTop, file, onPromotion} = props;
    function onPromotionWrapper(
        event: MouseEvent<HTMLDivElement>,
        isCancled: boolean, 
        piece:{color: Color, type: typeof piecesTypes[number]}
    ){
        event.stopPropagation()
        onPromotion(isCancled, piece)
    }
    const piecesTypes = ["n","b","r","q"] as const;
    const positionClass = isAtTop? "promotion-window--top ": "";
    const pieces = piecesTypes.map((type)=>{
        return <div key={type} className={color+type+" promotion-piece"} 
                    onPointerDown={(event)=>onPromotionWrapper(event,false, {color,type})}/>
    })

    return(
        <div className ={"promotion-window "+positionClass}
            style={{transform:`translateX(${(file-1)*100}%)`}}>
            {pieces}
        </div>
    )
}