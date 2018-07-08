import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, GameList } from '../../ui';
import version from '../../../version.json';
import './MainMenu.css';

export default class MainMenu extends React.PureComponent {
  state = {
    modal: null,
  };

  closeModal = () => {
    this.setState({modal: null});
  }

  showLoginForm = () => {
    this.setState({modal: 'login'});
  }

  showLoadGameMenu = () => {
    this.setState({modal: 'load-game'});
  }

  render() {
    const { hasSaveData, startGame } = this.props;

    const options = [
      hasSaveData ? { name: "Continue", onClick: () => startGame(true) } : null,
      { name: "New Game", destructive: hasSaveData, onClick: () => startGame() },
      hasSaveData ? { name: "Load Game", secondary: true, onClick: this.showLoadGameMenu } : null,
      { name: "Log In", secondary: true, disabled: true, onClick: this.showLoginForm, tooltip: "Coming eventually" },
    ].filter((opt) => opt);

    let modalActions = null;
    const modalContent = (() => {
      switch(this.state.modal) {
        case 'login':
          return (
            <div className="login">
              <p>Please log in to transfer your progress between devices</p>
              <form>
                <input type="text" placeholder="username" />
                <input type="password" placeholder="password" />
                <Button primary>Submit</Button>
              </form>
            </div>
          );
        case 'load-game':
          modalActions = [
            { name: 'Close', destructive: true, onClick: this.closeModal },
          ];
          return (
            <GameList
              gameSlots={this.props.gameSlots}
              action="load"
              onSelection={this.props.startGame} 
            />
          );
        default: 
          return null;
      }
    })();

    return (
      <div className="MainMenu">
        <h1>Welcome to React RPG</h1>
        <h3>Please select an option</h3>
        <div className="menu-select">
          {options.map((option) => {
            return (
              <Button
                primary={!option.secondary && !option.destructive}
                secondary={option.secondary}
                destructive={option.destructive}
                disabled={option.disabled}
                onClick={option.onClick}
                tooltip={option.tooltip}
                key={option.name}
              >
                {option.name}
              </Button>
            );
          })}
        </div>
        <div className="version">V {version.version}</div>
        <Modal
          shown={this.state.modal !== null}
          title="Select a game to load"
          onClose={this.closeModal}
          actions={modalActions}
          backgroundClickCloses
        >
          {modalContent}
        </Modal>
      </div>
    );
  }
}

MainMenu.propTypes = {
  hasSaveData: PropTypes.bool.isRequired,
  startGame: PropTypes.func.isRequired,
  gameSlots: PropTypes.arrayOf(PropTypes.string).isRequired,
};