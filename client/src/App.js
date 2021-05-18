import './App.css';
import Landing from './components/Routes/Landing'
import FindMatch from './components/Routes/FindMatch'
import Game from './components/Routes/Game'
import Login from './components/Routes/Login'
import Dashboard from './components/Routes/Dashboard'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom"

function App() {

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Landing}></Route>
        <Route path="/find-match" exact><FindMatch /></Route>
        <Route path="/game" exact component={Game}></Route>
        <Route path="/login" exact><Login defaultView="login" /></Route>
        <Route path="/signup" exact><Login defaultView="sign up" /></Route>
        <Route path="/dashboard" exact component={Dashboard}></Route>
      </Switch>
    </Router> 
  );
}

export default App;
