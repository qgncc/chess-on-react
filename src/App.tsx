import "./App.scss";
import {CreateRoomScreen} from "./pages/CreateRoomScreen/CreateRoomScreen";
import {
    Routes,
    Route, useNavigate,
} from "react-router-dom";
import {Lobby} from "./pages/Lobby/Lobby";
import AuthScreen from "./pages/AuthScreen";
import { RootState } from "./redux/store";
import { useSelector } from "react-redux";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Registration from "./pages/Registration";



const host = process.env.NODE_ENV === "development"?"ws://localhost:8081/ws":"wss://chess.qgncc.com/ws";

function App() {
    const isLoggedIn = useSelector<RootState, boolean>((state)=>state.auth.isLoggedIn)


    return (
        <div className = "wrapper">
                <Sidebar/>
                <Main>
                    <Routes>
                        <Route path={"/"}
                            element={
                                <AuthScreen/>}
                        />
                        <Route path={"/registration"}
                            element={
                                <Registration/>}
                        />
                        <Route path={"/play"}
                            element={
                                <CreateRoomScreen/>}
                        />
                        <Route path={":roomID"}
                            element={
                                <Lobby/>}
                        />
                    </Routes>
                </Main>
               
        </div>
    );
}

export default App;
