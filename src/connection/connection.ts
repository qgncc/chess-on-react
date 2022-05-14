import {Color, NumericMove} from "../types";
import {Move} from "chess.js";

interface ChessEvent {
    type: string,
    roomID: string
}
interface RoomJoinedEvent{
    side: string
}
interface MoveEvent extends ChessEvent{
    move: NumericMove
}

export interface connectionController{
    onConnection:(event: Event)=>void,
    onRoomJoined:(event: RoomJoinedEvent)=>void,
    onMove:(event: MoveEvent)=>void
    onGameStart: ()=>void,
    sendMove:(move: NumericMove)=>void,
    declareEndOfGame(status:number):void,
    createRoom(id: string, roomCreatorColor: Color):void,
    joinRoom(join_roomID: string, side?: Color | "any"):void
}

export function createConnectionController(ws: WebSocket):connectionController {
    let side: Color;
    let roomID:string
    let onConnection = function (event: Event) {
        return;
    }
    let onRoomJoined = function (event: RoomJoinedEvent) {
        return;
    }

    let onGameStart = function () {
        return;
    }
    let onMove = function (event: MoveEvent) {
        return;
    }

    function onMessage(event: MessageEvent) {
        let message = JSON.parse(event.data);
        if(message.type === "error"){
            console.log("Server sent error: ", message.message);
        }
        if(message.type === "room_joined"){
            onRoomJoined(message)
        }
        if(message.type === "game_started"){
            onGameStart();
        }
        if(message.type === "room_created"){
            joinRoom(message.roomID, side);
        }
        if(message.type === "chess_move"){
            onMove(message)
        }
    }
    function sendMove(move: NumericMove ) {
        let message = {
            type:"chess_move",
            roomID: roomID,
            side,
            move
        };
        console.log(side)
        ws.send(JSON.stringify(message));
    }
    ws.addEventListener("open", onConnection);
    ws.addEventListener("message", onMessage);
    window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        e.returnValue = '';
        ws.send(JSON.stringify({type:"surrender", side, roomID: roomID}));
    });

    function declareEndOfGame(state: number){
        if(!roomID) console.log("no room id")
        ws.send(JSON.stringify({
                "type":"game_end",
                "roomID": roomID,
                "side":side,
                "state": state
            })
        );
    }

    function createRoom(id: string, roomCreatorColor:Color){
        side = roomCreatorColor;
        roomID = id
        ws.send(JSON.stringify({
                type:"create_room",
                roomID,
                color:roomCreatorColor
            })
        );


    }
    function joinRoom(join_roomID: string, side:Color|"any" = "any"){
        roomID = join_roomID;
        ws.send(JSON.stringify({
                "type":"join_room",
                "roomID": join_roomID,
                "side":side,
            })
        );
    }

    return {
        set onConnection(value:(event: Event)=>void){
            onConnection = value;
        },
        set onRoomJoined(value:(event: RoomJoinedEvent)=>void){
            onRoomJoined = value;
        },
        set onMove(value:(event: MoveEvent)=>void){
            onMove = value;
        },
        set onGameStart(value: ()=>void){
            onGameStart = value;
        },
        sendMove,
        declareEndOfGame,
        createRoom,
        joinRoom

    }
}