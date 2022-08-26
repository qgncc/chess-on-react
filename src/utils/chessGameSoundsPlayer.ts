import {Howl, Howler} from "howler";

Howler.volume(0.2   )


const SOUND_TYPES = {
    move: "/sounds/move.wav",
    capture: "/sounds/capture.wav",
    cantMove: "/sounds/cant_move.wav",
    check: "/sounds/check.wav",
    gameEnded: "/sounds/game_ended.wav",
    gameStarted: "/sounds/game_started.mp3",
}

//TODO prettier sounds
class ChessSoundPlayer{
    private player: {[key in keyof typeof SOUND_TYPES]: Howl} = {} as {[key in keyof typeof SOUND_TYPES]: Howl};
    constructor(){
        for (const soundType in SOUND_TYPES) {
            this.player[soundType as keyof typeof this.player] = new Howl({
                src: [SOUND_TYPES[soundType as keyof typeof SOUND_TYPES]]
            })
        }
    }    

    play(soundType: keyof typeof SOUND_TYPES){
        this.player[soundType].play()
    }
}

export default new ChessSoundPlayer();