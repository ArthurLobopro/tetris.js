import { saveUserPreferences, userPreferences, themes } from "../../Data.js"
import { game, reloadGameConfig } from "../../Game.js"
import buildFiguresViewer from "./figuresViewer.js"
import {} from "../../Colors.js"

const get = id => document.getElementById(id)
const container = get('container')

let tempTheme = ''

export default function viewThemeConfig() {
    const themeScrenn = document.createElement('div')
    themeScrenn.className = "telas-wrapper"
    themeScrenn.innerHTML = `
    <fieldset id="theme">
        <legend>Tema</legend>
        <div class="divided">
            <div class="view-wrapper"></div>

            <div class="view-wrapper">
                <div class="line">
                    <div>Retro</div>
                <div class="radio" name="theme" data-check="${userPreferences.theme === "retro"}" data-value="retro"></div>
                </div>
                <div class="line">
                    <div>Tetris</div>
                    <div 
                        class="radio" name="theme" 
                        data-check="${userPreferences.theme === "tetris"}" data-value="tetris"
                    ></div>
                </div>
                <div class="buttons">
                <button value="1">
                    OK
                </button>
                <button class="cancel" value="0">
                    Cancelar
                </button>
            </div>
            </div>
        </div>
    </fieldset>`

    tempTheme = userPreferences.theme
    const getColors = () => themes[tempTheme]

    let colors = getColors()
    const { viewer, setColors } = buildFiguresViewer(colors)
    const viewWrapper = themeScrenn.querySelector(".view-wrapper")
    viewWrapper.appendChild(viewer)
    container.appendChild(themeScrenn)
    


    const themeRadios = document.getElementsByName('theme')

    themeRadios.forEach( radio => {
        radio.onclick = event => {
            const clickedButton = event.currentTarget
            const checked = document.querySelector('[data-check="true"]')
            checked.dataset.check = false
            clickedButton.dataset.check = true
            tempTheme = clickedButton.dataset.value
            colors = getColors()
            setColors(colors)
        }
    })

   

    
}