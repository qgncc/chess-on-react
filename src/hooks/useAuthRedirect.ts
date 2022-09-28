import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";

export default function useAuthRedirect() {
    const isLoggedIn = useSelector<RootState, boolean>(state=>state.auth.isLoggedIn)
    
    const location = useLocation()
    const navigate = useNavigate()
    
    useEffect(()=>{
        if(!isLoggedIn){
            navigate("/?redirect="+location.pathname);  
        }
    }, [isLoggedIn, navigate])
}