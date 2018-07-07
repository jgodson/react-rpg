import React from 'react';
import PropTypes from 'prop-types';
import './DungeonStage.css';

export default class DungeonStage extends React.Component {
  constructor(props) {
    super(props);
    const dungeonActions = [
      {name: 'Inventory', disabled: true},
      {name: 'Enter combat', destructive: true, onClick: this.props.startFight },
      {name: 'Go to town', secondary: true, onClick: this.props.goToTown },
    ];

    this.props.setAvailableActions(dungeonActions);
  }

  render() {
    return (
      <div className="DungeonStage">
        Yo, this here's the dungeon. We be implmenting some coo graphics at some point so you can actually do some shiznit
      </div>
    );
  }
}

DungeonStage.propTypes = {
  game: PropTypes.object.isRequired,
  transitionToLevel: PropTypes.func.isRequired,
  changeVitals: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setAvailableActions: PropTypes.func.isRequired,
};