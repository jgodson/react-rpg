import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Icon } from '../../ui';
import itemImages from '../../../assets/items';
import statInfo from '../../../assets/data/statInfo.json';
import {
  isTwoHanded,
  calculateSellingPrice,
  calculateUpgradePrice,
} from '../../../helpers/itemHelpers';
import './ItemCard.css';
const ABRV = statInfo.abbreviations;

export default function ItemCard(props) {
  const {
    item,
    quantity,
    disabled,
    index,
    gold,
    actions,
    buySellUpgrade,
  } = props;

  const SHOW_PRICE_ACTIONS = ['Buy', 'Sell', 'Upgrade'];

  const showStats = ['attack', 'defence', 'vitals', 'capacity', 'magic'];
  const hasStatsToShow = item && item.attributes && Object.keys(item.attributes).some((stat) => showStats.includes(stat));
  const isBuying = buySellUpgrade === 'buy';
  const isSelling = buySellUpgrade === 'sell';
  const isUpgrading = buySellUpgrade && buySellUpgrade.indexOf('upgrade') > -1;
  const price = (() => {
    if (!item) { return null; }
    if (isBuying) {
      return item.price;
    } else if (isUpgrading) {
      return calculateUpgradePrice(item);
    } else if (isSelling) {
      return calculateSellingPrice(item);
    } else {
      return true;
    }
  })();
  const disableCard = isUpgrading && !price;

  const canBuy = item && (gold >= price || (!price || price === true) || isSelling);
  const tooltip = !canBuy ? 'Not enough gold' : null;

  const classes = [
    'ItemCard',
    (disabled || disableCard) && 'disabled',
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
      {item &&
        <React.Fragment>
          <div>{item.name}</div>
          {(quantity > 1 || item.type === 'gold') && <div>{quantity}</div>}
          <img src={itemImages[item.image]} alt={item.image} />
          {isTwoHanded(item) && <div className="icons">{twoHandedIcons}</div>}
        </React.Fragment>
      }
      {(actions && price && item.type !== 'gold') &&
        <div className="item-actions">
          {actions.map((action) => {
            const priceContent = price !== -1 && <span className="price">{price} <img src={itemImages['coin']} alt="gold" /></span>;
            const actionName = isUpgrading && price === -1 && action.name === 'Upgrade' ? 'Max' : action.name;
            if (actionName === 'Max') {
              action.disabled = true;
            }
            return (
              <Button
                key={action.name}
                onClick={action.onClick(index)}
                primary={action.primary}
                secondary={action.secondary}
                destructive={action.destructive}
                disabled={action.disabled || ((isBuying || isUpgrading) && !canBuy)}
                tooltip={tooltip}
              >
                <span>{actionName} {SHOW_PRICE_ACTIONS.includes(action.name) && priceContent}</span>
              </Button>
            );
          })}
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
  gold: PropTypes.number,
  quantity: PropTypes.number,
  disabled: PropTypes.bool,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  actions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    onClick: PropTypes.func,
  })),
};