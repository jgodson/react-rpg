import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button } from '../../ui';
import skillImages from '../../../assets/skills';
import './SkillCard.css';
import items from '../../../assets/items';
import statInfo from '../../../assets/data/statInfo.json';
const ABRV = statInfo.abbreviations;

export default function MagicCard(props) {
  const {
    skill,
    hero,
    gold,
    showPrice,
    disabled,
    index,
    actions,
  } = props;

  const classes = [
    'SkillCard',
    disabled && 'disabled',
  ].filter((cls) => cls).join(' ');

  let skillMultiplier = 0; 

  const meetsRequirements = skill.requirements 
    ? 
      Object.entries(skill.requirements).every(([stat, value]) => {
        skillMultiplier += hero.stats[stat];
        return hero.stats[stat] >= value; 
      })
    :
      true;

  const requirementsTooltip = (() => {
    if (meetsRequirements) { return null; }
    return Object.entries(skill.requirements).map(([name, value]) => {
      return `${value} ${ABRV[name]}`;
    }).join(' ');
  })();

  const canBuy = gold >= skill.price;

  const tooltip = !meetsRequirements ? requirementsTooltip : !canBuy ? 'Not enough gold' : null;

  return (
    <div className={classes} data-index={index}>
      <Tooltip>
        {Object.entries(skill.attributes).map(([name, value]) => {
          if (typeof value === 'object') {
            return Object.entries(value).map(([name, value]) => {
              const capName = name[0].toUpperCase() + name.substring(1);
              return (
                <div key={name}>
                  <div>{capName} {value > 0 ? '+' : ''}{value * skillMultiplier}</div>
                </div>
              );
            });
          } else {
            const capName = name[0].toUpperCase() + name.substring(1);
            return (
              <div key={name}>
                <div>{capName} {value > 0 ? '+' : ''}{value * skillMultiplier}</div>
              </div>
            );
          }
        })}
      </Tooltip>
      <React.Fragment>
        <div>{skill.name}</div>
        {<div>{skill.cost}</div>}
        <img src={skillImages[skill.assetInfo.image]} alt={skill.assetInfo.image} />
      </React.Fragment>
      {actions &&
        <div className="skill-actions">
          {actions.map((action, index) => (
            <Button
              key={action.name}
              onClick={action.onClick(index)}
              primary={action.primary}
              secondary={action.secondary}
              destructive={action.destructive}
              disabled={action.disabled || !meetsRequirements || !canBuy}
              tooltip={tooltip}
            >
              <span>{action.name} {showPrice && skill.price}</span>
            </Button>
          ))}
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