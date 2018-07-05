import React from 'react';
import PropTypes from 'prop-types';
import './Display.css';
import { BattleStage, DungeonStage, TownStage } from '../../ui';

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
        return <TownStage {...props} />;
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
  changeVitals: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setActionsAvailable: PropTypes.func.isRequired,
  acknowledgeRewards: PropTypes.func.isRequired,
  heroWasReset: PropTypes.func.isRequired,
  setBgMusic: PropTypes.func.isRequired,
  playSoundEffect: PropTypes.func.isRequired,
};