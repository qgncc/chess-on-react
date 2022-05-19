import "./CreateRoomScreen.scss"
import {Color, GameObject, Props} from "../types";
import {BlackBox} from "../BlackBox/BlackBox";
import {Link, useNavigate} from "react-router-dom";
import { v4 } from 'uuid';
import {ChangeEvent, MouseEvent, useEffect, useState} from "react";

interface CreateRoomScreenProps extends Props{
    GameObject: GameObject;
}
export function CreateRoomScreen(props: CreateRoomScreenProps) {
    let {state, dispatch} = props.GameObject
    let className = props.className? props.className:"";
    let [checked, setChecked] = useState<Color|"any">("any");
    function onChange(event: ChangeEvent<HTMLDivElement>) {
        setChecked(event.target.id as Color|"any");
    }
    function onClick(event:MouseEvent<HTMLButtonElement>){
        event.preventDefault();
        let roomID = v4();
        dispatch({type: "create_room", roomID, checked})
    }
    return(
        <BlackBox className={className}>
            <form action="" className="options">
                <input checked={checked === "any"}
                       type="radio"
                       name="side"
                       value="any"
                       id="any"
                       onChange={onChange}
                />
                <label htmlFor="any" className="options__option any"/>

                <input checked={checked === "w"}
                       type="radio"
                       name="side"
                       value="w"
                       id="w"
                       onChange={onChange}
                />
                <label htmlFor="w" className="options__option wk"/>

                <input checked={checked === "b"}
                       type="radio"
                       name="side"
                       value="b"
                       id="b"
                       onChange={onChange}
                />
                <label htmlFor="b" className="options__option bk"/>


                {
                    state.isConnectionOpen?
                    <button onClick={onClick} className="button button--margin--15 button--corners--rounded">
                        Create room
                    </button>
                        :
                    <button disabled={true} className="button button--blocked button--margin--15 button--corners--rounded">
                        Waiting for connection...
                    </button>
                }
            </form>
        </BlackBox>
    )
}