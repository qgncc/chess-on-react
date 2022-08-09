import { CommonConnectionOptions } from "tls";

interface WebSocketWrapperOptions{
    onOpen?: (event: WebSocketEventMap["open"])=>void,
    onClose?: (event: WebSocketEventMap["close"])=>void,
    onError?: (event: WebSocketEventMap["error"])=>void,
    protocols?: string| string[]
}

interface Options extends WebSocketWrapperOptions{
    shouldReconnect?: true,
    exponentialBackOff?: true,
    maxReconnectionAttemps?: number;
    reconnectTime?: number,
    minReconnectDelay?: number,
    maxReconnectDelay?: number,
    timeFactor?: number,
}

type Connection = ReturnType<typeof createConnection>

declare global {
    interface Window{
        webSocketConnectionObject: ReturnType<typeof createConnectionManager>
    }
}


function lookForManager<IncomingMessage extends object, OutgoingMessage extends object>(
    url: string, 
    messageHandler: (message:IncomingMessage)=>void,
    options?: Options 
){
    if(window.webSocketConnectionObject === undefined){
        window.webSocketConnectionObject = createConnectionManager()
    }
    window.webSocketConnectionObject.open(url, messageHandler, options);

    
}


function createConnectionManager(){

    const connections: {[url: string]: Connection} = {}
    function open<IncomingMessage extends object, OutgoingMessage extends object>(
        url: string, 
        messageHandler: (message:IncomingMessage)=>void,
        options?: Options    
    ){
        if(url in connections){ 
            return connections[url];
        }
        else{
            connections[url] = createConnection(url, messageHandler, options);
            return connections[url];
        }
    }
    function close() {
        
    }
    return{
        get connetions(){ return connections },
        open,
        close
    }
}


function createConnection<IncomingMessage extends object, OutgoingMessage extends object>(
    url: string, 
    messageHandler:(e: IncomingMessage)=>void, 
    options?: Options
){
    const shouldReconnect = options?.shouldReconnect || false;
    const exponentialBackOff = options?.exponentialBackOff || false;
    const reconnectTime = options?.reconnectTime || 0;
    const maxReconnectionAttemps =  options?.maxReconnectionAttemps || 10;
    const minReconnectDelay =  options?.minReconnectDelay || 0;
    const maxReconnectDelay = options?.maxReconnectDelay || Infinity;
    const timeFactor = options?.timeFactor || 1.5;
    const onOpenCallback = options?.onOpen;
    const onCloseCallback = options?.onClose;
    const onErrorCallback = options?.onError;

    let ws = new WebSocket(url, options?.protocols);

    const messageQ: string[] = []
    function onOpen(e: Event) {
        let message = messageQ.shift()
        while(message){
            sendMessage(message);
            message = messageQ.shift()
        }
        onOpenCallback && onOpenCallback(e)
    }
    function onClose(e: CloseEvent){
        onCloseCallback && onCloseCallback(e)
        options?.onClose && options.onClose(e);
        if(!shouldReconnect) return;
        if(exponentialBackOff){
            reconnectWithBackOff();
        }else{
            reconnect();
        }
    }
    function onError(e: Event){
        onErrorCallback && onErrorCallback(e)
    }
    function onMessage(event: MessageEvent) {
        const message: IncomingMessage = JSON.parse(event.data);
        messageHandler(message);
    }

    ws.addEventListener("open", onOpen);
    ws.addEventListener("close", onClose);
    ws.addEventListener("error", onError);
    ws.addEventListener("message", onMessage)

    function reconnect(tryNumber: number = 1){
        if(tryNumber>maxReconnectionAttemps) throw new Error("Couldn reconnect to the socket after "+tryNumber+" attemps");
        if(ws.readyState === WebSocket.OPEN) return;
        if(ws.readyState !== WebSocket.CONNECTING) setTimeout(()=>reconnect(tryNumber), reconnectTime)
        else ws = new WebSocket(url, options?.protocols);
        setTimeout(()=>reconnect(tryNumber), reconnectTime);
    }
    function reconnectWithBackOff(tryNumber: number = 1){
        if(ws.readyState === WebSocket.OPEN) return;
        if(ws.readyState === WebSocket.CONNECTING){
            setTimeout(()=>reconnectWithBackOff(tryNumber), 1000)
        }
        ws = new WebSocket(url, options?.protocols);
        let delay = Math.min(
            minReconnectDelay+((Math.random()+0.1)*timeFactor*tryNumber),
            maxReconnectDelay*(Math.random()+0.1)
        );
        setTimeout(()=>reconnectWithBackOff(tryNumber+1), delay)
    }
    function sendMessage(message: string) {
        if(ws.readyState !== WebSocket.OPEN){
            console.log("here")
            messageQ.push(message);
        }else{
            ws.send(message);
        }
    }
    function sendMessageJSON(message: OutgoingMessage){
        sendMessage(JSON.stringify(message))
    }
    function close() {
        ws.close();
    }


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

export {
    lookForManager as connect
}