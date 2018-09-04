import React from 'react';
import PropTypes from 'prop-types';
import { Character, ItemCard, EventListener, Stats } from '../../ui';
import './Equipment.css';
import { getEquipmentSummary } from '../../../helpers/itemHelpers';

export default class Equipment extends React.PureComponent {
  constructor(props) {
    super(props);

    const equipmentActions = [
      { 
        name: 'Details',
        secondary: true,
        disabled: true,
        onClick: () => {},
      },
      { 
        name: 'Unequip',
        secondary: true,
        onClick: this.unequipItem,
      },
    ];

    this.availableActions = {
      weapon: equipmentActions,
      helmet: equipmentActions,
      armor: equipmentActions,
      shield: equipmentActions,
      boots: equipmentActions,
      backpack: [
        { 
          name: 'Details',
          secondary: true,
          disabled: true,
          onClick: () => {},
        },
      ],
    }

    this.state = {
      selected: null,
      actions: null,
    };
  }

  onSelectItem = (evt) => {
    const cardElement = evt.target.className === "ItemCard" ? evt.target : evt.target.parentElement;
    const type = cardElement.getAttribute('data-index');
    if (typeof type !== 'string') { return; }

    this.setState({
      selected: type,
      actions: this.availableActions[type],
    });
  }

  unequipItem = (type) => () => {
    this.props.changeInventoryOrEquipment('unequip', type);
  }

  render() {
    const { character } = this.props;
    const { equipment } = character;

    return (
      <div className="Equipment">
        <div className="information">
          <Character character={character} show={[]} />
          <Stats
            heroName="Active effects"
            allStats={getEquipmentSummary(character)}
          />
        </div>
        <EventListener events={[{name: 'click', handler: this.onSelectItem }]}>
          {Object.entries(equipment).map(([type, equipped]) => {
            return (
              <div key={type} className={'equipment-slot ' + type}>
                <label>{type[0].toUpperCase() + type.substring(1)}</label>
                <ItemCard
                  item={equipped}
                  index={type}
                  actions={this.state.selected === type ? this.state.actions : null}
                />
              </div>
            );
          })}
        </EventListener>
      </div>
    );
  }
}

Equipment.propTypes = {
  character: PropTypes.object.isRequired,
  changeInventoryOrEquipment: PropTypes.func.isRequired,
};