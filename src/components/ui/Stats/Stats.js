import React from 'react';
import PropTypes from 'prop-types';
import Stat from './Stat/Stat';
import statDescriptions from '../../../assets/data/statInfo.json';
import './Stats.css';

export default function Stats(props) {
  const { allStats, changeStats, disableChange, tempStats } = props;

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
            const statName = name[0].toUpperCase() + name.substring(1);
            return (
              <Stat
                key={name}
                statKey={name}
                description={statDescriptions[name]}
                name={statName}
                value={value}
                tempValue={tempStats && tempStats[name]}
                showButton={!noButtons.includes(name) && hasPoints}
                disableButton={!hasPoints || disableChange}
                changeStats={changeStats && changeStats}
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
  changeStats: PropTypes.func,
  disableChange: PropTypes.bool,
  tempStats: PropTypes.object,
};