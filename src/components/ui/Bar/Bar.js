import React from 'react';
import PropTypes from 'prop-types';
import './Bar.css';

export default function Bar(props) {
  const {
    current,
    max,
    height,
    lowColor,
    highColor,
    label,
    showStatus,
    alwaysShowGradient,
  } = props;

  let percentage = (1 - current / max) * 100;
  const isMaxedOut = max === Number.MAX_SAFE_INTEGER;
  
  // Make sure percentage isn't > 100 or < 0
  if (percentage > 100) {
    percentage = 100;
  } else if (percentage < 0) {
    percentage = 0;
  } else if (isMaxedOut) {
    percentage = 0;
  }

  const isFull = percentage === 0;
  const isEmpty = percentage === 100;

  const progressBarClasses = [
    'progress',
    isFull && 'full',
    isEmpty && 'empty'
  ].filter((str) => str).join(' ');

  const background = percentage > 70 || alwaysShowGradient ? `linear-gradient(to right, ${lowColor || highColor}, ${highColor || lowColor} 25%)` : highColor || lowColor;
  return (
    <div className="Bar">
      <div className="info">
        {label && <label>{label}</label>}
        {showStatus && (!isMaxedOut ? <span>{current > 0 ? current : 0}/{max}</span> : <span>Max</span>)}
      </div>
      <div 
        className={progressBarClasses}
        style={{
          width: `${percentage}%`,
          height: `${height || 20}px`,
          background,
        }}
      >
      </div>
    </div>
  );
}

Bar.propTypes = {
  current: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  lowColor: PropTypes.string,
  highColor: PropTypes.string,
  height: PropTypes.number,
  label: PropTypes.string,
  showStatus: PropTypes.bool,
  alwaysShowGradient: PropTypes.bool,
}