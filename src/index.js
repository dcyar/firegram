import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import firebaseConfig from './config/firebase';

import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

firebase.initializeApp(firebaseConfig);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
