import React from 'react';
import Firebase from 'firebase';
import config from '../FirebaseConfig';
import Game from '../Components/Game';
import Archive from './Archive';

import {
  BrowserRouter as Router,
  Link,
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
  for (let i = 0; i < count; i++) {
    let id = nanoid()
    let tileNumber = i + 1
    let paddedNumber = ('0' + tileNumber).slice(-2);
    let rotation = rotations[Math.floor(Math.random() * rotations.length)]
    tiles.push({
      image: '/tiles/tile' + paddedNumber + '.png',
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
      <div className="pure-g centered-container">
        <div className="pure-u-1 pure-u-md-1-5" style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="pure-button square-button" onClick={this.createNewRoom}>New game</button>
        </div>
        <main className="pure-u-1 pure-u-md-3-5" id="home-introduction-container">
          <div className="bordered-box">
            <p>
              At a crossroads between different worlds, you meet a group of travellers.
            </p>
            <p>
              You are all strangers to each other, but share a common goal - to create a new world to travel to, leaving your old ones behind.
            </p>
            <p>You will build this world in three stages:</p>
            <ol>
              <li>Tell the story of the worlds each of you came from.</li>
              <li>Meet at the crossroads of all present worlds by contributing to the stories of others.</li>
              <li>Create a new world you will travel to together, constructed from all that you have spoken about and learned of each other.</li>
            </ol>
            <p>A game of Loving Allness is played with <strong>2 to 4 players</strong> and takes between <strong>20 and 40 minutes</strong> to play, although it can also be played solitaire.</p>
            <p>Before you start playing, come together using a method of communication with which you are all familiar and comfortable, such as instant messenger or an audio or video call. Then, one of you should press 'New Game' and share the generated link with the other players.</p>
          </div>
        </main>
        <div className="pure-u-1 pure-u-md-1-5" style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/archive" className="pure-button square-button">Archive of previous worlds</Link>
        </div>
      </div >
    )
  }
}

class Home extends React.Component {
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
            <Route exact path="/archive" component={Archive} />
            <Route path="/world/:room" children={<Game />} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default Home;
