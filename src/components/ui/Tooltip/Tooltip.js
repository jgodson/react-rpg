import React from 'react';
import './Tooltip.css';

export default function Tooltip(props) {
  return (
    <div className="Tooltip" onClick={() => {/* To allow "hover" on mobile */}}>
      <div className="tooltiptext">{props.children}</div>
    </div>
  );
}