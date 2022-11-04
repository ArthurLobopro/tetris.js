import { ConfigScreen } from "./Screens/Config.js"
import { InitScreen } from "./Screens/Init.js"
import { GameOverScreen } from "./Screens/GameOver.js"
import { PauseScreen } from "./Screens/Pause.js"
import { gameScreen } from "./Screens/GameScreen.js"
import { MusicConfigScreen } from "./Screens/Config/Music.js"
import { VelocityConfigScreen } from "./Screens/Config/Velocity.js"
import { ThemeConfigScreen } from "./Screens/Config/Theme.js"
import { CustomThemeConfigScreen } from "./Screens/Config/CustomTheme.js"
import { AboutScreen } from "./Screens/About.js"
import { ControlsScreen } from "./Screens/Controls.js"

const screens = {
    config: new ConfigScreen(),
    init: new InitScreen(),
    gameOver: new GameOverScreen(),
    pause: new PauseScreen(),
    game: gameScreen,
    about: new AboutScreen(),
    controls: new ControlsScreen(),
    configScreens: {
        music: new MusicConfigScreen(),
        velocity: new VelocityConfigScreen(),
        theme: new ThemeConfigScreen(),
        customTheme: new CustomThemeConfigScreen()
    }
}

export { screens }