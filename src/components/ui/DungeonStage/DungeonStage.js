import React from 'react';
import PropTypes from 'prop-types';
import { Modal, InventoryList, SkillList, Equipment, Tile, Character, EventListener } from '../../ui';
import {
  skillNotUseableOutsideBattle,
  calculateSkillDamage,
  calculateSkillEffect
} from '../../../helpers/battleHelpers';
import './DungeonStage.css';

export default class DungeonStage extends React.Component {
  constructor(props) {
    super(props);
    const dungeonActions = [
      { name: 'Inventory', secondary: true, onClick: () => this.setState({showModal: 'inventory'}) },
      { name: 'Equipment', secondary: true, onClick: () => this.setState({showModal: 'equipment'}) },
      { name: 'Skills', secondary: true, onClick: () => this.setState({showModal: 'skills'}) },
      { name: 'Magic', secondary: true, onClick: () => this.setState({showModal: 'magic'}) },
    ];

    this.props.setAvailableActions(dungeonActions);

    document.addEventListener('keydown', this.move);

    // Set the default size of the tiles on the map and
    // Make sure we scale the map nicely and center it
    this.TILE_SIZE = props.game.lastTileSize || 64;
    this.TILE_VISION = 5;
    this.STAGE_WIDTH = props.game.lastStageWidth || 300;
    this.mainElement = React.createRef();
    window.addEventListener('resize', this.resizeStage);

    this.keyMap = {
      37: 'LEFT',
      38: 'UP',
      39: 'RIGHT',
      40: 'DOWN',
    };

    this.state = {
      showModal: false,
    };
  }

