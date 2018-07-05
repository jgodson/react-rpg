import React from 'react';
import PropTypes from 'prop-types';
import './TownStage.css';

export default function TownStage(props) {

  return (
    <div className="TownStage"></div>
  );
}

TownStage.propTypes = {
  game: PropTypes.object.isRequired,
};