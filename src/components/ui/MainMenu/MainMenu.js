import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../ui';
import './MainMenu.css';

export default function MainMenu(props) {
  const { hasSaveData, startGame } = props;

  const options = [
    hasSaveData ? {name: "Continue", onClick: () => startGame(false)} : null,
    {name: "New Game", destructive: hasSaveData, onClick: () => startGame(true)},
    {name: "Log In", secondary: true},
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
    </div>
  );
}

MainMenu.propTypes = {
  hasSaveData: PropTypes.bool.isRequired,
  startGame: PropTypes.func.isRequired,
}