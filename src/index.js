import React from 'react';
import ReactDOM from 'react-dom';
import bugsnag from 'bugsnag-js';
import createPlugin from 'bugsnag-react';
import version from './version.json';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const bugsnagClient = bugsnag({
  apiKey: '733fe1744f51faceca41123ed92afa72',
  appVersion: version.version,
  notifyReleaseStages: ['production'],
});
const ErrorBoundary = bugsnagClient.use(createPlugin(React));

ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root'),
);
registerServiceWorker();
