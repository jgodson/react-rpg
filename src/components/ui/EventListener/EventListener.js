import React from 'react';
import PropTypes from 'prop-types';

export default class EventListener extends React.PureComponent {
  constructor(props) {
    super(props);
    this.listener = React.createRef();
  }

  componentDidMount() {
    this.props.events.forEach((event) => {
      this.listener.current.addEventListener(event.name, event.handler);
    });
  }

  componentWillUnmount() {
    this.props.events.forEach((event) => {
      this.listener.current.removeEventListener(event.name, event.handler);
    });
  }

  render() {
    return(
      <div ref={this.listener} className="EventListener">
        {this.props.children}
      </div>
    );
  }
}

EventListener.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    handler: PropTypes.func.isRequired,
  })).isRequired,
};