  componentDidMount() {
    this.resizeStage();
    this.checkForMonsterEncounter(this.props.game.location.x, this.props.game.location.y);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.game.location.x !== this.props.game.location.x 
      || prevProps.game.location.y !== this.props.game.location.y
    ) {
      const newLevel = this.checkPositionForConnection(this.props.game.location.x, this.props.game.location.y);
      if (newLevel) {
        // Let animation happen, then go to new level
        setTimeout(() => newLevel === 'town' ? this.props.goToTown() : this.props.transitionToLevel(newLevel), 200);
        return;
      }
      this.checkForMonsterEncounter(this.props.game.location.x, this.props.game.location.y);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.move);
    window.removeEventListener('resize', this.resizeStage);
    clearTimeout(this.wait);
  }

  closeModal = () => {
    this.setState({showModal: false})
  }

  resizeStage = () => {
    const width = this.mainElement.current.offsetWidth;
    const height = this.mainElement.current.offsetHeight;
    const tileHeight = Math.floor(height / this.TILE_VISION);
    let tileWidth = Math.floor(width / this.TILE_VISION);
    this.TILE_SIZE = Math.min(tileWidth, tileHeight);
    this.STAGE_WIDTH = width;
    this.mainElement.current.style.setProperty('--stage-width', `${this.STAGE_WIDTH}px`);
    this.mainElement.current.style.setProperty('--tile-size', `${this.TILE_SIZE}px`);
    console.log(this.props.game.lastTileSize, this.props.game.lastStageWidth)
    if (this.TILE_SIZE !== this.props.game.lastTileSize || this.STAGE_WIDTH !== this.props.game.lastStageWidth) {
      this.props.updateLastStageSizes({tileSize: this.TILE_SIZE, stageWidth: this.STAGE_WIDTH});
    }
    this.forceUpdate();
  }

  useSkill = (skill) => {
    const {
      maxDamage,
      manaCost,
    } = calculateSkillEffect({attacker: this.props.game.hero, skill});
    
    const skillSound = skill.assetInfo.sound && skill.assetInfo.sound !== '' && skill.assetInfo.sound;
    this.props.playSoundEffect(skillSound);

    const healing = calculateSkillDamage(maxDamage);
    this.props.changeVitals('hero', {health: healing, mana: -manaCost});
    this.setState({showModal: false});
  }

  checkIfSkillDisabled = (skill) => {
    const level = skill.level;
    const cost = skill.cost;
    const multiplier = skill.levels[level].multiplier;
    const requiredMana = Math.ceil(cost * multiplier);
    const notEnoughMana = !(this.props.game.hero.vitals.mana >= requiredMana);
    return notEnoughMana || skillNotUseableOutsideBattle(skill);
  }

  clickMove = (evt) => {
    const { location } = this.props.game;
    const { x, y } = location;
    const cardElement = this.findCardElement(evt.target);
    const newx = parseInt(cardElement.getAttribute('data-x'), 10);
    const newy = parseInt(cardElement.getAttribute('data-y'), 10);
    const canPass = cardElement.className.indexOf('canPass') > -1;
    if (isNaN(newx) || isNaN(newy) ) { return; }
    if (!this.isWithinOneSpace({newx, newy, curx: x, cury: y})) { return; }
    if (!canPass) { return; }
    this.props.moveTo(newx, newy);
  }

  findCardElement = (element) => {
    let cardElement = null;
    while (!cardElement) {
      if (element.className.indexOf('Tile') > -1) {
        cardElement = element;
      } else {
        element = element.parentElement;
      }
    }
    return cardElement;
  }

  isWithinOneSpace = ({newx, newy, curx , cury}) => {
    // Don't allow moving more than one space and don't allow diagonal movement
    return !((newx + 1 !== curx && newx - 1 !== curx && newy + 1 !== cury && newy - 1 !== cury) || (newx !== curx && newy !== cury));
  }

  move = (evt) => {
    if (this.timeout) { return; }
    this.timeout = setTimeout(() => this.timeout = false, 200);
    const { level, location } = this.props.game;
    let nextTile = null;
    let x = location.x;
    let y = location.y;
    switch(this.keyMap[evt.keyCode]) {
      case 'UP':
        nextTile = level.map[y - 1][x];
        if (level.assetInfo[nextTile].walk) {
          y -= 1;
        }
        break;
      case 'DOWN':
        nextTile = level.map[y + 1][x];
        if (level.assetInfo[nextTile].walk) {
          y += 1;
        }
        break;
      case 'LEFT':
        nextTile = level.map[y][x - 1];
        if (level.assetInfo[nextTile].walk) {
          x -= 1;
        }
        break;
      case 'RIGHT':
        nextTile = level.map[y][x + 1];
        if (level.assetInfo[nextTile].walk) {
          x += 1;
        }
        break;
      default:
        break;
    }

    // Check the space for treasures, etc. If returns false will also move to that space
    if (this.checkSpaceForObjects(x, y)) { return; }
    this.props.moveTo(x, y);
  }

  checkSpaceForObjects(x, y) {
    // Check monsters
    const monsterInSpace = this.props.game.monstersInLevel.find((monster) => {
      if (!monster) { return false; }
      return x === monster.location.x && y === monster.location.y;
    });
    // Check treasures
    const treasureInSpace = false;

    return monsterInSpace || treasureInSpace;
  }

  checkPositionForConnection(x, y) {
    const connection = this.props.game.level.connections.find((connection) => {
      return connection.location.x === x && connection.location.y === y;
    });
    
    return connection ? connection.to : false;
  }

  treasureAction(treasure) {

  }

  checkForMonsterEncounter(herox, heroy) {
    if (this.props.game.noCombat) { return; }
    const monsterIndex = this.props.game.monstersInLevel.findIndex((monster) => {
      if (!monster) { return false; }
      return this.isWithinOneSpace({
        curx: herox,
        cury: heroy,
        newx: monster.location.x,
        newy: monster.location.y
      });
    });
    if (monsterIndex > -1) {
      // Add timeout to allow animation to finish
      setTimeout(() => this.props.startFight(monsterIndex), 200);
    }
  }

  render() {
    const { game, changeInventoryOrEquipment } = this.props;
    const { location } = game;
    let modalActions = null;
    let modalTitle = null;
    let fullWidth = null;
    const modalContent = (() => {
      switch (this.state.showModal) {
        case 'inventory':
          modalTitle = <h2>Inventory</h2>;
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          fullWidth = true;
          return (
            <InventoryList 
              items={game.inventory}
              capacity={game.hero.equipment.backpack.attributes.capacity}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
              showStatus
            />
          );
        case 'equipment':
          modalTitle = <h2>Equipment</h2>;
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          fullWidth = true;
          return (
            <Equipment
              character={game.hero}
              changeInventoryOrEquipment={changeInventoryOrEquipment}
            />
          );
        case 'magic':
          modalTitle = <h2>Magic</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <SkillList
              skills={game.hero.magic}
              hero={game.hero}
              onSelectSkill={this.useSkill}
              disableFn={this.checkIfSkillDisabled}
            />
          );
        case 'skills':
          modalTitle = <h2>Skills</h2>
          modalActions = [{ name: 'Close', primary: true, onClick: this.closeModal }];
          return (
            <SkillList
              skills={game.hero.skills}
              hero={game.hero}
              onSelectSkill={this.useSkill}
              disableFn={this.checkIfSkillDisabled}
            />
          );
        default:
          return;
      }
    })();

    return (
      <div className="DungeonStage" ref={this.mainElement}>
        <div className="container">
          <div className="level" style={{transform: `translate(-${location.x * this.TILE_SIZE}px, -${location.y * this.TILE_SIZE}px)`}}>
            <EventListener events={[{name: 'click', handler: this.clickMove }]}>
              {game.level.map.map((row, y) => {
                return (
                  <div key={`row-${y}`} className="row">
                    {row.map((tileVal, x) => {
                      return (
                        <Tile 
                          key={`tile-${x}`}
                          tileName={game.level.assetInfo[tileVal].name}
                          canPass={game.level.assetInfo[tileVal].walk}
                          location={{x, y}}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </EventListener>
            <div
              className="object-container"
              style={{transform: `translate(${location.x * this.TILE_SIZE}px, ${location.y * this.TILE_SIZE}px)`}}
            >
              <Character character={game.hero} show={[]} />
            </div>
            {game.monstersInLevel.filter((monster) => monster).map((monster) => {
              return (
                <div
                  key={monster.index}
                  className="object-container"
                  style={{transform: `translate(${monster.location.x * this.TILE_SIZE}px, ${monster.location.y * this.TILE_SIZE}px)`}}
                >
                  <Character character={monster} show={[]} />
                </div>
              );
            })}
          </div>
        </div>
        <Modal
          title={modalTitle}
          shown={this.state.showModal !== false}
          actions={modalActions}
          onClose={this.closeModal}
          backgroundClickCloses
          fullWidth={fullWidth}
        >
          {modalContent}
        </Modal>
      </div>
    );
  }
}

DungeonStage.propTypes = {
  game: PropTypes.object.isRequired,
  transitionToLevel: PropTypes.func.isRequired,
  changeVitals: PropTypes.func.isRequired,
  heroDie: PropTypes.func.isRequired,
  setAvailableActions: PropTypes.func.isRequired,
  changeInventoryOrEquipment: PropTypes.func.isRequired,
  updateLastStageSizes: PropTypes.func.isRequired,
};
