import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../assets/items';
import { Character } from '../../ui';
import './GameList.css';

export default class GameList extends React.PureComponent {
  constructor(props) {
    super(props);

    const populatedState = {
      games: {},
    };

    this.props.gameSlots.forEach((gameName) => {
      populatedState.games[gameName] = this.loadData(gameName);
    });

    this.state = populatedState;
  }

  saveData = (gameName, data) => {
    localStorage.setItem(gameName, JSON.stringify(data));
  }

  loadData = (gameName) => {
    return JSON.parse(localStorage.getItem(gameName));
  }

  deleteData = (gameName) => {
    localStorage.removeItem(gameName);
  }

  handleSelect = (gameName) => (evt) => {
    // Delete it if shift key is pressed
    if (evt.shiftKey) {
      this.deleteData(gameName);
      this.setState({
        games: {
          ...this.state.games,
          [gameName]: null,
        },
      });
      return;
    }

    if (this.props.action === 'save') {
      const data = this.props.currentData;
      this.saveData(gameName, data);
      this.setState({
        games: {
          ...this.state.games,
          [gameName]: data,
        },
      });
    } else {
      if (!this.state.games[gameName]) { return; }
      this.props.onSelection(this.state.games[gameName]);
    }
  }

  render() {
    return (
      <div className="GameList">
          {Object.entries(this.state.games).map(([gameName, data]) => {
            return (
              <button 
                key={gameName}
                className={`game ${!data ? 'disabled' : ''}`}
                data-name={gameName}
                onClick={this.handleSelect(gameName)}
              >
                {data 
                  ?
                    <React.Fragment>
                      <Character
                        character={data.hero}
                        action={0}
                        show={["health", "mana"]}
                      />
                      <div className="game-info">
                        <div className="name">{data.hero.name || 'Hero'}</div>
                        <div className="level">Level: {data.hero.stats.level}</div>
                        <div className="gold">
                          <img src={images['coin']} alt="gold" />
                          <div>{data.inventory[0].quantity}</div>
                        </div>
                      </div>
                    </React.Fragment>
                  :
                    null
                }
              </button>
            );
          })}
      </div>
    );
  }
}

GameList.propTypes = {
  gameSlots: PropTypes.arrayOf(PropTypes.string),
  action: PropTypes.oneOf(['save', 'load']),
  onSelection: PropTypes.func,
  currentData: PropTypes.object,
}