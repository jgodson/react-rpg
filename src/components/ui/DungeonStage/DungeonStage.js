import React from 'react';
import PropTypes from 'prop-types';
import './DungeonStage.css';

export default class DungeonStage extends React.Component {

  render() {
    return (
      <div className="DungeonStage">
        Dungeon Stage
      </div>
    );
  }
}

DungeonStage.propTypes = {
  game: PropTypes.object.isRequired,
  transitionToLevel: PropTypes.func.isRequired,
  changeVitals: PropTypes.func.isRequired,
  monsterDie: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setActionsAvailable: PropTypes.func.isRequired,
};