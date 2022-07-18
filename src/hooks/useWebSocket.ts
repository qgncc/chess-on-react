import { useWebSocketWrapper } from "./useWebSocketWrapper";
import type { useWebSocketWrapperOptions } from "./useWebSocketWrapper";

interface Options extends useWebSocketWrapperOptions{
    shouldReconnect?: true,
    exponentialBackOff?: true,
    maxReconnectionAttemps?: number;
    reconnectTime?: number,
    minReconnectDelay: number,
    maxReconnectDelay?: number,
    timeFactor?: number,
}

export function useWebSocket<IncomingMessage, OutgoingMessage>
(
    url: string,
    messageHandler: (message: IncomingMessage)=>void,
    options?: Options
){
    const shouldReconnect = options?.shouldReconnect || false;
    const exponentialBackOff = options?.exponentialBackOff || false;
    const reconnectTime = options?.reconnectTime || 0;
    const maxReconnectionAttemps =  options?.maxReconnectionAttemps || 10;
    const minReconnectDelay =  options?.minReconnectDelay || 0;
    const maxReconnectDelay = options?.maxReconnectDelay || Infinity;
    const timeFactor = options?.timeFactor || 1.5;
    const protocols = options?.protocols;


    function onOpen(e: Event) {
        options?.onOpen && options.onOpen(e)
    }
    function onClose(e: CloseEvent){
        options?.onClose && options.onClose(e);
        if(!shouldReconnect) return;
        if(exponentialBackOff){
            reconnectWithBackOff(1);
        }else{
            reconnect();
        }
    }
    function onError(e: Event){
        options?.onError && options.onError(e);
    }
    function reconnect(){
        if(ws.readyState === WebSocket.OPEN) return;
        if(ws.readyState !== WebSocket.CONNECTING) setTimeout(()=>reconnect(), reconnectTime);
        ws.reconnect();
    }
    function reconnectWithBackOff(tryNumber: number){
        if(ws.readyState === WebSocket.OPEN) return;
        if(ws.readyState === WebSocket.CONNECTING){
            setTimeout(()=>reconnectWithBackOff(tryNumber), 1000)
        }
        ws.reconnect();
        let delay = Math.min(
            minReconnectDelay+((Math.random()+0.1)*timeFactor*tryNumber),
            maxReconnectDelay*(Math.random()+0.1)
        );
        setTimeout(()=>reconnectWithBackOff(tryNumber+1), delay)
    }
    function sendMessage(message: string) {
        ws.sendMessage(message);
    }
    function sendMessageJSON(message: object){
        ws.sendMessage(JSON.stringify(message))
    }
    function close() {
        ws.close();
    }

    const ws = useWebSocketWrapper(url, messageHandler, {onClose, onOpen, onError, protocols});

    return{
        get readyState(){
            return ws.readyState
        },
        reconnect,
        reconnectWithBackOff,
        sendMessage,
        sendMessageJSON,
        close,
    }
}