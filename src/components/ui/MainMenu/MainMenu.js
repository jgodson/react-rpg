import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from '../../ui';
import version from '../../../version.json';
import './MainMenu.css';

export default class MainMenu extends React.PureComponent {
  state = {
    showLoginForm: false,
  }

  toggleLoginForm = () => {
    this.setState({showLoginForm: !this.state.showLoginForm});
  }

  render() {
    const { hasSaveData, startGame } = this.props;

    const options = [
      hasSaveData ? {name: "Continue", onClick: () => startGame(false)} : null,
      {name: "New Game", destructive: hasSaveData, onClick: () => startGame(true)},
      {name: "Log In", secondary: true, onClick: this.toggleLoginForm},
    ].filter((opt) => opt);

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
                onClick={option.onClick}
                key={option.name}
              >
                {option.name}
              </Button>
            );
          })}
        </div>
        <div class="version">V {version.version}</div>
        <Modal
          shown={this.state.showLoginForm}
          onClose={this.toggleLoginForm}
          backgroundClickCloses
        >
          <div className="login">
            <p>Please log in to transfer your progress between devices</p>
            <form>
              <input type="text" placeholder="username" />
              <input type="password" placeholder="password" />
              <Button primary>Submit</Button>
            </form>
          </div>
        </Modal>
      </div>
    );
  }
}

MainMenu.propTypes = {
  hasSaveData: PropTypes.bool.isRequired,
  startGame: PropTypes.func.isRequired,
};