import { RefObject, useEffect, useRef } from 'react'

type WebSocketEventHandler<K extends keyof WebSocketEventMap> = (
  event: WebSocketEventMap[K],
) => void;

function useWebSocketListener<K extends keyof WebSocketEventMap>(
  eventName: K,
  handler: WebSocketEventHandler<K> = (event)=>{},
  element: RefObject<WebSocket>,
  options?: boolean | AddEventListenerOptions,
) {
  
    const savedHandler = useRef(handler)

    useEffect(() => {
        savedHandler.current = handler
    }, [handler])

    useEffect(() => {
        const targetElement: WebSocket|undefined|null = element?.current
        if (!(targetElement && targetElement.addEventListener)) {
        return
        }

    const eventListener: typeof handler = event => savedHandler.current(event)

    targetElement.addEventListener(eventName, eventListener, options)

    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element, options])
}

export default useWebSocketListener
