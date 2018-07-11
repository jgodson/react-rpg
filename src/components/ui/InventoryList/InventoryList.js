import React from 'react';
import PropTypes from 'prop-types';
import { ItemCard, EventListener } from '../../ui';
import './InventoryList.css';

export default class InventoryList extends React.Component {
  state = {
    selected: null,
    actions: null,
  }

  selectItem = (evt) => {
    const { disableItemActions } = this.props;
    const cardElement = evt.target.className === "ItemCard" ? evt.target : evt.target.parentElement;
    const elementIndex = parseInt(cardElement.getAttribute('data-index'), 10);
    if (isNaN(elementIndex)) { return; }

    // Actions based on type of item
    const equipmentActions = [
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

    this.setState({
      selected: elementIndex,
      actions: itemActions[this.props.items[elementIndex].type],
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

  render() {
    const { items, capacity, disableFn } = this.props;
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
                disabled={!item || (disableFn && !disableFn(item))}
                index={item && index}
                actions={this.state.selected === index ? this.state.actions : null}
              />
            );
          })}
        </EventListener>
      </div>
    );
  }
}

InventoryList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  disableFn: PropTypes.func,
  disableItemActions: PropTypes.arrayOf(PropTypes.string),
  capacity: PropTypes.number,
  changeInventoryOrEquipment: PropTypes.func.isRequired,
  onAction: PropTypes.func,
};