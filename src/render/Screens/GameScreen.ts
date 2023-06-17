import { Screen } from "./Screen"

class GameScreen extends Screen {
    constructor() {
        super()
        this.reset()
    }

    buildFunction() {
        const gameScreen = document.createElement('div')
        gameScreen.id = "tela"
        gameScreen.innerHTML = `
        <canvas id="game"></canvas>
        <div id="data">
            <div id="next-wrapper">
                <div>Próximo</div>
                <canvas id="next" width="0" height="0"></canvas>
            </div>
            <div>
                <div>Pontos: <span id="pontos">0000</span></div>
                <br>
                <div>Ultima Pontuação: <div id="last-pontuation">0000</div></div>
                <br>
                <div>
                    Recordes:
                    <div id="recordes"></div>
                </div>
            </div>
        </div>`

        return gameScreen
    }

    getComponents() {
        const gameScreen = this.screen
        const gameCanvas = gameScreen.querySelector('canvas#game') as HTMLCanvasElement
        const gameCtx = gameCanvas.getContext('2d') as CanvasRenderingContext2D
        const nextCanvas = gameScreen.querySelector('canvas#next') as HTMLCanvasElement
        const nextCtx = nextCanvas.getContext('2d') as CanvasRenderingContext2D
        const points_span = gameScreen.querySelector('#pontos') as HTMLSpanElement
        const last_points_span = gameScreen.querySelector('#last-pontuation') as HTMLDivElement

        return { gameScreen, gameCanvas, gameCtx, nextCanvas, nextCtx, points_span, last_points_span }
    }
}

export const gameScreen = new GameScreen()
export const gameScreenComponents = gameScreen.getComponents()