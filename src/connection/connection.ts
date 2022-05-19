import {Color, NumericMove} from "../types";
import {GameStartedEvent, MoveEvent, RoomCreatedEvent, RoomJoinedEvent} from "../WebSocketMessages";

export interface ConnectionControllerOptions{
    max_delay?: number,
    min_delay?: number,
    time_factor?: number,
}
export interface RematchEvent{
    side:Color
}

export interface ConnectionController{
    declareEndOfGame: (state: number, roomID: string, side: Color) => void;
    isOpen: boolean;
    joinRoom: (roomID: string, side?: (Color | "any")) => void;
    onConnection: (fn: (event: Event) => void, once?:true) => void;
    onClose: (fn: (event: Event) => void, once?:true) => void;
    createRoom: (roomID: string) => void;
    sendMove: (move: NumericMove, roomID: string, side: Color) => void;
    onRoomCreated: (fn: (event: RoomCreatedEvent) => void) => void;
    onRoomJoined: (fn: (event: RoomJoinedEvent) => void) => void;
    onMove: (fn: (event: MoveEvent) => void) => void;
    onGameStart: (fn: (event: GameStartedEvent) => void) => void;
    onRematch: (fn: (event: RematchEvent) => void) => void;
    host: string,
    sendRematchReq:(roomID: string, side: Color) => void,
}
declare global {
    interface Window { chessConnection: ConnectionController; }
}
export function connect(host: string, options?: ConnectionControllerOptions): ConnectionController{
    if(window.chessConnection && window.chessConnection.host === host){
        return window.chessConnection;
    }
    const min_delay = options?.min_delay || 1000;
    const max_delay = options?.min_delay || 600000;
    const time_factor = options?.time_factor || 1.5;



    let ws = new WebSocket(host);
    let doOnRoomJoined:((event:RoomJoinedEvent)=>void)[] = []
    let doOnMove:((event:MoveEvent)=>void)[] = []
    let doOnGameStart:((event: GameStartedEvent)=>void)[] = []
    let doOnRoomCreated:((event: RoomCreatedEvent)=>void)[] = []
    let doOnRematch:((event: RematchEvent)=>void)[] =[]
    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", ()=>setTimeout(reconnect,1000));
    ws.addEventListener("open", ()=>{console.log("Connection is open")});
    ws.addEventListener("close", ()=>{console.log("Connection is closed")});


    function onConnection(fn:(event:Event)=>void, once?:true) {
        ws.addEventListener("open", fn, {once:!!once});
    }
    function onClose(fn:(event:Event)=>void,once?:true) {
        ws.addEventListener("close", fn,{once:!!once});
    }
    function onRoomJoined(fn: (event: RoomJoinedEvent) => void) {
        console.log("room_joined")

        doOnRoomJoined.push(fn);
    }
    function onRematch(fn: (event: RematchEvent) => void) {
        doOnRematch.push(fn);
    }
    function onMove(fn: (event: MoveEvent) => void) {
        doOnMove.push(fn);
    }
    function onGameStart(fn: (event: GameStartedEvent) => void) {
        doOnGameStart.push(fn);
    }
    function onRoomCreated(fn: (event: RoomCreatedEvent) => void) {
        doOnRoomCreated.push(fn);
    }


    function onMessage(event: MessageEvent) {
        let message = JSON.parse(event.data);
        console.log(message);
        if(message.type === "error"){
            console.log("Server sent error: ", message.message);
        }
        if(message.type === "room_joined"){
            _onRoomJoinedMessage(message)
        }
        if(message.type === "game_started"){
            _onGameStartMessage(message)
        }
        if(message.type === "room_created"){
            _onRoomCreatedMessage(message)
        }
        if(message.type === "move"){
            _onMoveMessage(message)
        }
        if(message.type === "rematch"){
            _onRematchMessage(message)
        }
    }

    function _onGameStartMessage(message: GameStartedEvent){
        for (const fn of doOnGameStart) {
            fn(message);
        }
    }
    function _onRoomJoinedMessage(message: RoomJoinedEvent){
        for (const fn of doOnRoomJoined) {
            fn(message);
        }
    }
    function _onRoomCreatedMessage(message: RoomCreatedEvent){
        for (const fn of doOnRoomCreated) {
            fn(message);
        }
    }
    function _onRematchMessage(message: RematchEvent){
        for (const fn of doOnRematch) {
            fn(message);
        }
    }

    function _onMoveMessage(message: MoveEvent){
        console.log(doOnMove);
        for (const fn of doOnMove) {
            fn(message);
        }
    }
    function send(message: any, tryNumber = 0){
        console.log("Trying to send message: ", message);
        if(ws.readyState === ws.OPEN){
            console.log("Success!")
            ws.send(JSON.stringify(message));
        }else{
            console.log("Nope!")
            let delay = Math.min(
                min_delay+((Math.random()+0.1)*time_factor*tryNumber),
                max_delay*(Math.random()+0.1)
            );
            setTimeout(()=>send(message, tryNumber+1), delay)
        }
    }
    function sendMove(move: NumericMove, roomID:string, side: Color) {
        let message = {
            type:"move",
            roomID,
            side,
            move
        };
        send(message);
    }

    function reconnect() {
        ws = new WebSocket(host);
    }
    function declareEndOfGame(state: number, roomID: string, side: Color){
        let message = {
                type:"game_end",
                roomID: roomID,
                side: side,
                state: state
            };
        send(message);
    }
    function createRoom(roomID: string){
        let message = {
                type:"create_room",
                roomID: roomID,
            }
        send(message);
    }
    function joinRoom(roomID: string, side:Color|"any" = "any"){
        let message = {
            type:"join_room",
            roomID: roomID,
            side: side,
        }
        send(message);
    }
    function sendRematchReq(roomID: string, side:Color) {
        let message = {
            type:"rematch_request",
            roomID: roomID,
            side: side
        }
        send(message);
    }
    window["chessConnection"] = {
        sendRematchReq,
        host,
        onRematch,
        onRoomCreated,
        onRoomJoined,
        onMove,
        onGameStart,
        onConnection,
        onClose,
        sendMove,
        declareEndOfGame,
        createRoom,
        joinRoom,
        get isOpen() {
            return ws.readyState === ws.OPEN;
        },
        set isOpen(value: boolean){
        }

    };
    return window.chessConnection;
}