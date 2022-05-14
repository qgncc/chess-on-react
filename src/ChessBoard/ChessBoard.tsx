import Piece from "../Piece/Piece";
import "./ChessBoard.scss";
import React, {MouseEvent, useRef, useState} from "react";
import {
    AlgebraicMove,
    AlgebraicNotation,
    ChessNumbers,
    Color,
    Coords,
    Indexes,
    NumericMove,
    PieceType,
    Square
} from "../types";
import ChessTypes from 'chess.js';
import {PromotionWindow} from "../PromotionWindow/PromotionWindow";
import ChessEngineTypes from "chess.js";
import {useParams} from "react-router";
import Adaptive from "../Adaptive/Adaptive";
import {WaitingScreen} from "../WaitngScreen/WaitingScreen";
import {connectionController} from "../connection/connection";
const Chess = require('chess.js');


interface ChessBoardProps{
    color: Color,
    flipped: boolean,
    // connection: connectionController
}
const ChessEngine = Chess();
let promotionMove: NumericMove;

let ChessBoard = function (props: ChessBoardProps) {
    let flipped = props.flipped;
    let [position, setPosition] = useState(ChessEngine.board());
    let [isFlipped, setFlippedFlag] = useState(flipped);
    let [promotionWindowSetup, setPromotionWindowSetup] = useState({isOpen: false, file: 0});
    let pieceSizeInPercent = 0.125;
    let ref = useRef() as React.MutableRefObject<HTMLDivElement>;
    let pieces: JSX.Element[] = [];
    let selectedPiece: {square:Square, piece: ChessTypes.Piece}|null;
    let playerSide: Color = props.color;
    let {gameID} = useParams();
    let [isConnected, setIsConnected] = useState(false);
    console.log(gameID);
    function handlePointerUp(event: MouseEvent<HTMLDivElement>) {
        let globalCoords = {x: event.clientX, y: event.clientY};
        let boardCoords = getBoardCoordsFromGlobal(globalCoords);
        let clickedSquare = getSquareByBoardCoords(boardCoords);
        if(selectedPiece){
            let move:NumericMove = createMove(selectedPiece.square, clickedSquare);
            makeMove(move);
        }
    }

    function handlePointerDown(event: MouseEvent<HTMLDivElement>){
        let globalCoords = {x: event.clientX, y: event.clientY};
        let boardCoords = getBoardCoordsFromGlobal(globalCoords);
        let clickedSquare = getSquareByBoardCoords(boardCoords);
        if(promotionWindowSetup.isOpen
            && !(event.target as HTMLDivElement).classList.contains("promotion-piece"))
        {
            console.log("here");
            setPromotionWindowSetup({isOpen: false, file: 0});
        }
        if(hasFigureOnSquare(clickedSquare)){
            let pieceHTML = event.target === event.currentTarget? null:event.target;
            if(!selectedPiece){
                grabPieceAtCoords(pieceHTML as HTMLDivElement|null, boardCoords);
            }else{
                let move:NumericMove = createMove(selectedPiece.square, clickedSquare);
                let result = makeMove(move);
                console.log(result);
                if(!result) grabPieceAtCoords(pieceHTML as HTMLDivElement|null, boardCoords);
            }
        }else{
            if(selectedPiece){
                let move:NumericMove = createMove(selectedPiece.square, clickedSquare);
                makeMove(move);
            }
        }


    }
    function makeMove(move: NumericMove) {
        // if(playerSide !== ChessEngine.turn()) return null;
        if(isPromotion(move)){
            promotionMove = move;
            openPromotionWindow(move.to.file);
            return;
        }
        let result = ChessEngine.move(moveToAlgebraic(move));
        if (result) setPosition(ChessEngine.board());
        console.log(ChessEngine.ascii())
        return result;
    }
    function hasFigureOnSquare(square:Square):boolean{
        return !!ChessEngine.get(toAlgebraic(square));
    }
    function isPromotion(move: NumericMove){
        let isPromotion = false;
        ChessEngine.moves({square:toAlgebraic(move.from), verbose:true})
            .forEach((elem: ChessEngineTypes.Move)=>{
                if(elem.to === toAlgebraic(move.to) && elem.hasOwnProperty("promotion") ){
                    isPromotion = true;
                }
            });
        return isPromotion;
    }

    function toNumeric(i: AlgebraicNotation): Square {
        return {file: (i.charCodeAt(0) - 96), rank: (parseInt(i.charAt(1)))} as Square;
    }

    function toAlgebraic(i: Square): AlgebraicNotation {
        return ("abcdefgh".slice(i.file - 1, i.file) + i.rank.toString()) as AlgebraicNotation;
    }

    function createMove(from: Square, to:Square, promotion?: PieceType):NumericMove {
        return promotion? {from, to, promotion} as NumericMove:{from,to} as NumericMove;
    }
    function openPromotionWindow(file:ChessNumbers) {
        setPromotionWindowSetup({isOpen: true, file:file-1})
    }
    function moveToAlgebraic(move:NumericMove):AlgebraicMove {
        return move.promotion?
                {
                    from:toAlgebraic(move.from),
                    to:toAlgebraic(move.to),
                    promotion:move.promotion
                } as AlgebraicMove
            :
                {
                    from:toAlgebraic(move.from),
                    to:toAlgebraic(move.to)
                } as AlgebraicMove;
    }
    function moveToNumeric(move:AlgebraicMove):NumericMove {
        return move.promotion?
                {
                    from:toNumeric(move.from),
                    to:toNumeric(move.to),
                    promotion:move.promotion
                } as NumericMove
            :
                {
                    from:toNumeric(move.from),
                    to:toNumeric(move.to)
                } as NumericMove;
    }
    function getSquareByBoardCoords(clickCoords: Coords) {
        let boardWidth = ref.current.offsetWidth;
        let boardHeight = ref.current.offsetHeight;


        let col = isFlipped?8 - (Math.floor((clickCoords.x / boardWidth) / pieceSizeInPercent)) :
            (Math.floor((clickCoords.x / boardWidth) / pieceSizeInPercent)) + 1;

        let row = isFlipped?(Math.floor((clickCoords.y / boardHeight) / pieceSizeInPercent)+1) :
            8 - (Math.floor((clickCoords.y / boardHeight) / pieceSizeInPercent));

        return {file: col, rank: row} as Square;
    }
    function getPieceBySquare(square: Square) {
        return ChessEngine.get(toAlgebraic(square));
    }
    function grabPieceAtCoords(pieceHTML: HTMLDivElement|null, coords: Coords) {
        let square = getSquareByBoardCoords(coords);
        let piece = getPieceBySquare(square);
        if(!piece) throw new Error(`No piece at square ${square}`);

        selectedPiece = {square, piece}
        pieceHTML &&  setPieceHTMLPosInBoardCoords(pieceHTML, coords);
        function onDrag(event: MouseEventInit) {
            let globalCoords: Coords = {x:event.clientX!, y:event.clientY!};
            let coords = getBoardCoordsFromGlobal(globalCoords);
            pieceHTML && drag(pieceHTML, coords);
        }
        function stopDrag() {
            document.removeEventListener("pointermove",onDrag);
            pieceHTML && pieceHTML.style && (pieceHTML.style.transform = "");
        }
        document.addEventListener("pointermove", onDrag);
        document.addEventListener("pointerup",
                                       stopDrag,
                                {once:true}
                                 );
    }
    function drag(pieceHTML: HTMLDivElement, coords: Coords) {
        setPieceHTMLPosInBoardCoords(pieceHTML, coords);
    }
    function setPieceHTMLPosInBoardCoords(pieceHTML: HTMLDivElement, coords: Coords) {
        let boardWidth = ref.current.offsetWidth;
        let boardHeight = ref.current.offsetHeight;
        let transformXPercents;
        let transformYPercents;
        if(coords.x < 0){
            transformXPercents = -50;
        }else if (coords.x > boardWidth){
            transformXPercents = 100*(1/pieceSizeInPercent)-50;
        }else {
            transformXPercents = 100 * (((coords.x / boardWidth) / pieceSizeInPercent) - 0.5);
        }
        if(coords.y < 0){
            transformYPercents = -50;
        }else if (coords.y > boardHeight){
            transformYPercents = 100*(1/pieceSizeInPercent)-50;
        }else {
            transformYPercents = 100 * (((coords.y / boardHeight) / pieceSizeInPercent) - 0.5);
        }
        pieceHTML.style.transform = `translate(${transformXPercents}%,${transformYPercents}%)`
    }
    function getBoardCoordsFromGlobal(coords:Coords){
        let rect = ref.current.getBoundingClientRect();
        let x = coords.x - rect.x;
        let y = coords.y - rect.y;
        return {x,y} as Coords;
    }
    function translateMatrixIndexesToSquare({x, y}: Indexes): Square {
        return isFlipped?{file: 8 -x , rank: y + 1} as Square:{file: x + 1, rank: 8 - y} as Square;

    }
    function calculatePromotionWindowPosition() {
        if((!isFlipped && playerSide === "w") || (isFlipped && playerSide === "b")){
            return "top"
        }else{
            return "bottom"
        }
    }
    function promotion(event: MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
        let type = (event.target as HTMLDivElement).className.match(/[wb](?<type>[qrnb])/);
        if(!type) return;
        setPromotionWindowSetup({isOpen: false, file: 0});
        promotionMove.promotion = type[1] as PieceType;
        ChessEngine.move(moveToAlgebraic(promotionMove));
        setPosition(ChessEngine.board());
        console.log(ChessEngine.ascii())

    }




    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let pieceObj = position[i][j];
            let square = translateMatrixIndexesToSquare({x:j,y:i} as Indexes);
            const piece = pieceObj?
                <Piece key = {10*i + j} color={pieceObj.color} type={pieceObj.type} square={square}/>:
                null;
            piece && pieces.push(piece);
        }
    }
    return(
        <>
            {isConnected?
            <Adaptive>
                <div ref = {ref} onPointerUp={handlePointerUp} onPointerDown={handlePointerDown} className = "chessboard">
                    {promotionWindowSetup.isOpen ?
                        (<PromotionWindow position={calculatePromotionWindowPosition()}
                                          color={playerSide}
                                          file={promotionWindowSetup.file as ChessNumbers}>
                            <Piece isPromotion={true} type="b" color={props.color} onMouseDown={promotion}/>
                            <Piece isPromotion={true} type="n" color={props.color} onMouseDown={promotion}/>
                            <Piece isPromotion={true} type="r" color={props.color} onMouseDown={promotion}/>
                            <Piece isPromotion={true} type="q" color={props.color} onMouseDown={promotion}/>
                        </PromotionWindow>) :
                        null}
                    {pieces}
                </div>
            </Adaptive>
                :
            <WaitingScreen gameID={gameID}/>}
        </>

    );
}

export default ChessBoard;

