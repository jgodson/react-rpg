import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../../ui';
import './Stat.css'

export default class Stat extends React.PureComponent {
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

  render() {
    const {
      name,
      statKey,
      value,
      showButton,
      disableButton,
    } = this.props;

    return (
      <tr className="Stat">
        <td>{name}</td>
        <td>{value}</td>
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
  value: PropTypes.number.isRequired,
  showButton: PropTypes.bool,
  changeStats: PropTypes.func.isRequired,
};