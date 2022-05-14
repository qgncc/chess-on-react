import React, {useState} from 'react';
import ChessBoard from "./ChessBoard/ChessBoard";
import "./App.scss";
import {CreateRoomScreen} from "./CreateRoomScreen/CreateRoomScreen";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    useParams
} from "react-router-dom";
import {createConnectionController} from "./connection/connection";



// const host = "chess.qgncc.com/";
// const ws = new WebSocket(host);
// const controller = createConnectionController(ws);


function App() {

    return (
        <div className = "wrapper">

        <Routes>
            <Route path={":gameID"}
                   element={<ChessBoard
                       color = "w"
                       flipped = {false}
                       // connection={controller}
                   />}
            />
            <Route path={"/"}
                   element={<CreateRoomScreen
                       // connection={controller}
                   />}
            />
        </Routes>

      </div>
    );
}

export default App;
