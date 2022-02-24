import { screens } from "./ScreenManager.js"
import { gameScreenComponents } from "./Screens/GameScreen.js"
import { figures } from "./Figures.js"
import "./Controllers.js"
import { renderAll } from "./View.js"
import { Audios } from "./Audio.js"
import { mainKeyDown, mainKeyPress } from "./Controllers.js"
import { gameData, saveLastPontuation, saveRecords, userPreferences } from "./Data.js"

const { gameCanvas, last_points_span, nextCanvas, points_span } = gameScreenComponents

const formatPoints = points => String(points).padStart(4, '0')

class Game {
    height = 30
    width = 15
    squareWidth = 16
    pointsPerBlock = 10
    renderVelocity = 1000 / 60
    fallInterval = null
    renderInterval = null
    lastPontuation = 0
    points = 0
    gameplayVelocity = 0
    records = []

    nextCanvasSize = {
        height: 6,
        width: 6
    }

    userPreferences = {
        gameplayVelocity: null,
        music: null
    }

    //#region Contructor methods
    constructor() {
        this.reset()
        this.loadUserPreferences()
    }

    loadUserPreferences() {
        gameData.records.forEach(record => {
            this.records.push(record)
        })
        Object.entries(userPreferences).forEach(([key, value]) => {
            this.userPreferences[key] = value
        })
        this.lastPontuation = gameData.lastPontuation
    }

    reset() {
        this.status = "inactive"
        this.moveLock = false
        this.isMusicOn = false
        this.state = this.getNewState()
        this.spawnFirstFigure()
        this.spawnNextFigure()
    }
    //#endregion

    //#region Figure methods
    makeNullBlock() { return { type: "null" } }

    makeALine() {
        return Array.from({ length: this.width }, this.makeNullBlock)
    }

    getNewState() {
        return Array.from({ length: this.height }, this.makeALine.bind(this))
    }

    centerFigure() {
        this.atualFigure.x = Math.trunc(this.width / 2 - this.atualFigure.blocks[0].length / 2)
    }

    spawnFirstFigure() {
        this.atualFigure = {
            y: 0,
            x: 0,
            ...figures.random()
        }
        this.centerFigure()
    }

    spawnNextFigure() {
        this.nextFigure = {
            ...figures.random()
        }
    }

    spawnNewFigure() {
        game.atualFigure = {
            y: 0,
            x: 0,
            ...game.nextFigure
        }
        this.centerFigure()
        this.spawnNextFigure()
    }
    //#endregion

    //#region Game State
    addFigurePoints() {
        const { blocks } = this.atualFigure

        let figureBlocks = 0

        blocks.forEach(line => {
            line.forEach(block => {
                if (block.type === 'block') {
                    figureBlocks++
                }
            })
        })

        this.points += figureBlocks * this.pointsPerBlock
    }

    addLinePoints() {
        this.points += this.pointsPerBlock * this.width * 2
    }

    addToState() {
        const { x, y, blocks, figureType } = this.atualFigure

        blocks.forEach((line, indexY) => {

            line.forEach((block, indexX) => {
                this.state[y + indexY] = this.state[y + indexY].map((stateBlock, stateX) => {
                    if ([x + indexX] == stateX && block.type === 'block') {
                        return { ...block, figureType }
                    }
                    return stateBlock
                })
            })
        })

        this.removeCompleteLines()
    }

    removeCompleteLines() {
        const voidLine = this.makeALine()

        this.state = this.state.filter(line => {

            return line.some(block => {
                return block.type === 'null'
            })

        })

        while (this.state.length < this.height) {
            this.addLinePoints()
            this.state.unshift(voidLine)
        }
    }
    //#endregion

    //#region Collision
    collision() {
        const { x, y, blocks } = this.atualFigure

        const bottomY = y + blocks.length

        if (bottomY === this.height) {
            return true
        }

        const colidBlock = blocks.some((line, indexY) => {
            return line.some((block, indexX) => {
                if (block.type === "null") {
                    return false
                }

                return this.state[y + indexY + 1][x + indexX].type === 'block'
            })
        })

        return colidBlock
    }

    getHaveBlocksOnRight(figure = this.atualFigure) {
        const { y, x } = figure

        return figure.blocks.some((line, indexY) => {
            if (line[line.length - 1].type === "null") {
                return false
            }

            return this.state[y + indexY]?.[x + line.length]?.type === "block"
        })
    }

