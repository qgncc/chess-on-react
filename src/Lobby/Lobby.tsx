import ChessBoard from "../ChessBoard/ChessBoard";
import { GameObject } from "../types";
import {WaitingScreen} from "../WaitngScreen/WaitingScreen";
import {useParams} from "react-router";
import {useEffect} from "react";

interface LobbyProps{
    GameObject: GameObject;
}

export function Lobby(props: LobbyProps) {
    const {state, dispatch} = props.GameObject;
    const {roomID} = useParams();
    useEffect(()=>{
        dispatch({type: "join_room", roomID: roomID!, side: "any"});
    },[]);

    return(
        <>
            {
            state.isGameStarted?
                <ChessBoard
                    flipped = {state.side !== "w"}
                    GameObject = {props.GameObject}
                />
                :
                <WaitingScreen roomID={roomID}/>
            }
        </>
    );
}