import Piece from "../Piece/Piece";
import "./ChessBoard.scss";
import React, {ReactNode, useEffect, useRef, useState} from "react";
import {
    AlgebraicNotation,
    Coords,
    Indexes,
    PieceType,
    Square,
    PieceObjectExtended,
    Color,
    SquareObject,
    ChessNumbers,
} from "../types";
import Adaptive from "../Adaptive/Adaptive";
import { PromotionWindow } from "../PromotionWindow/PromotionWindow";


export type PromotionPiece = {type: "q"|"r"|"b"|"n", color: Color}

export interface DropEvent{
    type: PieceType, 
    color: "w" | "b",
    initialSquare: SquareObject, 
    dropSquare: SquareObject, 
    htmlElement?:HTMLDivElement|null,
    openPromotionWindow: (
        file: ChessNumbers, 
        color: Color,
        isAtTop: boolean,
    )=>void
}

export interface PickEvent{
    type: PieceType, 
    color: "w" | "b",
    square: SquareObject, 
    htmlElement?:HTMLDivElement|null
}


interface ChessBoardProps{
    flipped?: boolean;
    position: Array<Array<{ type: PieceType; color: "w" | "b" } | null>>
    disabled?: boolean;
    onPick?: (pickEvent: PickEvent)=>boolean;
    onDrag?: (dragEvent: {
        type: PieceType, 
        color: "w" | "b",
        htmlElement?:HTMLDivElement|null,
        boardCoords: Coords,
        globalCoords: Coords
    })=>void;
    onDrop: (dropEvent: DropEvent)=>boolean;
    onPromotion:(isCancled: boolean, piece?: PromotionPiece)=>void
    children?: ReactNode|ReactNode[],
    highlightedSquares?: {[key in AlgebraicNotation]?: string},
}


interface HighLightedSquareProps {
    square: AlgebraicNotation,
    color: string
}

function toNumeric(i: AlgebraicNotation): Square {
    return {file: (i.charCodeAt(0) - 96), rank: (parseInt(i.charAt(1)))} as Square;
}

function toAlgebraic(i: Square): AlgebraicNotation {
    return ("abcdefgh".slice(i.file - 1, i.file) + i.rank.toString()) as AlgebraicNotation;
}

let HighlightedSquare = function (props: HighLightedSquareProps) {
    let {square, color} = props;

    const numericSquare = toNumeric(square);

    const squarePos = "square-"+numericSquare.file+numericSquare.rank+" ";
    return(
        <div style={{backgroundColor:color}}
             className={"chessboard__highlighted_square "+squarePos}
        />
    );
}

