import { MouseEvent } from "react"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../../redux/features/authSlice"
import { RootState } from "../../redux/store"
import { Props } from "../../types"
import { ReactComponent as LogoutIcon } from "../../icons/i_logout.svg"
import "./Sidebar.scss"

interface SidebarProps extends Props{
    
}

export function Sidebar({className}:SidebarProps) {
    const [isLoggedIn, loginText] = useSelector<RootState, [boolean,string|null]>(
        (state)=>[state.auth.isLoggedIn, state.auth.login]
    )
    const dispatch = useDispatch()
    function onClick(event: MouseEvent<HTMLButtonElement>){
        dispatch(logout())
    }
    
    const classNameStr = className?className:""
    

    return(
        <nav className={"sidebar "+classNameStr}>
            {
                isLoggedIn?
                <div className="sidebar__userControls">
                    <span className="sidebar__login">{loginText}</span>
                    <button onClick={onClick} className="button button--small button--round">
                        <LogoutIcon className="icon icon--small"/>
                    </button>
                </div>:null
            }
        </nav>
    )
}