import React from 'react';
import PropTypes from 'prop-types';
import Stat from './Stat/Stat';
import statDescriptions from '../../../assets/data/statInfo.json';
import './Stats.css';

export default function Stats(props) {
  const { allStats, changeStats, disableChange } = props;

  // Rename stats
  const statNames = {}

  // Don't show these ones
  const doNotShow = [
    'health',
    'mana',
    'nextExpLevel',
    'statPoints'
  ];

  // Don't show an increase button for these
  const noButtons = ['level', 'attack', 'defence'];

  const hasPoints = allStats.statPoints > 0;

  return (
    <section className="Stats">
      <div className="title-area">
        <h3>{props.heroName || 'Stats'}</h3>
        {hasPoints && <span>Points left: {allStats.statPoints}</span>}
      </div>
      <table className="stats-list">
        <tbody>
          {Object.entries(allStats).map(([name, value]) => {
            if (doNotShow.includes(name)) { return null; }

            let statName = name;
            if (statNames[statName]) {
              statName = statNames[statName];
            } else {
              statName = statName[0].toUpperCase() + statName.substring(1);
            }
            return (
              <Stat 
                key={name}
                statKey={name}
                description={statDescriptions[name]}
                name={statName}
                value={value}
                showButton={!noButtons.includes(name) && hasPoints}
                disableButton={!hasPoints || disableChange}
                changeStats={changeStats}
              />
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

Stats.propTypes = {
  heroName: PropTypes.string,
  allStats: PropTypes.object.isRequired,
  changeStats: PropTypes.func.isRequired,
  disableChange: PropTypes.bool,
};