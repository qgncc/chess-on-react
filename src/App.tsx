import React, { Reducer, useState, useRef, useEffect, useReducer} from 'react';
import "./App.scss";
import {CreateRoomScreen} from "./CreateRoomScreen/CreateRoomScreen";
import {
    Routes,
    Route, useNavigate,
} from "react-router-dom";
import {connect} from "./connection/connection";
import {GameStartedEvent, RoomCreatedEvent, RoomJoinedEvent} from "./WebSocketMessages";
import {Lobby} from "./Lobby/Lobby";
import ChessBoard, { DropEvent } from './ChessBoard/ChessBoard';
const Chess = require("chess.js");



const host = process.env.NODE_ENV === "development"?"ws://localhost:8081/ws":"wss://chess.qgncc.com/ws";
const chess = Chess();

function App() {
    const navigate = useNavigate();
    
    return (
        <div className = "wrapper">
                <Routes>
                    <Route path={":roomID"}
                           element={
                            <Lobby/>}
                    />
                    <Route path={"/"}
                           element={
                            <CreateRoomScreen
                            />}
                    />
                </Routes>
               
        </div>
    );
}

export default App;
