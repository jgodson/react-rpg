import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Icon } from '../../ui';
import itemImages from '../../../assets/items';
import statInfo from '../../../assets/data/statInfo.json';
import { isTwoHanded } from '../../../helpers/itemHelpers';
import './ItemCard.css';
const ABRV = statInfo.abbreviations;

export default function ItemCard(props) {
  const {
    item,
    quantity,
    disabled,
    index,
    actions,
  } = props;

  const showStats = ['attack', 'defence', 'vitals', 'capacity', 'magic'];
  const isEmpty = !item;
  const hasStatsToShow = item && item.attributes && Object.keys(item.attributes).some((stat) => showStats.includes(stat));

  const classes = [
    'ItemCard',
    disabled && 'disabled',
  ].filter((cls) => cls).join(' ');

  // Special Icons for two handed weapons
  const twoHandedIcons = (
    <React.Fragment>
      <Icon name="hand" size={16} />
      <Icon name="hand" size={16} />
    </React.Fragment>
  );

  return (
    <div className={classes} data-index={index}>
      {hasStatsToShow &&
        <Tooltip>
          {Object.entries(item.attributes).map(([name, value]) => {
            if (typeof value === 'object') {
              return Object.entries(value).map(([name, value]) => {
                return (
                  <div key={name}>
                    <div>{ABRV[name]} {value > 0 ? '+' : '-'}{value}</div>
                  </div>
                );
              });
            } else {
              return (
                <div key={name}>
                  <div>{ABRV[name]} {value > 0 ? '+' : '-'}{value}</div>
                </div>
              );
            }
          })}
        </Tooltip>
      }
      {!isEmpty &&
        <React.Fragment>
          <div>{item.name}</div>
          {quantity > 1 && <div>{quantity}</div>}
          <img src={itemImages[item.image]} alt={item.image} />
          {isTwoHanded(item) && <div className="icons">{twoHandedIcons}</div>}
        </React.Fragment>
      }
      {actions &&
        <div className="item-actions">
          {actions.map((action) => (
            <Button
              key={action.name}
              onClick={action.onClick(index)}
              primary={action.primary}
              secondary={action.secondary}
              destructive={action.destructive}
              disabled={action.disabled}
            >
              {action.name}
            </Button>
          ))}
        </div>
      }
    </div>
  );
}

ItemCard.propTypes = {
  item: PropTypes.shape({
    image: PropTypes.string.isRequired,
    attributes: PropTypes.object,
    name: PropTypes.string.isRequired,
  }),
  quantity: PropTypes.number,
  disabled: PropTypes.bool,
  index: PropTypes.number,
  actions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    onClick: PropTypes.func,
  })),
};