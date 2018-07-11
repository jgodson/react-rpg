import React from 'react';
import PropTypes from 'prop-types';
import heroImages from '../../../assets/heros';
import allItems from '../../../assets/data/items.json';
import heroClassMap from '../../../assets/data/heroClassMap.json';
import { Button, ItemCard, EventListener } from '../../ui';
import { isStartingItem, populateItemStats } from '../../../helpers/itemHelpers';
import './CharacterStage.css';

export default class CharacterStage extends React.Component {
  constructor(props) {
    super(props);
    
    this.TOTAL_STEPS = 3;
    this.ITEM_PICKS = 4;

    const characterActions = [
      {name: 'Previous', secondary: true, disabled: true,  onClick: this.previousStep },
      {name: 'Next', primary: true, disabled: true, onClick: this.nextStep },
    ];

    const startingItems = allItems.filter((item) => isStartingItem(item));
    this.availableItems = Array.from({length: 10}, () => {
      const randomIndex = Math.floor(Math.random() * startingItems.length);
      // Duplicate item so we have a fresh one each time
      const item = JSON.parse(JSON.stringify(startingItems[randomIndex]));
      return populateItemStats(item);
    });

    props.setAvailableActions(characterActions);
  }

  state = {
    step: 1,
    name: '',
    availableClasses: [
      'knight',
      'archer',
      'wizard',
    ],
    class: 'knight',
    selectedItems: [],
    complete: false,
  };

  componentDidUpdate(prevProps, prevState) {
    const needsUpdate = this.state.step !== prevState.step
      || this.state.name !== prevState.name
      || this.props.game.hero.stats.statPoints !== prevProps.game.hero.stats.statPoints
      || this.state.complete !== prevState.complete;

    if (needsUpdate) {
      const { complete } = this.state;
      const canContinue = (() => {
        switch(this.state.step) {
          case 1:
            return this.state.name.trim() !== '';
          case 2:
            return this.props.game.hero.stats.statPoints === 0;
          case 3:
            return this.state.selectedItems.length === this.ITEM_PICKS;
        }
      })();
      const characterActions = [
        {
          name: 'Previous',
          secondary: true,
          disabled: this.state.step === 1,
          onClick: this.previousStep
        },
        {
          name: this.state.step === this.TOTAL_STEPS ? 'Finish' : 'Next',
          disabled: !canContinue,
          primary: true,
          onClick: complete ? this.onFinish : this.nextStep 
        },
      ];
  
      this.props.setAvailableActions(characterActions);
    }
  }

  selectItem = (evt) => {
    const cardElement = evt.target.className === "ItemCard" ? evt.target : evt.target.parentElement;
    const elementIndex = parseInt(cardElement.getAttribute('data-index'), 10);
    if (isNaN(elementIndex)) { return; }
    const selectedItems = this.state.selectedItems;
    if (selectedItems.includes(elementIndex)) {
      const arrayIndex = selectedItems.indexOf(elementIndex);
      selectedItems.splice(arrayIndex, 1);
    } else if (selectedItems.length < this.ITEM_PICKS) {
      selectedItems.push(elementIndex);
    }
    this.setState({
      selectedItems,
      complete: selectedItems.length === this.ITEM_PICKS,
    });
  }

  handleChange = (evt) => {
    const value = evt.target.value;
    if (value.length >= 10) { return; }
    this.setState({name: value});
  }

  nextStep = () => {
    this.setState({step: this.state.step + 1});
  }

  previousStep = () => {
    this.setState({step: this.state.step - 1});
  }

  nextClass = () => {
    const current = this.state.availableClasses.indexOf(this.state.class);
    this.setState({class: this.state.availableClasses[current + 1]});
  }

  previousClass = () => {
    const current = this.state.availableClasses.indexOf(this.state.class);
    this.setState({class: this.state.availableClasses[current - 1]});
  }

  onFinish = () => {
    this.props.characterCreationCompleted({
      selectedItems: this.availableItems.filter((_, index) => this.state.selectedItems.includes(index)),
      assetInfo: heroClassMap[this.state.class],
      name: this.state.name,
    });
  }

  render() {
    const content = (() => {
      switch(this.state.step) {
        case 1: 
          // Select avatar
          const currentIndex = this.state.availableClasses.indexOf(this.state.class);
          const totalClasses = this.state.availableClasses.length;

          return (
            <React.Fragment>
              <p>Pick a character avatar</p>
              <div className="avatar-container">
                <img src={heroImages[this.state.class]} alt={this.state.class} />
                <Button onClick={this.previousClass} disabled={currentIndex === 0}>&#60;</Button>
                <Button onClick={this.nextClass} disabled={currentIndex === totalClasses - 1}>&#62;</Button>
              </div>
              <label htmlFor="heroName">Name</label>
              <input 
                className="hero-name"
                id="heroName"
                onChange={this.handleChange}
                value={this.state.name}
              />
            </React.Fragment>
          );
        case 2:
          // Distribute stat points
          return (
            <React.Fragment>
              <p>Use the Stats panel to distrubute your Stat points</p>
              <p>Click on the name of a stat to see the effects it has on your hero</p>
            </React.Fragment>
          );
        case 3:
          // Pick starting items
          return (
            <React.Fragment>
              <p className="item-picking">Pick some items to help you on your journey</p>
              <EventListener events={[{ name: 'click', handler: this.selectItem }]}>
                {this.availableItems.map((item, index) => {
                  return (
                    <ItemCard
                      key={`${item.name}-${index}`}
                      item={item}
                      quantity={1}
                      disabled={!this.state.selectedItems.includes(index)}
                      index={index}
                    />
                  );
                })}
              </EventListener>
            </React.Fragment>
          );
      }
    })();

    return (

      <div className={`CharacterStage step${this.state.step}`}>
        {content}
      </div>
    );
  }
}

CharacterStage.propTypes = {
  setAvailableActions: PropTypes.func.isRequired,
};