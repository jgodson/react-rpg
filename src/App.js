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
import './App.css';

export default class App extends React.Component {
  constructor() {
    super();
    let audioEnabled = false;

    // Define audio context
    this.audioCtx = null;
    this.bgAudioBuffers = {};
    this.sfxAudioBuffers = {};
    this.bgAudio = null;
    this.sfxAudio = null;
    this.audioQueue = [];

    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
      audioEnabled = true;
    }
    catch(e) {
      console.info('Web Audio API is not supported in this browser');
      alert('Sorry, your browser does not support the Web Audio API and sound will not play.');
    }

    // Play music if not suspended
    if (this.audioCtx && this.audioCtx.state !== 'suspended') {
      this.setBgMusic('menu');
    }

    // Add portal container to document
    const portalContainer = document.createElement('div');
    portalContainer.id = 'PortalContainer';
    document.body.appendChild(portalContainer);

    // The names that we save our data into local storage under
    this.GAME_SLOTS = ['savegame', 'savegame2', 'savegame3'];
    
    if (!('hidden' in document)) {
      alert('Your browser does not support the Visibility API. Music will not pause when minimized or locked');
    } else {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.state = {
      audioEnabled,
      backgroundName: 'menuBackground',
      gameData: null,
      inProgress: false,
      loggedIn: false,
      hasSaveData: false,
    };
  }

  componentWillMount() {
    // Check for save data
    let saveData = null;
    for (let i = 0; i < this.GAME_SLOTS.length; i++) {
      const data = this.loadData(this.GAME_SLOTS[i]);
      if (data) {
        saveData = data;
        break;
      }
    }
    if (saveData) {
      this.setState({gameData: saveData, hasSaveData: true});
    } else {
      this.setState({
        gameData: this.freshGameState(),
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.musicName !== this.state.musicName) {
      const strippedName = nextState.musicName.replace('Music', '');
      this.setBgMusic(strippedName);
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
          quantity: 150,
        }
      ],
      hero: {
        ...baseHeroStats,
        stats: {
          ...baseHeroStats.stats,
          nextExpLevel: heroLevels[1].requiredExp,
          statPoints: heroLevels[1].points,
        },
      },
      monster: {},
    };
  }

  loadData = (game) => {
    return JSON.parse(localStorage.getItem(game));
  }

  toggleMute = () => {
    // Toggle to mute and unmute sound
    const newVal = this.state.audioEnabled ? 0 : 1;
    this.gainNode.gain.value = newVal;
    this.setState({audioEnabled: !this.state.audioEnabled});
    }

    handleVisibilityChange = () => {
      if (document.hidden) {
        this.audioCtx.suspend();
      } else {
        this.audioCtx.resume();
      }
    }

  setBgMusic = (name, delay) => {
    const musicName = `${name}Music`;

    if (!gameMusic[musicName]) {
      console.error(`Missing music for ${musicName}`);
      return;
    }

    this.loadAudioUrl({
      url: gameMusic[musicName],
      source: 'bgAudioBuffers',
      name: musicName,
      delay,
      callback: this.finishedLoading
    });
  }

  playSoundEffect = (name, delay) => {
    const soundName = `${name}Sound`;

    if (!gameSounds[soundName]) {
      console.error(`Missing sound for ${soundName}`);
      return;
    }

    this.loadAudioUrl({
      url: gameSounds[soundName],
      source: 'sfxAudioBuffers',
      name: soundName,
      delay,
      callback: this.finishedLoading
    });
  }

  loadAudioUrl = ({url, source, name, delay = 0, callback}) => {
    // Queue music so we don't play the wrong one once loaded. 
    // SFX are hopefully good but could do the same thing if needed
    if (source.indexOf('bgAudio') > -1) {
      this.audioQueue.push(name);

      // Stop any currently playing audio here so that it just goes silent
      // This is better than playing the wrong music (I think?)
      if (this.bgAudio) {
        if (this.bgAudio.context.state !== 'suspended') {
          this.bgAudio.stop();
        }
        this.bgAudio.disconnect();
      }
      this.bgAudio = null;
    }

    if (this[source][name]) {
      callback({
        buffer: this[source][name],
        source,
        name,
        delay,
      });
    } else {
      window.fetch(url)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioCtx.decodeAudioData(
        arrayBuffer,
        (buffer) => callback({buffer, source, name, delay}),
        (error) => {
          console.error(`Error decoding array buffer`);
        }
      ))
      .catch((error) => {
        console.error(`Error getting audio from ${url}`);
      })
    }
  }

  finishedLoading = ({buffer, source, name, delay}) => {
    // Save the data so we don't have to make a new request (could utilize localstorage here too)
    this[source][name] = buffer;

    if (source.indexOf('bgAudio') > -1) {
      // Make sure the music is the last one that was called for (in case of slow loading)
      const audioIndex = this.audioQueue.indexOf(name);
      if (audioIndex !== this.audioQueue.length - 1) {
        this.audioQueue.splice(audioIndex, 1);
        return;
      } else {
        this.audioQueue.shift();
      }
      this.bgAudio = this.audioCtx.createBufferSource();
      this.bgAudio.buffer = buffer;
      this.bgAudio.loop = true;
      this.bgAudio.connect(this.gainNode);
      this.bgAudio.start(this.audioCtx.currentTime + delay / 1000);
    } else {
      if (this.sfxAudio) {
        if (this.sfxAudio.context.state !== 'suspended') {
          this.sfxAudio.stop();
        }
        this.sfxAudio.disconnect();
      }
      this.sfxAudio = null;
      this.sfxAudio = this.audioCtx.createBufferSource();
      this.sfxAudio.buffer = buffer;
      this.sfxAudio.connect(this.gainNode);
      this.sfxAudio.start(this.audioCtx.currentTime + delay / 1000);
    }
  }

  changeLocation = (name) => {
    // Don't change it unless there is music/backgrond for scene
    const backgroundName = `${name}Background`;
    const musicName = `${name}Music`;
    this.setState({
      musicName,
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

  gameStart = (gameData) => {
    // For browsers that auto suspend new contexts, we resume it on button press
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    if (!gameData) {
      this.setState({
        gameData: this.freshGameState(),
        inProgress: true,
        musicName: 'menuMusic',
      });
    } else if (typeof gameData === 'object') {
      this.setState({
        gameData: gameData,
        inProgress: true,
        musicName: 'townMusic',
        backgroundName: 'townBackground',
      });
    } else {
      this.setState({
        gameData: this.state.gameData,
        inProgress: true,
        musicName: 'townMusic',
        backgroundName: 'townBackground',
      });
    }
  }

  render() {
    const {
      audioEnabled,
      gameData,
      loggedIn,
      inProgress,
      hasSaveData,
    } = this.state;
    return (
      <div className="App">
        <div className="bgContainer" style={{backgroundImage: `url(${gameBackgrounds[this.state.backgroundName]})`}}>
          <Header bgPlay={audioEnabled} toggleMusic={this.toggleMute} />

          {inProgress 
          ?
            <Game
              gameData={gameData}
              showMenu={this.showMenu} 
              gameSlots={this.GAME_SLOTS}
              changeLocation={this.changeLocation}
              playSoundEffect={this.playSoundEffect}
              setBgMusic={this.setBgMusic}
            />
          :
            <MainMenu 
              hasSaveData={hasSaveData}
              startGame={this.gameStart}
              gameSlots={this.GAME_SLOTS}
              loggedIn={loggedIn}
            />
          }
        </div>
      </div>
    );
  }
}
