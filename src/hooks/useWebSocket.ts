import { useEffect, useMemo, useRef, useState } from "react";
import {Options, connect} from "../utils/connection";



export type WebScoketObject = ReturnType<typeof useWebSocket>;



export function useWebSocket<IncomingMessage extends object, OutgoingMessage extends object>
(
    url: string,
    messageHandler: (message: IncomingMessage)=>void,
    options?: Options
){
    const messageHandlerRef = useRef(messageHandler);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    function onOpen(event: Event) {
        options && options.onOpen && options.onOpen(event);
        setIsOpen(true);
    }

    function onClose(event: CloseEvent) {
        options && options.onClose && options.onClose(event);
        setIsOpen(false)
    }
    //TODO think
    const connection =  useRef<ReturnType<typeof connect>>(
        connect<IncomingMessage, OutgoingMessage>(
            url, 
            messageHandlerRef.current, 
            {...options, onOpen, onClose}),
    );

    return{
        isOpen,
        ...connection.current,
    }

}