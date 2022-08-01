import { useReducer, useRef, useEffect } from "react";
import type { Reducer} from "react";
import useWebSocketListener from "./useWebSocketListener";
export interface useWebSocketWrapperOptions{
    onOpen?: (event: WebSocketEventMap["open"])=>void,
    onClose?: (event: WebSocketEventMap["close"])=>void,
    onError?: (event: WebSocketEventMap["error"])=>void,
    protocols?: string| string[]
} 

export function useWebSocketWrapper<IncomingMessage, OutgoingMessage extends string>(
    url:string, 
    messageHandler: (message: IncomingMessage)=>void,
    options?: useWebSocketWrapperOptions
)
{  
    //------------OPTIONS------------
    const onOpen = options?.onOpen;
    const onClose = options?.onClose;
    const onError = options?.onError;
    //-------------------------------

    const ws = useRef(new WebSocket(url));
    
    function onMessage(event: MessageEvent) {
        console.log(event);
        messageHandler(JSON.parse(event.data))
    }
    function sendMessage(message: OutgoingMessage){
        ws.current.send(message);
    }
    function close(){
        ws.current.close();
    }
    function reconnect() {
        ws.current = new WebSocket(url);
    }
    useWebSocketListener("close", onClose, ws);
    useWebSocketListener("open", onOpen, ws);
    useWebSocketListener("error", onError, ws);
    useWebSocketListener("message", onMessage, ws);
    return{
        get readyState(){
            return ws.current.readyState
        },
        sendMessage,
        close,
        reconnect
    }
}