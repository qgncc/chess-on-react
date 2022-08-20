import ChessBoard from "../ChessBoard/ChessBoard";
import {WaitingScreen} from "../WaitngScreen/WaitingScreen";
import {useParams} from "react-router";
import { useChessLogic } from "../hooks/useChessLogic";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useChessGameManager } from "../hooks/useChessGameManager";
import { Color } from "../types";

interface LobbyProps{
}

export function Lobby(props: LobbyProps) {
    const wsURL = process.env.NODE_ENV === "development"?
        "ws://localhost:8081/":"wss://chess.qgncc.com/"
    const {roomID} = useParams();
    const location = useLocation();
    const state = location.state as {isRoomCreator: boolean, color: Color}|null
    if(!roomID) throw new Error("No roomID");
    
    const manager = useChessGameManager(wsURL, state?.color);

    useEffect(()=>{
        if(!roomID) throw new Error("No roomID");
        if(state?.isRoomCreator) {
            manager.createRoom(roomID);
        }else{
            manager.joinRoom(roomID)
        }
    },[roomID]);

    return(
        <>
        {
            manager.gameStatus === "started"?
            <ChessBoard onDrop={manager.onDrop} 
                        position={manager.position}
                        onPromotion={manager.onPromotion}
                        flipped={manager.side === "w"? false: true}
            />
            :
            state?.isRoomCreator? 
                <WaitingScreen roomID={roomID}/>
                :
                "Loading...."
        }
        </>
    );
}