    getHaveBlocksOnLeft(figure = this.atualFigure) {
        const { y, x } = figure

        return figure.blocks.some((line, indexY) => {
            if (line[0].type === "null") {
                return false
            }

            return this.state[y + indexY]?.[x - 1]?.type === "block"
        })
    }

    //#endregion

    //#region Game methods
    newGame() {
        this.lastPontuation = this.points
        this.points = 0
        points_span.innerText = formatPoints(this.points)
        last_points_span.innerText = formatPoints(this.lastPontuation)

        this.reset()
        this.status = "active"

        renderAll()

        window.onkeydown = mainKeyDown
        window.onkeypress = mainKeyPress

        this.fallInterval = setInterval(playGame, this.userPreferences.gameplayVelocity)
        this.renderInterval = setInterval(renderAll, this.renderVelocity)

        if (userPreferences.music) {
            this.isMusicOn = true
            Audios.theme.currentTime = 0
            Audios.theme.volume = userPreferences.musicVolume
            Audios.theme.play()
            Audios.theme.loop = true
        }
    }

    pause() {
        window.onkeydown = mainKeyDown
        window.onkeypress = mainKeyPress
        clearInterval(this.fallInterval)
        this.status = "paused"
        screens.pause.show()
        if (this.isMusicOn) {
            Audios.theme.pause()
        }
    }

    continueGame() {
        this.status = "active"
        this.fallInterval = setInterval(playGame, this.userPreferences.gameplayVelocity);
        window.onkeydown = mainKeyDown
        if (this.isMusicOn) {
            Audios.theme.play()
        }
    }

    move(direction) {
        if (this.moveLock) return

        const { y, x } = this.atualFigure

        const haveBlocksOnLeft = this.getHaveBlocksOnLeft()

        const haveBlocksOnRight = this.getHaveBlocksOnRight()

        if (
            direction === "right" && !haveBlocksOnRight && x + this.atualFigure.blocks[0].length <= 14
        ) {
            this.atualFigure.x++
        }

        if (direction === "left" && !haveBlocksOnLeft && x > 0) {
            this.atualFigure.x--
        }

        this.moveLock = true

        setTimeout(() => this.moveLock = false, 100);
    }
    //#endregion
}

const game = new Game()

//#region Gameplay

const gameOver = async () => {
    clearInterval(game.fallInterval)
    clearInterval(game.renderInterval)
    verifyRecords()
    saveLastPontuation()

    screens.gameOver.reset()
    screens.gameOver.show()
}

const playGame = () => {
    if (!game.collision() && game.status == "active") {
        game.atualFigure.y++
    } else {
        if (game.atualFigure.y == 0) {
            return gameOver()
        }
        game.addFigurePoints()
        game.addToState()
        game.spawnNewFigure()
    }

    points_span.innerText = formatPoints(game.points)
}
//#endregion

const reloadGameConfig = () => {
    if (game.isMusicOn !== game.userPreferences.music) {
        game.isMusicOn = game.userPreferences.music
        Audios.theme.volume = userPreferences.musicVolume
        Audios.theme.loop = true
        Audios.theme.currentTime = 0
    }
}

const verifyRecords = () => {
    const { points, records } = game
    console.log(records);
    const atualPointsIsNewRecord = records.some(record => record.points < points)
    if (atualPointsIsNewRecord) {
        game.records.pop()
        const newRecordIndex = records.findIndex(record => record.points < points)
        console.log(newRecordIndex);
        game.records.splice(newRecordIndex, 0, { points })
        saveRecords()
    }
}

gameCanvas.width = (game.width * game.squareWidth) + game.width - 1
gameCanvas.height = (game.height * game.squareWidth) + game.height - 1

nextCanvas.width = (game.squareWidth * game.nextCanvasSize.width) + game.nextCanvasSize.width - 1
nextCanvas.height = (game.squareWidth * game.nextCanvasSize.height) + game.nextCanvasSize.height - 1

window.onload = async () => {
    screens.game.show(false)
    screens.init.show()
}

// window.debug = {
//     setGamePoints: points => {
//         game.points = points
//     }
// }

export { game, playGame, formatPoints, reloadGameConfig }