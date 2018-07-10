import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Button } from '../../ui';
import './Modal.css';

export default class Modal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.root = document.getElementById('PortalContainer');

    this.container = document.createElement('div');
    this.container.className = 'ModalContainer';

    this.background = document.createElement('div');
    if (props.backgroundClickCloses) {
      this.background.onclick = () => props.onClose(false);
    }
    this.background.className = 'ModalBackground';

    this.modal = document.createElement('div');
    this.modal.className = `Modal ${props.fullWidth ? 'full-width' : ''}`;
    if (props.customClasses) {
      this.modal.className += ` ${props.customClasses.join(' ')}`;
    }
    const button = document.createElement('button');
    button.onclick = () => props.onClose(false);
    button.className = 'close-button';
    button.innerHTML = '<span>X</span>';
    this.modal.appendChild(button);

    this.container.appendChild(this.modal);
    this.container.appendChild(this.background);
  }

  componentDidUpdate(prevProps) {
    if (this.props.fullWidth !== prevProps.fullWidth) {
      const modal = this.modal;
      const isFullWidth = modal.className.indexOf('full-width') > -1;
      const shouldBeFullWidth = this.props.fullWidth;

      if (shouldBeFullWidth && !isFullWidth) {
        modal.className += ' full-width';
      } else if (!shouldBeFullWidth && isFullWidth) {
        modal.className = modal.className.replace('full-width', '').trim();
      }
    }
  }

  componentDidMount() {
    this.root.appendChild(this.container);
  }

  componentWillUnmount() {
    this.root.removeChild(this.container);
  }

  render() {
    const { shown, actions, title, children } = this.props;
    if (shown) {
      this.container.classList.add('shown');
    } else {
      this.container.classList.remove('shown');
    }

    const portalContent = (
      <React.Fragment>
        {title && <div className="modal-title">{title}</div>}
        <div className="modal-content">
          {children}
        </div>
        {actions &&
          <div className="actions">
            {actions.map((action) => (
              <Button
                key={action.name}
                primary={action.primary}
                secondary={action.secondary}
                destructive={action.destructive}
                onClick={action.onClick}
                disabled={action.disabled}
                tooltip={action.tooltip}
              >
                {action.name}
              </Button>
            ))}
          </div>
        }
      </React.Fragment>
    );

    return ReactDOM.createPortal(
      portalContent,
      this.modal,
    );
  }
}

Modal.propTypes = {
  shown: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onClose: PropTypes.func.isRequired,
  actions: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    primary: PropTypes.bool,
    secondary: PropTypes.bool,
    destructive: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    tooltip: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.node
    ]),
  })),
  fullWidth: PropTypes.bool,
  customClasses: PropTypes.arrayOf(PropTypes.string),
  backgroundClickCloses: PropTypes.bool,
};