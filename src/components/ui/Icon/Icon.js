import React from 'react';
import PropTypes from 'prop-types';
import icons from '../../../assets/icons';

export default function Icon(props) {
  return <img width={props.size} height={props.size} src={icons[props.name]} alt={props.name} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
};