import "./WaitingScreen.scss"
import {Props} from "../../types";
import {BlackBox} from "../BlackBox/BlackBox";
import React, {useRef} from "react";

interface WaitingScreenProps extends Omit<Props,"children">{
    roomID:string|undefined;
}

export function WaitingScreen(props:WaitingScreenProps) {
    let className = props.className? props.className:"";
    let ref = useRef() as React.MutableRefObject<HTMLInputElement>;

    function copyTextToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
        }, function(err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    return(
        <BlackBox className={className}>
            <h1>The room has been created! Here is the invitation link: </h1>
            <div className="link_box">
                <input ref={ref}
                       value={props.roomID?"http://chess.qgncc.com/"+props.roomID:""}
                       type="text"
                       disabled={true}
                       className="link_box__url"/>
                {navigator?.clipboard && <button onClick={(event) => copyTextToClipboard(ref.current.value)}
                         className="link_box__copy_button">
                    Copy
                </button>}
            </div>
        </BlackBox>
    );
}