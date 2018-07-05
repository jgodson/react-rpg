import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '../../ui';
import itemImages from '../../../assets/items';
import './ItemCard.css';

export default function ItemCard(props) {
  const {
    image,
    quantity,
    disabled,
    stats,
    name
  } = props;

  const showStats = ['attack', 'defence', 'vitals'];
  const hasStatsToShow = stats && Object.keys(stats).some((stat) => showStats.includes(stat));

  const classes = [
    'ItemCard',
    disabled && 'disabled',
  ].filter((cls) => cls).join(' ');

  return (
    <div className={classes}>
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
      <div>{name}</div>
      {quantity > 1 && <div>{quantity}</div>}
      <img src={itemImages[image]} alt={image} />
    </div>
  );
}

ItemCard.propTypes = {
  image: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  stats: PropTypes.object,
  name: PropTypes.string,
}