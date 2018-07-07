import React from 'react';
import barColors from '../../../helpers/barColors';
import { Bar } from '../../ui';
import './Vitals.css';

export default function(props) {
  const { hero } = props;
  return (
    <section className="Vitals">
      <Bar
        label="Health"
        current={hero.vitals.health}
        max={hero.stats.health}
        showStatus
        lowColor={barColors.health.low}
        highColor={barColors.health.high}
      />
      <Bar
        label="Mana"
        current={hero.vitals.mana}
        max={hero.stats.mana}
        showStatus
        lowColor={barColors.mana.low}
        highColor={barColors.mana.high} 
      />
      <Bar
        label="Experience"
        current={hero.vitals.exp}
        max={hero.stats.nextExpLevel}
        showStatus
        highColor={barColors.exp.color}
      />
    </section>
  )
}