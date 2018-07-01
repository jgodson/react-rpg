import React from 'react';
import PropTypes from 'prop-types';

import { Button } from '../../ui';
import './ActionList.css';

export default function ActionList(props) {
  const {
    availableActions,
    disabled,
  } = props;

  return (
    <section className="ActionList">
      <h3>Actions</h3>
      <div className="button-container">
        {availableActions.map((action) => {
          return (
            <Button
              key={action.name}
              primary={!action.secondary}
              secondary={action.secondary}
              destructive={action.destructive}
              disabled={disabled || action.disabled}
              onClick={action.onClick}
            >
              {action.name}
            </Button>
          );
        })}
      </div>
    </section>
  );
}

ActionList.propTypes = {
  availableActions: PropTypes.arrayOf(PropTypes.object).isRequired,
  disabled: PropTypes.bool,
}