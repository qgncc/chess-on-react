import "./BlackBox.scss"
import {Props} from "../../types";

export function BlackBox(props: Props) {
    let className = props.className? props.className:"";

    return(
        <div className ={"black_box " + className}>
            {props.children}
        </div>
    )

}