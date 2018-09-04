import React from 'react';
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
