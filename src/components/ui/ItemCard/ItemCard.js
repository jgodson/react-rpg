import React from 'react';
import PropTypes from 'prop-types';
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

  const showStats = ['attack', 'defence'];
  const hasStatsToShow = stats && Object.keys(stats).some((stat) => showStats.includes(stat));

  const classes = [
    'ItemCard',
    disabled && 'disabled',
  ].filter((cls) => cls).join(' ');

  return (
    <div className={classes} onClick={() => {/* To allow "hover" on mobile */}}>
      {hasStatsToShow &&
        <div className="tooltiptext">
          {Object.entries(stats).map(([name, value]) => {
            return (
              <div key={name}>
                <div>{name[0].toUpperCase() + name.substring(1)}</div>
                <div>{value}</div>
              </div>
            );
          })}
        </div>
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