import React, {useEffect, useRef, useState} from "react";
import "./Adaptive.scss";


const Adaptive = (props:{children: React.ReactNode}) => {
    let ref = useRef() as React.MutableRefObject<HTMLDivElement>;

    let [adaptiveSize, setSize] = useState(getLeastMeasurement());


    function getLeastMeasurement(){
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        return windowWidth > windowHeight ? windowHeight - 15 : windowWidth - 15;
    }
    const getBoardSize = () => {
        if(ref === undefined) return;
        if(ref.current === undefined) return;
        let newSize = getLeastMeasurement();

        setSize(newSize);

    }

    useEffect(() => {
        getBoardSize();
        window.addEventListener("resize",getBoardSize);
    });



    return(
        <div ref = {ref} style = {{width:`${adaptiveSize}px`, height:`${adaptiveSize}px`}}>
            {props.children}
        </div>
    );
};
export default Adaptive;