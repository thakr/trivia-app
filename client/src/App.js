import React from 'react';
import GamePage from './components/GamePage'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"

function App() {

  return (
    <Router>
      <Switch>
        <Route path="/" exact>Please type a URL with a game room</Route>
        <Route path="/room/:id" exact component={GamePage}></Route>
      </Switch>
    </Router> 
  );
}

export default App;
