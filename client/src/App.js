import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

const App = () => {
    return (
        <Router>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/chat" component={Chat} />
        </Router>
    );
};

export default App;
