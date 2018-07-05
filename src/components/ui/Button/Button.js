import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';
import { Tooltip } from '../../ui';

export default function Button(props) {
  const {
    children,
    icon,
    onClick,
    primary,
    secondary,
    destructive,
    disabled,
    tooltip,
  } = props;

  const classes = [
    'Button',
    Boolean(primary) && 'primary',
    Boolean(secondary) && 'secondary',
    Boolean(destructive) && 'destructive',
  ].filter((str) => str).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={Boolean(disabled)}>
      {tooltip && <Tooltip>{tooltip}</Tooltip>}
      {/* Need to implment icon component yet */}
      {icon && icon}
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  destructive: PropTypes.bool,
  disabled: PropTypes.bool,
  tooltip: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
}