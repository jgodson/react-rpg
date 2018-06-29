import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

export default function Button(props) {
  const {
    children,
    icon,
    onClick,
    primary,
    secondary,
    destructive,
    disabled,
  } = props;

  const classes = [
    'Button',
    Boolean(primary) && 'primary',
    Boolean(secondary) && 'secondary',
    Boolean(destructive) && 'destructive',
  ].filter((str) => str).join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={Boolean(disabled)}>
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
}