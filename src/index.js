import React from 'react';
import ReactDOM from 'react-dom';
import RootScreen from './components/screens/RootScreen/RootScreen';
import './index.scss';


if (typeof window.umami !== 'function') {
    window.umami = () => {}
}

ReactDOM.render(
  <React.StrictMode>
    <RootScreen />
  </React.StrictMode>,
  document.getElementById('root')
);
