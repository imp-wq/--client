import React from 'react';
import ReactDOM from 'react-dom';
import store from './app/state/store.js'
import { Provider } from 'react-redux';
import 'antd/dist/antd.css';
import 'jquery/dist/jquery'
import 'bootstrap/dist/css/bootstrap.css'

import App from './app/App';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