let ChessBoard = function (props: ChessBoardProps) {
    const {position, disabled, onDrop, onPromotion} = props
    const onDrag = props.onDrag || (()=>{});
    const onPick = props.onPick || (()=>true);
    
    let [promotionSetup, setPromotionWindowSetup] = useState(
        {
            isOpen: false, 
            file: 1 as ChessNumbers,
            color: "w" as Color,
            isAtTop: true
        }
    );
    let isFlipped = props.flipped;
    let ref = useRef() as React.MutableRefObject<HTMLDivElement>;
    let pieces: JSX.Element[] = [];
    const highlightedSquares = props.highlightedSquares || [];

    const pieceSizeInPercent = 0.125;
    const selectedPiece = useRef<PieceObjectExtended|null>(null)

   
    useEffect(()=>{
        isFlipped?ref.current.classList.add("flipped"):ref.current.classList.remove("flipped");
    },[isFlipped]);

    function handlePointerUp(event: PointerEvent) {
        if(!selectedPiece.current) return
        if(disabled) return;
        const globalCoords = {x: event.clientX, y: event.clientY};
        const boardCoords = getBoardCoordsFromGlobal(globalCoords);
        const dropSquare = getSquareByBoardCoords(boardCoords);
        const isDropped = dropPiece(
            selectedPiece.current.type, 
            selectedPiece.current.color,
            selectedPiece.current.square,
            dropSquare, 
            selectedPiece.current.htmlElement
        );
    }
    function getPieceBySquare(square: Square): {color: "w"|"b", type: PieceType}|null {
        const {x,y} = translateSquareToMatrixIndexes(square);
        const piece = position[y][x];
        
        return piece;
    }
    function handlePointerDown(event: React.PointerEvent<HTMLDivElement>){
        if(disabled) return;
        if(promotionSetup.isOpen){
            console.log("Close prom window")
            closePromotionWindow();
            onPromotion(true);
            return;
        }
        const globalCoords = {x: event.clientX, y: event.clientY};
        const boardCoords = getBoardCoordsFromGlobal(globalCoords);
        const square = getSquareByBoardCoords(boardCoords);
        const piece = getPieceBySquare(square);
        const htmlElement = event.target as HTMLDivElement;
        if(!selectedPiece.current){
            if(ref.current === event.target) return;
            if(!piece) return;
            grabPiece(piece, square, htmlElement, boardCoords);
        }else{
            if(!piece){
                dropPiece(
                    selectedPiece.current.type, 
                    selectedPiece.current.color, 
                    selectedPiece.current.square,
                    square, 
                    selectedPiece.current.htmlElement
                );
            }else{
                const isDropped = dropPiece(
                    selectedPiece.current.type, 
                    selectedPiece.current.color, 
                    selectedPiece.current.square,
                    square,
                    selectedPiece.current.htmlElement
                );
                if(!isDropped) grabPiece(piece, square, htmlElement, boardCoords)
            }
        }

    }

    
    function dropPiece(
        type: PieceType,
        color: Color,
        initialSquare: Square, 
        dropSquare: Square, 
        htmlElement?: HTMLDivElement
    ){
        
        const initialSquareObj: SquareObject = {
            numeric: initialSquare,
            algebraic: toAlgebraic(initialSquare),
        }
        const dropSquareObj: SquareObject = {
            numeric: dropSquare,
            algebraic: toAlgebraic(dropSquare),
        }
        if(initialSquareObj.algebraic === dropSquareObj.algebraic) return false;
        if(onDrop({
            type,
            color, 
            initialSquare: initialSquareObj, 
            dropSquare: dropSquareObj, 
            htmlElement,
            openPromotionWindow
        })
        ){
            selectedPiece.current = null;
            return true;
        }
        return false;
    }
   
    function grabPiece(
        piece : {color: "w"|"b", type: PieceType}, 
        square: Square, 
        htmlElement: HTMLDivElement,
        initialBoardCoords: Coords,
    ){
        const squareObject = {
            algebraic: toAlgebraic(square),
            numeric: square
        }        
        const pickEvent = {
            ...piece,
            square: squareObject,
            htmlElement
        }
        if(onPick(pickEvent)){
            selectedPiece.current = {
                ...piece,
                square,
                htmlElement
            };
            startDrag(initialBoardCoords, selectedPiece.current);
        }
    }

    function startDrag(initialBoardCoords: Coords, pieceObject: PieceObjectExtended) {
        if(!pieceObject.htmlElement) return;
        setPieceHTMLPosInBoardCoords(pieceObject.htmlElement, initialBoardCoords)
        function drag(event: PointerEvent) {
            if(!pieceObject.htmlElement) return;
            const globalCoords: Coords = {x:event.clientX, y:event.clientY}
            const boardCoords: Coords = getBoardCoordsFromGlobal(globalCoords)
            pieceObject.htmlElement.classList.add("dragging")
            setPieceHTMLPosInBoardCoords(pieceObject.htmlElement, boardCoords)
            onDrag({type: pieceObject.type, 
                    color:pieceObject.color,
                    htmlElement: pieceObject.htmlElement,
                    boardCoords, 
                    globalCoords})
        }
        function stopDrag() {
            if(!pieceObject.htmlElement) return;
            document.removeEventListener("pointermove", drag);
            pieceObject.htmlElement.classList.remove("dragging")
            selectedPiece.current && pieceObject.htmlElement.removeAttribute("style");
        }
        document.addEventListener("pointermove", drag);
        document.addEventListener("pointerup", (event: PointerEvent)=>{
            stopDrag();
            handlePointerUp(event);
        }, {once: true});
    }

    

    // function openPromotionWindow(file:ChessNumbers) {
    //     setPromotionWindowSetup({isOpen: true, file:file-1})
    // }
    function openPromotionWindow(
        file: ChessNumbers,
        color: Color,
        isAtTop: boolean,
    ){
        setPromotionWindowSetup(
            {
                isOpen: true,
                isAtTop,
                color,
                file: (isFlipped? 9-file: file) as ChessNumbers
            }
        )

    }
    function closePromotionWindow(){
        setPromotionWindowSetup((prevState)=>{
            return{
                ...prevState,
                isOpen: false
            }
        })
    }
    
    function onPromotionWrapper(isCancled: boolean, piece?:PromotionPiece) {
        onPromotion(isCancled, piece);
        closePromotionWindow()
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
        return {file: x + 1, rank: 8 - y} as Square;

    }
    function translateSquareToMatrixIndexes({file, rank}: Square): Indexes {
        return {x: file-1, y: 8-rank} as Indexes;

    }
        // function reason(){
        //     if(ChessEngine.in_checkmate()){
        //         let side_that_won = ChessEngine.turn() === "w"?
        //             "Black":"White";
        //         return side_that_won+" won by checkmate.";
        //     }
        //     if(ChessEngine.in_stalemate()){
        //         return "Stalemate";
        //     }
        //     if(ChessEngine.in_threefold_repetition()){
        //         return "Draw by repetition";
        //     }
        //     if(ChessEngine.insufficient_material()){
        //         return "Draw. Not enough material";
        //     }else{
        //         console.log("Something went wrong. Game is not over");
        //         return "";
        //     }
        // }



    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let pieceObj = position[i][j];
            let square = translateMatrixIndexesToSquare({x:j,y:i} as Indexes);
            const piece = pieceObj?
                //TODO fix key
                <Piece key = {10*i + j} color={pieceObj.color} type={pieceObj.type} square={square}/>:
                null;
            piece && pieces.push(piece);
        }
    }

    let highlightedSquaresElems = [];
    for (const square in highlightedSquares) {
        const highlightedSquare = square as keyof typeof highlightedSquares;
        const color =  highlightedSquares[highlightedSquare];
        const elem = <HighlightedSquare key={square} square={highlightedSquare} color={color}/>
        highlightedSquaresElems.push(elem);
    }

    return(
        <Adaptive>
            <div ref = {ref} onPointerDown={handlePointerDown} className = "chessboard">
                {highlightedSquaresElems}
                {props.children}
                {
                    promotionSetup.isOpen && 
                        <PromotionWindow {...promotionSetup} onPromotion={onPromotionWrapper}/>
                }
                {pieces}

            </div>
        </Adaptive>
    );
}

export default ChessBoard;

