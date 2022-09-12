interface WebSocketWrapperOptions{
    onOpen?: (event: WebSocketEventMap["open"])=>void,
    onClose?: (event: WebSocketEventMap["close"])=>void,
    onError?: (event: WebSocketEventMap["error"])=>void,
    protocols?: string| string[]
}

export interface Options extends WebSocketWrapperOptions{
    shouldReconnect?: true,
    exponentialBackOff?: true,
    maxReconnectionAttemps?: number;
    reconnectDelay?: number,
    minReconnectDelay?: number,
    maxReconnectDelay?: number,
    timeFactor?: number,
}


declare global {
    interface Window{
        webSocketConnectionObject: ReturnType<typeof createConnectionManager>
    }
}

type Connection = ReturnType<typeof createConnection>


function lookForManager<IncomingMessage, OutgoingMessage>(
    url: string, 
    messageHandler: (message:IncomingMessage)=>void,
    options?: Options 
){
    if(window.webSocketConnectionObject === undefined){
        window.webSocketConnectionObject = createConnectionManager()
    }
    return window.webSocketConnectionObject.open<IncomingMessage, OutgoingMessage>(url, messageHandler, options);
}


function createConnectionManager(){
    
    const connections: {[url: string]: Connection} = {}
    function open<IncomingMessage, OutgoingMessage>(
        url: string, 
        messageHandler: (message:IncomingMessage)=>void,
        options?: Options    
    ){

        if(url in connections){ 
            return connections[url];
        }
        else{
            //TODO fix 
            //@ts-ignore
            connections[url] = createConnection<IncomingMessage, OutgoingMessage>(url, messageHandler, options);
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


function createConnection<IncomingMessage, OutgoingMessage>(
    url: string, 
    messageHandler:(e: IncomingMessage)=>void, 
    options?: Options
){
    //TODO fix reconnection, false for now
    const shouldReconnect =  options?.shouldReconnect || false;
    const exponentialBackOff = options?.exponentialBackOff || false;
    const reconnectDelay = options?.reconnectDelay || 1000;
    const maxReconnectionAttemps =  options?.maxReconnectionAttemps || Infinity;
    const minReconnectDelay =  options?.minReconnectDelay || 1;
    const maxReconnectDelay = options?.maxReconnectDelay || Infinity;
    const timeFactor = options?.timeFactor || 1.5;
    const onOpenCallback = options?.onOpen;
    const onCloseCallback = options?.onClose;
    const onErrorCallback = options?.onError;

    let ws = new WebSocket(url, options?.protocols);
    addEventListeners();

    let currentReconnectionTry: number = 1;

    const messageQ: string[] = []
    function onOpen(e: Event) {
        console.log("ws open")
        currentReconnectionTry = 1;
        let message = messageQ.shift()
        while(message){
            console.log(message)
            sendMessage(message);
            message = messageQ.shift()
        }
        onOpenCallback && onOpenCallback(e)
    }
    function onClose(e: CloseEvent){
        console.log("ws close")
        onCloseCallback && onCloseCallback(e)
        options?.onClose && options.onClose(e);
    }
    function onError(e: Event){
        console.log("ws error")
        onErrorCallback && onErrorCallback(e)
        tryReconnect();
    }
    function onMessage(event: MessageEvent) {
        const message: IncomingMessage = JSON.parse(event.data);
        messageHandler(message);
    }

    function addEventListeners(){
        ws.addEventListener("open", onOpen);
        ws.addEventListener("close", onClose);
        ws.addEventListener("error", onError);
        ws.addEventListener("message", onMessage);
    }

    

    function reconnect(){
        if(currentReconnectionTry>maxReconnectionAttemps) return;
        if(ws.readyState === WebSocket.OPEN) return;
        // if(ws.readyState === WebSocket.CONNECTING) return;
        currentReconnectionTry++;
        ws = new WebSocket(url, options?.protocols);
        addEventListeners();
    }


    function tryReconnect(){
        if(!shouldReconnect) return;
        let delay =
            exponentialBackOff?
                Math.min(
                    minReconnectDelay+Math.random()+timeFactor*currentReconnectionTry,
                    maxReconnectDelay*(Math.random()+0.1)
                )
                :
                reconnectDelay
        setTimeout(reconnect, delay)
    }
    
    function sendMessage(message: string) {
        if(ws.readyState !== WebSocket.OPEN){
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
        sendMessage,
        sendMessageJSON,
        close,
        ws
    }
}

export {
    lookForManager as connect
}