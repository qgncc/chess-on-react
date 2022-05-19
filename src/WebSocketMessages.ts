import {Color, NumericMove} from "./types";

//Client events

export interface GameEvent<T extends string>{
    type:T;
    roomID:string,
    side:Color,
}
export interface ErrorMessage{
    type:"error",
    message:string
}
export interface MoveEvent extends GameEvent<"move">{
    move: NumericMove
}
export interface GameStartedEvent extends GameEvent<"game_started">{

}
export interface RoomJoinedEvent extends GameEvent<"room_joined">{

}
export interface RoomCreatedEvent extends Omit<GameEvent<"room_created">,"side">{

}



//Server events
export interface CreateRoomEvent extends GameEvent<"create_room">{

}
export interface JoinRoomEvent extends Omit<GameEvent<"join_room">, "side">{
    side: Color|"any";
}

