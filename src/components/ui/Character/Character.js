import React from 'react';
import PropTypes from 'prop-types';
import { Bar, Tooltip } from '../../ui';
import barColors from '../../../helpers/barColors';
import heroImages from '../../../assets/heros';
import monsterImages from '../../../assets/monsters';
import statInfo from '../../../assets/data/statInfo.json';
import './Character.css';

const ABRV = statInfo.abbreviations;

export default class Character extends React.PureComponent {
  state = {
    damage: 0,
    numberTimeout: null,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.character.vitals.health !== this.props.character.vitals.health) {
      const damage = this.props.character.vitals.health - prevProps.character.vitals.health;
      clearTimeout(this.state.numberTimeout);

      const numberTimeout = setTimeout(() => {
        this.setState({damage: 0});
      }, 1500);

      this.setState({
        damage,
        numberTimeout,
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.numberTimeout);
  }

  render() {
    const {
      action,
      character,
      show = ['action'],
      tooltip,
    } = this.props;
    const { vitals, stats, collections } = character;
    const { damage } = this.state;
    const showHealth = show.includes("health");
    const showMana = show.includes("mana");
    const showAction = show.includes("action");
    const numberClasses = [
      "number",
      damage > 0 && "heal",
      damage < 0 && "damage"
    ].filter((cls) => cls).join(' ');
    const isDead = character.vitals.health <= 0;
    const imagesrc = heroImages[character.assetInfo.image] || monsterImages[character.assetInfo.image];
    const classes = [
      'Character',
      isDead && 'isDead',
      (collections && collections.includes('size-large')) && 'size-large',
      (collections && collections.includes('size-medium')) && 'size-medium',
    ].filter((cls) => cls).join(' ');

    return (
      <div className={classes}>
        <div className="image">
          <img src={imagesrc} alt="" />
        </div>
        {tooltip &&
          <Tooltip>
            <div className="character-info">
              <div>{character.name}</div>
              {tooltip.map((stat) => {
                const pieces = stat.split(':');
                const statName = pieces[1] ? pieces[1] : stat;
                return (
                  <div key={stat}>
                    {ABRV[statName]}: {pieces[1] ? character[pieces[0]][pieces[1]] : character[stat]}
                  </div>
                );
              })}
            </div>
          </Tooltip>
        }
        <div className="vitals">
          <div className={numberClasses}>{this.state.damage}</div>
          {showHealth && 
            <Bar
              current={vitals.health}
              max={stats.health}
              lowColor={barColors.health.low}
              highColor={barColors.health.high}
              showStatus={false}
              height={5}
            />
          }
          {showMana && 
            <Bar
              current={vitals.mana}
              max={stats.mana}
              lowColor={barColors.mana.low}
              highColor={barColors.mana.high}
              showStatus={false}
              height={5}
            />
          }
          {showAction && 
            <Bar
              current={action}
              max={100}
              showStatus={false}
              lowColor={barColors.action.color}
              height={5}
            />
          }
        </div>
      </div>
    );
  }
}

Character.propTypes = {
  character: PropTypes.shape({
    name: PropTypes.string.isRequired,
    assetInfo: PropTypes.shape({
      image: PropTypes.string.isRequired,
    }),
    vitals: PropTypes.shape({
      health: PropTypes.number.isRequired,
      mana: PropTypes.number.isRequired,
    }),
    stats: PropTypes.shape({
      health: PropTypes.number.isRequired,
      mana: PropTypes.number.isRequired,
    }),
  }),
  action: PropTypes.number,
  show: PropTypes.arrayOf(PropTypes.string),
  tooptip: PropTypes.arrayOf(PropTypes.string),
};