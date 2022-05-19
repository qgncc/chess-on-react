import React, {Dispatch, Reducer, useEffect, useReducer, useState} from 'react';
import "./App.scss";
import {CreateRoomScreen} from "./CreateRoomScreen/CreateRoomScreen";
import {
    Routes,
    Route, useNavigate, Params,
} from "react-router-dom";
import {connect} from "./connection/connection";
import {Action, GameState} from "./types";
import {GameStartedEvent, MoveEvent, RoomCreatedEvent, RoomJoinedEvent} from "./WebSocketMessages";
import {Lobby} from "./Lobby/Lobby";



const host = "ws://chess.qgncc.com/ws";
const connection = connect(host);
//TODO Вынести редюсер в отделльный файл, а то что это такое.
let reducer: Reducer<GameState,Action> = function(state, action){

    switch (action.type) {
        case "create_room":
            state.roomID = action.roomID;
            if(action.checked === "any"){
                state.side = Math.random()>0.5?"w":"b";
            }else{
                state.side = action.checked;
            }
            connection.createRoom(action.roomID);
            return Object.assign({},state);
        case "join_room":
            connection.joinRoom(action.roomID, action.side);
            return Object.assign({},state);
        case "start_game":
            state.isGameStarted = true;
            return Object.assign({},state);
        case "change_connection_state":
            state.isConnectionOpen = action.value;
            return Object.assign({},state);
        case "set_info":
            state.side = action.side;
            state.roomID = action.roomID;
            return Object.assign({},state);
        case "move":
            connection.sendMove(action.move, state.roomID!, state.side!);
            return Object.assign({},state);
        case "game_over":
            connection.declareEndOfGame(1,state.roomID!,state.side!);
            return Object.assign({},state);
        case "rematch_request":
            connection.sendRematchReq(state.roomID!,state.side!);
            return Object.assign({},state);
        case "rematch":
            state.side = action.side;
            return Object.assign({},state);
    }
}


function App() {
    const navigate = useNavigate();
    let [state, dispatch] = useReducer(reducer,{
        roomID: undefined,
        side: undefined,
        isGameStarted: false,
        isConnectionOpen:false,
    });
    useEffect(()=>{
        console.count('raz');
        connection.onConnection(function (event: Event){
            console.log("connection");
            dispatch({type: "change_connection_state", value: true});
        });
        connection.onClose(function (event: Event){
            console.log("close");
            dispatch({type: "change_connection_state", value: false});
        });
        connection.onRoomCreated(function (event: RoomCreatedEvent){
            navigate("/"+(event.roomID));
        });
        connection.onRoomJoined(function (event: RoomJoinedEvent){
            dispatch({type:"set_info", roomID:event.roomID, side: event.side});
        });
        connection.onGameStart((event: GameStartedEvent) => dispatch({type: "start_game"}));

    },[]);
    return (
        <div className = "wrapper">
                <Routes>
                    <Route path={":roomID"}
                           element={
                            <Lobby
                               GameObject={{state,dispatch,connection}}
                            />}
                    />
                    <Route path={"/"}
                           element={
                            <CreateRoomScreen
                                GameObject={{state,dispatch,connection}}
                            />}
                    />
                </Routes>
        </div>
    );
}

export default App;
