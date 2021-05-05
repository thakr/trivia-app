import React from 'react';
import GamePage from './components/GamePage'
import Landing from './components/Landing'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"

function App() {

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Landing}></Route>
        <Route path="/room/:id" exact component={GamePage}></Route>
      </Switch>
    </Router> 
  );
}

export default App;
