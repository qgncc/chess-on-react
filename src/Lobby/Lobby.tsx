import ChessBoard from "../ChessBoard/ChessBoard";
import {WaitingScreen} from "../WaitngScreen/WaitingScreen";
import {useParams} from "react-router";
import { useChessBoard } from "../hooks/useChessBoard";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useChessGameManager } from "../hooks/useChessGameManager";

interface LobbyProps{
}

export function Lobby(props: LobbyProps) {
    const wsURL = process.env.NODE_ENV === "development"?
        "ws://localhost:8081/":"wss://chess.qgncc.com/"
    const {roomID} = useParams();
    const location = useLocation();
    const state = location.state as {isRoomCreator: boolean}
    const {position, onDrop, onPromotion, updateBoard} = useChessBoard();

    const manager = useChessGameManager(wsURL, updateBoard);

    useEffect(()=>{
        if(!roomID) throw new Error("No roomID");
        manager.joinRoom(roomID);
    },[roomID]);

    return(
        <>
        {
            state.isRoomCreator? 
                manager.gameStatus === "started"?
                <ChessBoard onDrop={onDrop} 
                            position={position}
                            onPromotion={onPromotion}
                />
                :
                "Loading..."
            :
            <WaitingScreen roomID={roomID}/>
        }
        </>
    );
}