import React from 'react';
import PropTypes from 'prop-types';
import './Display.css';
import { BattleStage, DungeonStage } from '../../ui';

export default function Display(props) {
  const { game } = props;
  const { gameState } = game;

  const stage = (() => {
    switch (gameState) {
      case 'combat':
        return <BattleStage {...props} />;
      case 'dungeon':
        return <DungeonStage {...props} />;
      default:
        return null;
    }
  })();

  return (
    <section className="Display">
      {stage}
    </section>
  );
}

Display.propTypes = {
  game: PropTypes.object.isRequired,
  transitionToLevel: PropTypes.func.isRequired,
  changeStats: PropTypes.func.isRequired,
  monsterDie: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setActionsAvailable: PropTypes.func.isRequired,
};