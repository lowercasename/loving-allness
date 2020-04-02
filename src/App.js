import React from 'react';
import Firebase from 'firebase';
import config from './FirebaseConfig';
import './App.css';

import Game from './Game';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import { nanoid } from 'nanoid'
var generate = require('project-name-generator');

const shuffle = function (array) {

  var currentIndex = array.length;
  var temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;

};

const rotations = [
  '0deg',
  '90deg',
  '180deg',
  '270deg'
]

const generateTiles = (count) => {
  let tiles = [];
  for (let i = 0; i <= count; i++) {
    let id = nanoid()
    let tileNumber = i + 1
    let paddedNumber = ('0' + tileNumber).slice(-2);
    let rotation = rotations[Math.floor(Math.random() * rotations.length)]
    tiles.push({
      image: '/tiles/tile' + paddedNumber + '.jpg',
      id: id,
      rotation: rotation,
      modtime: Date.now(),
      number: tileNumber
    })
  }
  shuffle(tiles);
  return tiles;
}

class Introduction extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      toRoom: false
    }
  }
  createNewRoom = () => {
    let room = generate().dashed
    Firebase.database().ref('rooms/' + room).set({
      name: room,
      tileStack: generateTiles(30)
    })
      .then(() => this.setState(() => ({
        toRoom: true,
        newRoom: room
      })))
      .catch(error => {
        console.error('Firebase error', error)
      })
  }
  render() {
    if (this.state.toRoom === true) {
      return <Redirect to={'/world/' + this.state.newRoom} />
    }
    return (
      <div className="pure-g">
        <div className="pure-u-1">
          <main className="introduction">
            <h1>Loving Allness</h1>
            <img src="/tiles/tile12.jpg" style={{ width: '200px' }} alt="Loving Allness logo" />
            <button type="button" className="pure-button button-xlarge" onClick={this.createNewRoom}>New game</button>
          </main>
        </div>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    if (!Firebase.apps.length) {
      Firebase.initializeApp(config);
    }
    this.state = {
      room: null,
      browserId: null
    }
  }

  componentDidMount() {
    console.log('You are playing Loving Allness version', `${process.env.REACT_APP_VERSION}`)
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route exact path="/" component={Introduction} />
            <Route path="/world/:room" children={<Game />} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
