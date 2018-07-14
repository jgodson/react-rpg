import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button } from '../../ui';
import skillImages from '../../../assets/skills';
import './SkillCard.css';
import statInfo from '../../../assets/data/statInfo.json';
import images from '../../../assets/items';
const ABRV = statInfo.abbreviations;

export default function MagicCard(props) {
  const {
    skill,
    hero,
    gold,
    isTraining,
    disabled,
    index,
    actions,
  } = props;

  const SHOW_PRICE_AND_REQS_ACTIONS = ["Learn", "Upgrade"];

  const classes = [
    'SkillCard',
    disabled && 'disabled',
    skill.type,
  ].filter((cls) => cls).join(' ');

  let skillStatsMultiplier = 0; 
  const heroCurrentSkill = hero[skill.type].find((learned) => learned.id === skill.id);
  const currentSkillLevel = heroCurrentSkill ? heroCurrentSkill.level : 0;
  const nextSkillLevel = currentSkillLevel + 1;
  const currentLevelStats = skill.levels[currentSkillLevel];
  const nextLevelStats = skill.levels[nextSkillLevel];
  const levelMultiplier = isTraining ? nextLevelStats.multiplier : currentLevelStats.multiplier;

  const meetsRequirements = skill.requirements 
    ?
      Object.entries(skill.requirements).every(([stat, value]) => {
        skillStatsMultiplier += hero.stats[stat];
        return hero.stats[stat] >= Math.ceil(value * nextSkillLevel); 
      })
    :
      true;

  const requirementsTooltip = (() => {
    if (meetsRequirements) { return null; }
    return Object.entries(skill.requirements).map(([name, value]) => {
      return <div key={name}>{Math.ceil(value * nextSkillLevel)} {ABRV[name]}</div>
    });
  })();

  const canBuy = gold >= nextLevelStats.price;
  const tooltip = !meetsRequirements ? requirementsTooltip : !canBuy ? 'Not enough gold' : null;

  return (
    <div className={classes} data-index={index}>
      <Tooltip>
        {Object.entries(skill.attributes).map(([name, value]) => {
          if (typeof value === 'object') {
            return Object.entries(value).map(([name, value]) => {
              const capName = name[0].toUpperCase() + name.substring(1);
              const valueToShow = Math.ceil(value * skillStatsMultiplier * levelMultiplier);
              return (
                <div key={name}>
                  <div>{capName} {value > 0 ? '+' : ''}{valueToShow}</div>
                </div>
              );
            });
          } else {
            const capName = name[0].toUpperCase() + name.substring(1);
            const valueToShow = Math.ceil(value * skillStatsMultiplier * levelMultiplier);
            return (
              <div key={name}>
                <div>{capName} {value > 0 ? '+' : ''}{valueToShow}</div>
              </div>
            );
          }
        })}
      </Tooltip>
      <React.Fragment>
        <div>{skill.name}</div>
        {<div>{Math.ceil(skill.cost * levelMultiplier)}</div>}
        <img src={skillImages[skill.assetInfo.image]} alt={skill.assetInfo.image} />
        <div className="level-badge">{isTraining ? nextSkillLevel : currentSkillLevel}</div>
      </React.Fragment>
      {actions &&
        <div className="skill-actions">
          {actions.map((action) => {
            const priceContent = <span className="price">{nextLevelStats.price} <img src={images['coin']} alt="gold" /></span>;
            return (
              <Button
                key={action.name}
                onClick={action.onClick && action.onClick(index)}
                primary={action.primary}
                secondary={action.secondary}
                destructive={action.destructive}
                disabled={action.disabled || !meetsRequirements || !canBuy}
                tooltip={SHOW_PRICE_AND_REQS_ACTIONS.includes(action.name) && tooltip}
              >
                <span>{action.name} {SHOW_PRICE_AND_REQS_ACTIONS.includes(action.name) && priceContent}</span>
              </Button>
            );
          })}
        </div>
      }
    </div>
  );
}

MagicCard.propTypes = {
  spell: PropTypes.shape({
    image: PropTypes.string.isRequired,
    attributes: PropTypes.object,
    name: PropTypes.string.isRequired,
  }),
  disabled: PropTypes.bool,
  index: PropTypes.number,
};