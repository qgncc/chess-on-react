import "./VictoryPrompt.scss";
import {MouseEvent, useState} from "react";

interface VictoryPrompt {
    reason: string
    sendRematchReq: ()=>void;
}

export function VictoryPrompt(props: VictoryPrompt) {
    let [isRematchSent, setIsRematchSent] = useState(false);
    function onMouseDown(event: MouseEvent<HTMLDivElement>){
        event.stopPropagation();
    }
    function onClick(event: MouseEvent<HTMLButtonElement>) {
        props.sendRematchReq();
        setIsRematchSent(true);
    }
    return(
        <div onPointerDown={onMouseDown} className = "modal_wrapper">
            <div className = "modal_wrapper__victory-window">
                <div className="modal__title">
                    Victory!
                </div>
                {
                    isRematchSent?
                    <button disabled={true} onClick={onClick} className="button button--blocked modal__button">
                        Waiting...
                    </button>
                        :
                    <button onClick={onClick} className="button modal__button">
                        Rematch
                    </button>
                }
            </div>
        </div>
    );
}