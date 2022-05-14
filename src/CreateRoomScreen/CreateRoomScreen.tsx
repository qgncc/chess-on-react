import "./CreateRoomScreen.scss"
import {Color, Props} from "../types";
import {BlackBox} from "../BlackBox/BlackBox";
import {Link} from "react-router-dom";
import { v4 } from 'uuid';
import {ChangeEvent, useState} from "react";
import {connectionController} from "../connection/connection";

interface CreateRoomScreenProps extends Props{
    // connection: connectionController
}

export function CreateRoomScreen(props: CreateRoomScreenProps) {
    let className = props.className? props.className:"";
    let [checked, setChecked] = useState("any");
    function onChange(event: ChangeEvent<HTMLDivElement>) {
        setChecked(event.target.id);
    }
    function onClick(){
        let roomID = v4();
        let color: Color;
        if(checked === "any"){
            color = (Math.random()>0.5)?"w":"b";
        }else{
            color = checked as Color;
        }
        // props.connection.createRoom(roomID,color);
        return roomID;
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


                <Link to={onClick()} state={{ fromDashboard: true }}>
                    <button className="button button--margin--15 button--corners--rounded">
                        Create room
                    </button>
                </Link>

            </form>
        </BlackBox>
    )
}