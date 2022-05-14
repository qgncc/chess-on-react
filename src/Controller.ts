export {}
// import * as t from './types';
// import {v4 as uuid_generator} from "uuid";
//
// import ChessGameState from "./GameState";
//
//
//
// export default function Controller(socket: WebSocket,host: string,root: HTMLElement){
//
//
//     let state = ChessGameState();
//     let side:t.Color;
//     let roomID: string;
//     root.addEventListener("chess_move", onMove);
//     root.addEventListener("game_ended", onGameEnd);
//
//     victoryWindow.button.addEventListener("click", onRematch);
//
//     socket.addEventListener("open", onConnection);
//     socket.addEventListener("message", onMessage);
//     window.addEventListener('beforeunload', function (e) {
//         e.preventDefault();
//         e.returnValue = '';
//         socket.send(JSON.stringify({type:"surrender", side, roomID: roomID}));
//     });
//     function onGameEnd(event: CustomEventInit) {
//         let newState = event.detail.state;
//         state.set(newState);
//         let result: t.Color|"draw" = state.isDraw()? "draw" : state.isWhiteWon()? "w" : "b";
//         // victoryWindow.render(root, result);
//         declareEndOfGame(state.value);
//     }
//
//     function onMove(event: CustomEventInit) {
//         let message = event.detail;
//         message.type = "chess_move";
//         message.roomID = roomID;
//         message.side = side;
//         console.log(side)
//         socket.send(JSON.stringify(message));
//
//     }
//
//     function onMessage(event: MessageEvent) {
//         let message = JSON.parse(event.data);
//         if(message.type === "error"){
//             console.log("Server sent error: ", message.message);
//         }
//         if(message.type === "room_joined"){
//             side = message.side;
//             console.log(side);
//         }
//         if(message.type === "game_started"){
//             // waitingScreen.destroy();
//             // Chess.startGame(message.side);
//         }
//         if(message.type === "chess_move"){
//             let from = message.move.from;
//             let to = message.move.to;
//             let promotion = message.move.promotion;
//             // Chess.move(from, to, promotion);
//         }
//     }
//     function onConnection(event: Event) {
//         return;
//     }
//
//     function onRematch(event: Event){
//         rematch();
//     }
//
//     function onCreateRoom(event: Event) {
//         let color: t.Color;
//         event.preventDefault();
//         let checked = form.whichChecked() as t.Color|"any";
//         if(checked === "any"){
//             color = (Math.random()>0.5)?"w":"b";
//         }else{
//             color = checked;
//         }
//         createRoom(color);
//     }
//
//     function rematch(){
//         socket.send(JSON.stringify({
//                 "type":"rematch_request",
//                 "roomID": roomID,
//                 "side":side,
//             })
//         );
//     }
//
//     function declareEndOfGame(state: number){
//         if(!roomID) console.log("no room id")
//         socket.send(JSON.stringify({
//                 "type":"game_end",
//                 "roomID": roomID,
//                 "side":side,
//                 "state": state
//             })
//         );
//     }
//     function createRoom(roomCreatorColor: t.Color){
//         roomID = uuid_generator();
//         let options: RequestInit ={
//             method: 'POST',
//             mode: 'cors',
//             cache: 'no-cache',
//             credentials: 'same-origin',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             redirect: 'follow',
//             referrerPolicy: 'no-referrer',
//             body: JSON.stringify({
//                 type:"create_room",
//                 roomID,
//             })
//         }
//
//         fetch("http://"+host+"create_room",options).then((res)=>{
//             if(!res.ok)throw new Error("Connection error"+res.statusText);
//             res.json().then((message)=>{
//
//                 if(message.type === "room_created"){
//                     joinRoom(message.roomID,roomCreatorColor);
//                 }
//             });
//         });
//         form.destroy();
//         waitingScreen.render(root,"http://"+host+"room/"+roomID);
//
//     }
//     function joinRoom(join_roomID: string, side:t.Color|"any" = "any"){
//         roomID = join_roomID;
//         if(location.pathname === "/") history.replaceState(null, "Room", "room/"+roomID);
//         socket.send(JSON.stringify({
//                 "type":"join_room",
//                 "roomID": join_roomID,
//                 "side":side,
//             })
//         );
//     }
//     return{
//         renderForm: ()=>{
//             form.button.addEventListener("click", onCreateRoom);
//             form.render(root);
//         },
//         joinRoom: joinRoom,
//     }
// }