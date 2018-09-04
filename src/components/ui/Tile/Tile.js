import React from 'react';
import PropTypes from 'prop-types';
import tiles from '../../../assets/tiles';
import './Tile.css';

export default function Tile(props) {
  const classes = [
    'Tile',
    `layer-${props.layer || 0}`,
    props.canPass && 'canPass'
  ].filter((cls) => cls).join(' ');

  return (
    <div className={classes} data-x={props.location.x} data-y={props.location.y}>
      <img
        src={tiles[props.tileName]}
        alt={props.tileName}
      />
      {props.children}
    </div>
  );
}

Tile.propTypes = {
  tileName: PropTypes.string.isRequired,
  layer: PropTypes.string,
  canPass: PropTypes.bool,
  location: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
};