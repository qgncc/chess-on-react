import ChessBoard from "../ChessBoard/ChessBoard";
import {WaitingScreen} from "../WaitngScreen/WaitingScreen";
import {useParams} from "react-router";
import { useLocation } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { useChessGameManager } from "../../hooks/useChessGameManager";
import { Color } from "../../types";
import { VictoryPrompt } from "../VictoryPrompt/VictoryPrompt"

interface LobbyProps{
}



export function Lobby(props: LobbyProps) {
    const wsURL = process.env.NODE_ENV === "development"?
        "ws://localhost:8081/":"wss://chess.qgncc.com/ws"
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

    const sendRematchWrapper = useCallback(()=>manager.sendRematchReq(roomID),[manager.sendRematchReq])

    if(manager.gameStatus === "started" || manager.gameStatus === "ended"){
        return (
            <ChessBoard onDrop={manager.onDrop} 
                        position={manager.position}
                        onPromotion={manager.onPromotion}
                        onPick={manager.onPick}
                        highlightedSquares={manager.highlightedSquares}
                        flipped={manager.side === "w"? false: true}
            >
                {(manager.gameStatus === "ended") && <VictoryPrompt reason="TODO reason" sendRematchReq={sendRematchWrapper}/> }
            </ChessBoard>
        )
    }else if(state?.isRoomCreator){
        return <WaitingScreen roomID={roomID}/>
    }else{
        return <>Loading....</>
    }

}