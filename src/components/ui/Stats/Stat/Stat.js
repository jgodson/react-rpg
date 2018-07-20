import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from '../../../ui';
import './Stat.css'

export default class Stat extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      modalShown: false,
    };

    this.modalActions = [
      {name: 'Close', primary: true, onClick: this.toggleModal}
    ];
  }

  adjustStat = (name) => () => {
    // Add point to stat and remove statPoint
    this.props.changeStats([
      {
        name,
        change: 1,
      },
      {
        name: 'statPoints',
        change: -1,
      }
    ]);
  }

  toggleModal = () => this.setState({modalShown: !this.state.modalShown});

  render() {
    const {
      name,
      statKey,
      description,
      value,
      tempValue,
      showButton,
      disableButton,
    } = this.props;

    const descriptionContent = description && (
      <React.Fragment>
        <Modal
          title={<h2>{name}</h2>}
          shown={this.state.modalShown}
          onClose={this.toggleModal}
          actions={this.modalActions}
          customClasses={['stat-modal']}
          backgroundClickCloses
        >
          {description}
        </Modal>
        <Button onClick={this.toggleModal}>{name}</Button>
      </React.Fragment>
    );

    const tempChange = tempValue
      ?
        <span className={`temp-value ${tempValue < 0 ? 'decrease' : ''}`}>{` (${tempValue < 0 ? '-' : '+'}${tempValue})`}</span>
      : null;

    return (
      <tr className="Stat">
        <td className="name-container">
          {descriptionContent ? descriptionContent : <span>{name}</span>}
        </td>
        <td>{value}{tempChange}</td>
        <td>
          {showButton &&
            <Button secondary disabled={disableButton} onClick={this.adjustStat(statKey)}>
              +
            </Button>
          }
        </td>
      </tr>
    );
  }
}

Stat.propTypes = {
  name: PropTypes.string.isRequired,
  statKey: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.number.isRequired,
  showButton: PropTypes.bool,
  changeStats: PropTypes.func,
};