import ChessBoard from "../../components/ChessBoard/ChessBoard";
import {WaitingScreen} from "../../components/WaitngScreen/WaitingScreen";
import {useParams} from "react-router";
import { useLocation } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { useChessGameManager } from "../../hooks/useChessGameManager";
import { Color } from "../../types";
import { VictoryPrompt } from "../../components/VictoryPrompt/VictoryPrompt"
import useAuthRedirect from "../../hooks/useAuthRedirect";

interface LobbyProps{
}



export function Lobby(props: LobbyProps) {
    useAuthRedirect()
    
    const {roomID} = useParams();
    const location = useLocation();
    const state = location.state as {isRoomCreator: boolean, color: Color}|null
    if(!roomID) throw new Error("No roomID");
    
    const manager = useChessGameManager(state?.color);

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
        if(manager.gameStatus === "created"){
            return <WaitingScreen roomID={roomID}/>
        }else{
            return <>Creating room...</>
        }
    }else{
        return <>Joining room....</>
    }

}