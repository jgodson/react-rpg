import React from 'react';
import './Vitals.css';

export default function(props) {
  const { children } = props;
  return (
    <section className="Vitals">
      {children}
    </section>
  )
}