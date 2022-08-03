import "./App.scss";
import {CreateRoomScreen} from "./CreateRoomScreen/CreateRoomScreen";
import {
    Routes,
    Route, useNavigate,
} from "react-router-dom";
import {Lobby} from "./Lobby/Lobby";
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
