import React from 'react';
import './FlexRow.css';

export default function FlexRow(props) {
  const { children } = props;

  return (
    <div className="FlexRow">
      {children}
    </div>
  );
}