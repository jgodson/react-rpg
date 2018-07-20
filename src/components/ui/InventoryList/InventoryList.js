import React from 'react';
import PropTypes from 'prop-types';
import { ItemCard, EventListener } from '../../ui';
import './InventoryList.css';

export default class InventoryList extends React.Component {
  constructor(props) {
    super(props);
    const isBuying = props.buySellUpgrade === 'buy';
    const isSelling = props.buySellUpgrade === 'sell';
    const isUpgrading = props.buySellUpgrade && props.buySellUpgrade.indexOf('upgrade') > -1;
    const upgradeEquipped = props.buySellUpgrade && props.buySellUpgrade.indexOf('equipped') > -1;

    this.state = {
      isBuying,
      isSelling,
      isUpgrading,
      upgradeEquipped,
      selected: null,
      actions: null,
    }
  }

  selectItem = (evt) => {
    const { disableItemActions } = this.props;
    const cardElement = evt.target.className === "ItemCard" ? evt.target : evt.target.parentElement;
    const elementIndex = parseInt(cardElement.getAttribute('data-index'), 10);
    if (isNaN(elementIndex)) { return; }

    // Actions based on type of item
    const equipmentActions = [
      { 
        name: 'Details',
        secondary: true,
        disabled: true, //disableItemActions && disableItemActions.includes('details'),
        onClick: () => {}
      },
      { 
        name: 'Equip',
        primary: true,
        disabled: disableItemActions && disableItemActions.includes('equip'),
        onClick: this.equipItem 
      },
      { 
        name: 'Drop',
        destructive: true,
        disabled: disableItemActions && disableItemActions.includes('drop'),
        onClick: this.dropItem,
      },
    ];
    
    const itemActions = {
      weapon: equipmentActions,
      armor: equipmentActions,
      helmet: equipmentActions,
      shield: equipmentActions,
      boots: equipmentActions,
      potion: [
        { 
          name: 'Details',
          secondary: true,
          disabled: true, //disableItemActions && disableItemActions.includes('details'),
          onClick: () => {}
        },
        { 
          name: 'Use',
          primary: true,
          disabled: disableItemActions && disableItemActions.includes('use'),
          onClick: this.useItem
        },
        {
          name: 'Drop',
          destructive: true,
          disabled: disableItemActions && disableItemActions.includes('drop'),
          onClick: this.dropItem
        },
      ],
    };

    const buyActions = [
      { 
        name: 'Details',
        secondary: true,
        disabled: true, //disableItemActions && disableItemActions.includes('details'),
        onClick: () => {}
      },
      { 
        name: 'Buy',
        primary: true,
        disabled: disableItemActions && disableItemActions.includes('buy'),
        onClick: this.buyItem
      },
    ];

    const sellActions = [
      { 
        name: 'Details',
        secondary: true,
        disabled: true, //disableItemActions && disableItemActions.includes('details'),
        onClick: () => {}
      },
      { 
        name: 'Sell',
        destructive: true,
        disabled: disableItemActions && disableItemActions.includes('buy'),
        onClick: this.sellItem
      },
    ];

    const upgradeActions = [
      { 
        name: 'Details',
        secondary: true,
        disabled: true, //disableItemActions && disableItemActions.includes('details'),
        onClick: () => {}
      },
      {
        name: 'Upgrade',
        primary: true,
        disabled: disableItemActions && disableItemActions.includes('upgrade'),
        onClick: this.upgradeItem
      },
    ];

    const actions = (() => {
      if (this.state.isBuying) {
        return buyActions;
      } else if (this.state.isSelling) {
        return sellActions;
      } else if (this.state.isUpgrading) {
        return upgradeActions;
      } else {
        return itemActions[this.props.items[elementIndex].type];
      }
    })();

    this.setState({
      selected: elementIndex,
      actions,
    });
  }

  useItem = (index) => () => {
    // Do this so that if onAction modifies game state we don't run into issues
    setTimeout(() => this.props.changeInventoryOrEquipment('use', index), 0);
    this.setState({selected: null});
    this.props.onAction && this.props.onAction(index);
  }

  equipItem = (index) => () => {
    this.props.changeInventoryOrEquipment('equip', index);
    this.setState({selected: null});
    this.props.onAction && this.props.onAction(index);
  }

  dropItem = (index) => () => {
    this.props.changeInventoryOrEquipment('drop', index);
    this.setState({selected: null});
    this.props.onAction && this.props.onAction(index);
  }

  sellItem = (index) => () => {
    this.props.changeInventoryOrEquipment('sell', index);
    this.setState({selected: null});
    this.props.onAction && this.props.onAction(index);
  }

  buyItem = (index) => () => {
    const item = this.props.items[index];
    this.props.changeInventoryOrEquipment('buy', item);
    this.setState({selected: null});
    this.props.onAction && this.props.onAction(item);
  }

  upgradeItem = (index) => () => {
    const item = this.props.items[index];
    this.props.changeInventoryOrEquipment('upgrade', item, this.state.upgradeEquipped);
    this.props.onAction && this.props.onAction(item);
  }

  render() {
    const { items, capacity, disableFn, gold, showStatus } = this.props;
    const numEmptyItems = capacity ? capacity - items.length : 0;
    const emptyItemArray = Array.from({length: numEmptyItems}, () => null);
    const filledArray = items.concat(emptyItemArray);

    return(
      <div className="InventoryList">
        <EventListener events={[{ name: 'click', handler: this.selectItem }]}>
          {filledArray.map((item, index) => {
            return (
              <ItemCard
                key={`${item ? item.name : 'empty'}-${index}`}
                item={item}
                quantity={item ? item.quantity : 1}
                gold={gold}
                disabled={!item || (disableFn && !disableFn(item))}
                buySellUpgrade={this.props.buySellUpgrade}
                index={item && index}
                actions={this.state.selected === index ? this.state.actions : null}
              />
            );
          })}
        </EventListener>
        {showStatus && <span className="capacity-status">{items.length}/{capacity}</span>}
      </div>
    );
  }
}

InventoryList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  disableFn: PropTypes.func,
  buyOrSell: PropTypes.oneOf(['buy', 'sell']),
  gold: PropTypes.number,
  disableItemActions: PropTypes.arrayOf(PropTypes.string),
  capacity: PropTypes.number,
  changeInventoryOrEquipment: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};