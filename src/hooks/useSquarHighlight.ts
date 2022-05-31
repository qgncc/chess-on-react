import {useState} from "react";
import {Square} from "../types";

export function useSquareHighlight() {
    let [previous_move_from, setSquareFrom] = useState<Square|"none">("none");
    let [previous_move_to, setSquareTo] = useState<Square|"none">("none");
    let [selected_piece, setSelectedPiece] = useState<Square|"none">("none");
    function reset() {
        setSelectedPiece("none");
        setSquareTo("none");
        setSquareFrom("none");
    }
    return{
        previous_move_from,
        previous_move_to,
        selected_piece,
        setSelectedPiece,
        setSquareFrom,
        setSquareTo,
        reset
    }
}