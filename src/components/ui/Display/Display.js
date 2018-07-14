import React from 'react';
import PropTypes from 'prop-types';
import './Display.css';
import { BattleStage, DungeonStage, TownStage, CharacterStage } from '../../ui';

export default function Display(props) {
  const { game } = props;
  const { gameState } = game;

  const stage = (() => {
    switch (gameState) {
      case 'combat':
        return <BattleStage {...props} />;
      case 'dungeon':
        return <DungeonStage {...props} />;
      case 'creation':
        return <CharacterStage {...props} />;
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
  gameSlots: PropTypes.arrayOf(PropTypes.string),
  transitionToLevel: PropTypes.func.isRequired,
  changeVitals: PropTypes.func.isRequired,
  changeStats: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setActionsDisabled: PropTypes.func.isRequired,
  acknowledgeRewards: PropTypes.func.isRequired,
  setBgMusic: PropTypes.func.isRequired,
  playSoundEffect: PropTypes.func.isRequired,
  changeInventoryOrEquipment: PropTypes.func.isRequired,
  learnOrUpgradeSkill: PropTypes.func.isRequired,
};