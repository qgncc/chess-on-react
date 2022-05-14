import "./WaitingScreen.scss"
import {Props} from "../types";
import {BlackBox} from "../BlackBox/BlackBox";

interface WaitingScreenProps extends Omit<Props,"children">{
    gameID:string|undefined;
}

export function WaitingScreen(props:WaitingScreenProps) {
    let className = props.className? props.className:"";

    return(
        <BlackBox className={className}>
            <h1>The room has been created! Here is the invitation link: </h1>
            <div className="link_box">
                <input value={props.gameID?props.gameID:""} type="text" disabled={true} className="link_box__url"/>
                <button className="link_box__copy_button">
                    Copy
                </button>
            </div>
        </BlackBox>
    );
}