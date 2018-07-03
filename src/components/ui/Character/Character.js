import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from '../../ui';
import barColors from '../../../helpers/barColors';
import './Character.css';

export default class Character extends React.PureComponent {
  state = {
    damage: 0,
    numberTimeout: null,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.vitals.health !== this.props.vitals.health) {
      const damage = this.props.vitals.health - prevProps.vitals.health;
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

  render() {
    const { action, imagesrc, vitals, stats, show = ['action']} = this.props;
    const { damage } = this.state;
    const showHealth = show.includes("health");
    const showMana = show.includes("mana");
    const showAction = show.includes("action");
    const numberClasses = [
      "number",
      damage > 0 && "heal",
      damage < 0 && "damage"
    ].filter((cls) => cls).join(' ');
    const isDead = vitals.health <= 0;

    return (
      <div className={`Character ${isDead ? 'isDead' : ''}`}>
        <div className="image">
          <div className={numberClasses}>{this.state.damage}</div>
          <img src={imagesrc} alt="" />
        </div>
        <div className="vitals">
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
  imagesrc: PropTypes.string.isRequired,
  action: PropTypes.number.isRequired,
  stats: PropTypes.shape({
    health: PropTypes.number.isRequired,
    mana: PropTypes.number.isRequired,
  }).isRequired,
  vitals: PropTypes.shape({
    health: PropTypes.number.isRequired,
    mana: PropTypes.number.isRequired,
  }).isRequired,
  show: PropTypes.arrayOf(PropTypes.string),
};