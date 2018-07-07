import React from 'react';
import {
  Header,
  Game,
  MainMenu,
} from './components/ui';
import gameMusic from './assets/music';
import gameBackgrounds from './assets/backgrounds';
import gameSounds from './assets/sounds';
import baseHeroStats from './assets/data/baseStats';
import heroLevels from './assets/data/heroLevels';
import allItems from './assets/data/items';

export default class App extends React.Component {
  constructor() {
    super();
    this.bgAudio = React.createRef();
    this.sfxAudio = React.createRef();
    this.root = document.getElementById('root');

    this.state = {
      bgPlay: true,
      musicName: 'menuMusic',
      backgroundName: 'menuBackground',
      gameData: null,
      inProgress: false,
      loggedIn: false,
      hasSaveData: false,
    };

    this.root.style.backgroundImage = `url(${gameBackgrounds[this.state.backgroundName]})`;
  }

  componentWillMount() {
    // Check for save data
    const saveData = this.loadData('savegame');
    if (saveData) {
      this.setState({gameData: saveData, hasSaveData: true});
    } else {
      this.setState({
        gameData: this.freshGameState(),
      });
    }
  }

  freshGameState = () => {
    return {
      gameState: 'creation',
      location: {
        x: 0,
        y: 0,
      },
      inventory: [
        {
          // Add gold (always the first in the array)
          ...allItems[0],
          quantity: 50,
        }
      ],
      hero: {
        ...baseHeroStats,
        stats: {
          ...baseHeroStats.stats,
          nextExpLevel: heroLevels[1].requiredExp,
          statPoints: heroLevels[1].points,
        }
      },
      monster: {},
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.backgroundName !== prevState.backgroundName) {
      this.root.style.backgroundImage = `url(${gameBackgrounds[this.state.backgroundName]})`;
    }
  }

  saveData = (game, data) => {
    localStorage.setItem(game, JSON.stringify(data));
  }

  loadData = (game) => {
    return JSON.parse(localStorage.getItem(game));
  }

  deleteData = (game) => {
    localStorage.removeItem(game);
  }

  toggleMusic = () => {
    const audio = this.bgAudio.current;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    this.setState({ bgPlay: !this.state.bgPlay });
  }

  setBgMusic = (name, delay) => {
    if (!this.state.bgPlay) { return; }
    const musicName = `${name}Music`;

    if (!gameMusic[musicName]) {
      console.error(`Missing music for ${musicName}`);
      return;
    }

    this.bgAudio.current.src = gameMusic[musicName];
    if (delay) {
      setTimeout(() => this.bgAudio.current.play(), delay);
    } else {
      this.bgAudio.current.play();
    }
  }

  playSoundEffect = (name, delay) => {
    if (!this.state.bgPlay) { return; }
    const soundName = `${name}Sound`;

    if (!gameSounds[soundName]) {
      console.error(`Missing sound for ${soundName}`);
      return;
    }

    this.sfxAudio.current.src = gameSounds[soundName];
    if (delay) {
      setTimeout(() => this.sfxAudio.current.play(), delay);
    } else {
      this.sfxAudio.current.play();
    }
  }

  changeLocation = (name) => {
    // Don't change it unless there is music/backgrond for scene
    const musicName = `${name}Music`;
    const backgroundName = `${name}Background`;
    this.setState({
      musicName: gameMusic[musicName] ? musicName : this.state.musicName,
      backgroundName: gameBackgrounds[backgroundName] ? backgroundName : this.state.backgroundName,
    });
  }

  showMenu = (currentGameState) => {
    this.setState({
      gameData: currentGameState,
      inProgress: false,
      musicName: 'menuMusic',
      backgroundName: 'menuBackground',
      hasSaveData: true,
    });
  }

  gameStart = (newGame) => {
    // Start the music (for Safari)
    if (this.state.bgPlay) {
      this.bgAudio.current.play();
    }

    if (newGame) {
      this.setState({
        gameData: this.freshGameState(),
        inProgress: true,
      });
    } else {
      this.setState({
        inProgress: true,
        musicName: 'townMusic',
        backgroundName: 'townBackground',
      });
    }
  }

  render() {
    const {
      bgPlay,
      gameData,
      musicName,
      loggedIn,
      inProgress,
      hasSaveData,
    } = this.state;

    return (
      <div className="App">
        <Header bgPlay={bgPlay} toggleMusic={this.toggleMusic} />

        {inProgress 
        ?
          <Game 
            gameData={gameData}
            showMenu={this.showMenu} 
            saveGame={this.saveData}
            changeLocation={this.changeLocation}
            playSoundEffect={this.playSoundEffect}
            setBgMusic={this.setBgMusic}
          />
        :
          <MainMenu 
            hasSaveData={hasSaveData}
            startGame={this.gameStart}
            loggedIn={loggedIn}
          />
        }
        
        <audio
          src={gameMusic[musicName]}
          ref={this.bgAudio}
          loop
          autoPlay={bgPlay}
        />
        <audio ref={this.sfxAudio} />
      </div>
    );
  }
}
