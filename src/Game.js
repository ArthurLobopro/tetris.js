import { range } from "./Util.js"
import { figures } from "./Figures.js"
import "./Controllers.js"
import viewGameOver from "./Telas/GameOver.js"
import { renderAll } from "./View.js"
import { Audios } from "./Audio.js"

const gameCanvas = document.getElementById('game')
const nextCanvas = document.getElementById('next')
const pontosSpan = document.getElementById('pontos')

const game = {
    height: 30,
    width: 15,
    squareWidth: 16,
    state: [],
    interval: null,
    pointsPerBlock: 10,
    pontos: 0,
    recordes: [],
    nextFigure: {
        figure: figures.random(),
        color: '#ddd'
    },
    nextCanvasSize: {
        height: 6,
        width: 6
    },
    atualFigure: {
        figure: [[]],
        x: 0,
        y: 0,
        color: '#ddd'
    },
    moveLock: false,
    move(direction) {
        if (this.moveLock) return

        const { y, x } = this.atualFigure

        const haveBlocksOnLeft = this.atualFigure.figure.some((line, indexY) => {
            if (line[0].type === "null") {
                return false
            }

            return this.state[y + indexY]?.[x - 1]?.type === "block"
        })


        const haveBlocksOnRight = this.atualFigure.figure.some((line, indexY) => {
            if (line[line.length - 1].type === "null") {
                return false
            }

            return this.state[y + indexY]?.[x + line.length]?.type === "block"
        })


        if (direction === "right" && !haveBlocksOnRight) {
            if (x + this.atualFigure.figure[0].length <= 14)
                this.atualFigure.x++
        }

        if (direction === "left" && !haveBlocksOnLeft) {
            if (x > 0)
                this.atualFigure.x--
        }

        this.moveLock = true

        setTimeout(() => this.moveLock = false, 100);
    }

}

//#region Pontuação

const addLinePoints = () => {
    game.pontos += game.pointsPerBlock * game.width * 2
}

const addFigurePoints = () => {
    const { figure } = game.atualFigure

    let figureBlocks = 0

    figure.forEach(line => {
        line.forEach(block => {
            if (block.type === 'block') {
                figureBlocks++
            }
        })
    })

    game.pontos += figureBlocks * game.pointsPerBlock
}

//#endregion

const getNewGameState = () => {
    const nullBlock = { type: "null" }

    const line = []

    for (let i in range(0, game.width)) {
        line.push(nullBlock)
    }

    const table = []

    for (let i in range(0, game.height)) {
        table.push(line)
    }

    return table
}

const spawnNewFigure = () => {
    game.atualFigure.y = 0
    game.atualFigure.figure = game.nextFigure.figure
    game.nextFigure.figure = figures.random()
    game.atualFigure.x = Math.trunc(game.width / 2 - game.atualFigure.figure[0].length / 2)
}

//#region Update game.state
const removeCompleteLines = () => {
    const nullBlock = { type: "null" }

    const voidLine = []

    for (let i in range(0, game.width)) {
        voidLine.push(nullBlock)
    }

    game.state = game.state.filter(line => {

        return line.some(block => {
            return block.type === 'null'
        })

    })

    while (game.state.length < game.height) {
        addLinePoints()
        game.state.unshift(voidLine)
    }
}

const addToState = () => {
    const { x, y, figure, color } = game.atualFigure

    figure.forEach((line, indexY) => {

        line.forEach((block, indexX) => {

            game.state[y + indexY] = game.state[y + indexY].map((stateBlock, stateX) => {
                if ([x + indexX] == stateX) {
                    if (block.type === 'block') {
                        return { ...block, color }
                    }
                    return stateBlock
                }

                return stateBlock
            })
        })
    })

    removeCompleteLines()
}
//#endregion

const collision = () => {
    const { x, y, figure } = game.atualFigure

    const bottomY = y + figure.length

    if (bottomY === game.height) {
        return true
    }

    const colidBlock = figure.some((line, indexY) => {
        return line.some((block, indexX) => {
            if (block.type === "null") {
                return false
            }

            return game.state[y + indexY + 1][x + indexX].type === 'block'
        })
    })

    return colidBlock
}

const gameOver = async () => {
    clearInterval(game.interval)
    await viewGameOver()
    newGame()    
}

const newGame = () => {
    game.state = getNewGameState()
    game.pontos = 0
    pontosSpan.innerText = String(game.pontos).padStart(4, '0')
    spawnNewFigure()
    renderAll()
    game.interval = setInterval(playGame, 500)
}

const playGame = () => {
    if (!collision()) {
        game.atualFigure.y++
    } else {
        if (game.atualFigure.y == 0) {
            return gameOver()
        }
        addFigurePoints()
        addToState()
        spawnNewFigure()
    }

    pontosSpan.innerText = String(game.pontos).padStart(4, '0')
}

game.state = getNewGameState()
spawnNewFigure()

gameCanvas.width = (game.width * game.squareWidth) + game.width - 1
gameCanvas.height = (game.height * game.squareWidth) + game.height - 1

nextCanvas.width = (game.squareWidth * game.nextCanvasSize.width) + game.nextCanvasSize.width - 1
nextCanvas.height = (game.squareWidth * game.nextCanvasSize.height) + game.nextCanvasSize.height - 1

game.interval = setInterval(playGame, 500)

window.onload = () => {
    Audios.theme.play()
    Audios.theme.loop = true
}

export { game, playGame, collision, addFigurePoints}