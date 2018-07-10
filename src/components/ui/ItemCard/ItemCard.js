import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button } from '../../ui';
import itemImages from '../../../assets/items';
import './ItemCard.css';

export default function ItemCard(props) {
  const {
    image,
    quantity,
    disabled,
    stats,
    name,
    index,
    actions,
  } = props;

  const showStats = ['attack', 'defence', 'vitals', 'capacity'];
  const hasStatsToShow = stats && Object.keys(stats).some((stat) => showStats.includes(stat));
  const isEmpty = !image && !name;

  const classes = [
    'ItemCard',
    disabled && 'disabled',
  ].filter((cls) => cls).join(' ');

  return (
    <div className={classes} data-index={index}>
      {hasStatsToShow &&
        <Tooltip>
          {Object.entries(stats).map(([name, value]) => {
            if (typeof value === 'object') {
              return Object.entries(value).map(([name, value]) => {
                return (
                  <div key={name}>
                    <div>{name[0].toUpperCase() + name.substring(1)}</div>
                    <div>{value > 0 ? '+' : '-'}{value}</div>
                  </div>
                );
              });
            } else {
              return (
                <div key={name}>
                  <div>{name[0].toUpperCase() + name.substring(1)}</div>
                  <div>{value > 0 ? '+' : '-'}{value}</div>
                </div>
              );
            }
          })}
        </Tooltip>
      }
      {!isEmpty &&
        <React.Fragment>
          <div>{name}</div>
          {quantity > 1 && <div>{quantity}</div>}
          <img src={itemImages[image]} alt={image} />
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
  image: PropTypes.string,
  quantity: PropTypes.number,
  disabled: PropTypes.bool,
  stats: PropTypes.object,
  name: PropTypes.string,
  index: PropTypes.number,
  actions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    onClick: PropTypes.func,
  })),
};