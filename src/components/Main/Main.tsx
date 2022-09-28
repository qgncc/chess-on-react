import { MouseEvent } from "react";
import "./Main.scss"
import { Props } from "../../types";

interface MainProps extends Props{

}

export function Main({className, children}: Props) {
    
    const classNameStr = className?className:""

    

    return(
        <main className={"main "+classNameStr}>
            {children}
        </main>
    )
}