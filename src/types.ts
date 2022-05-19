import ChessEngine from "chess.js"
import {Dispatch, ReactChild} from "react";
import {NavigateFunction} from "react-router-dom";
import {ConnectionController} from "./connection/connection";

const chessNumbers = [1,2,3,4,5,6,7,8] as const
const chessLetters = ['a','b','c','d','e','f','g','h'] as const
const algebraicNotation = [
    "a1","a2","a3","a4","a5","a6","a7","a8",
    "b1","b2","b3","b4","b5","b6","b7","b8",
    "c1","c2","c3","c4","c5","c6","c7","c8",
    "d1","d2","d3","d4","d5","d6","d7","d8",
    "e1","e2","e3","e4","e5","e6","e7","e8",
    "f1","f2","f3","f4","f5","f6","f7","f8",
    "g1","g2","g3","g4","g5","g6","g7","g8",
    "h1","h2","h3","h4","h5","h6","h7","h8"
] as const

const numericNotation = [
    11,12,13,14,15,16,17,18,
    21,22,23,24,25,26,27,28,
    31,32,33,34,35,36,37,38,
    41,42,43,44,45,46,47,48,
    51,52,53,54,55,56,57,58,
    61,62,63,64,65,66,67,68,
    71,72,73,74,75,76,77,78,
    81,82,83,84,85,86,87,88
] as const





export type Color = 'w'|'b';
export type PieceType = 'r'|'n'|'b'|'q'|'k'|'p';
export type ChessNumbers = typeof chessNumbers[number]
export type ChessLetters = 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h';
export type AlgebraicNotation = typeof algebraicNotation[number];
export type NumericNotation = typeof numericNotation[number];
export type Index = 0|1|2|3|4|5|6|7;
export type PieceClassName = 'br'|'bn'|'bb'|'bq'|'bk'|'bp'|'wr'|'wn'|'wb'|'wq'|'wk'|'wp';
// export interface WhiteImgObj{p: "wp"; q: "wq"; r: "wr"; b: "wb"; k: "wk"; n: "wn" }
// export interface BlackImgObj{p: "bp"; q: "bq"; r: "br"; b: "bb"; k: "bk"; n: "bn" }

export interface Square{
    file: ChessNumbers,
    rank: ChessNumbers
}

export interface Indexes{
    x: Index,
    y: Index
}

export interface Coords{
    x: number;
    y: number;
}


export interface NumericMove {
    from: Square,
    to: Square,
    promotion?: PieceType,
}
export interface AlgebraicMove extends ChessEngine.Move{
}

export interface Rooks{
    w:{q:Square,k:Square},
    b:{q:Square,k:Square}
}
// PROPS INTERFACES

export interface Props {
    children?: ReactChild|ReactChild[],
    className?: string
}
//Game state
export interface GameState {
    roomID:string|undefined,
    side: Color|undefined,
    isGameStarted: boolean,
    isConnectionOpen:boolean,
}
export type Action = {type:"create_room", roomID: string, checked: Color|"any"}
    |{type:"join_room",roomID:string, side: Color|"any"}
    |{type:"start_game"}
    |{type:"change_connection_state", value: boolean}
    |{type:"set_info", side: Color, roomID:string}
    |{type:"move", move: NumericMove}
    |{type:"game_over", reason: string}
    |{type:"rematch_request"}
    |{type:"rematch", side: Color};

export type GameObject = {state:GameState, dispatch: Dispatch<Action>, connection: ConnectionController}