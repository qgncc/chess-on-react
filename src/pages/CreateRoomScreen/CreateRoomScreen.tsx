import "./CreateRoomScreen.scss"
import { Color, Props } from "../../types";
import { BlackBox } from "../../components/BlackBox/BlackBox";
import { useNavigate } from "react-router-dom";
import { v4 } from 'uuid';
import {ChangeEvent, MouseEvent, useEffect, useState} from "react";
import useAuthRedirect from "../../hooks/useAuthRedirect";

interface CreateRoomScreenProps extends Props{
}
export function CreateRoomScreen(props: CreateRoomScreenProps) {
    let [checked, setChecked] = useState<Color|"any">("any");
    const navigate = useNavigate();
    function onChange(event: ChangeEvent<HTMLDivElement>) {
        setChecked(event.target.id as Color|"any");
    }
    useAuthRedirect()

    function onClick(event:MouseEvent<HTMLButtonElement>){
        let color;
        if(checked === "any"){
            color = Math.random()>0.5?"w":"b";
        }
        else{
            color = checked;
        }
        event.preventDefault();
        let roomID = v4();
        navigate("../"+roomID, { replace: true, state: {isRoomCreator: true, color}});
    }
    return(
        <BlackBox>
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


                <button onClick={onClick} className="button button--margin--15 button--corners--rounded">
                    Create room
                </button>
            </form>
        </BlackBox>
    )
}