import React from 'react';
import Firebase from 'firebase';
import {
  Redirect,
  withRouter
} from "react-router-dom";

import Before from './Before'
import Crossroads from './Crossroads'
import Onwards from './Onwards'

const idSort = (a, b) => {
  return (a.index > b.index) ? 1 : -1
}

/**
 * Reorders items in one list.
 */
const reorder = (list, startIndex, endIndex) => {
  const result = list.sort(idSort)
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  let reindexedResult = result.map((tile, index) => tile = { ...tile, index: index, modtime: Date.now() })
  return reindexedResult;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, newOwner, sourceIndex, destIndex, sourceLocation, destLocation) => {
  const [removed] = source.splice(sourceIndex, 1); // Remove one element and pop it into [removed]
  destination.splice(destIndex, 0, removed); // Splice [removed] at the destination index (and delete 0 elements)
  let reorderedSource = source.map((tile, index) => tile = { ...tile, index: index, modtime: Date.now(), location: sourceLocation })
  let reorderedDest = destination.map((tile, index) => tile = { ...tile, index: index, modtime: Date.now(), location: destLocation, owner: newOwner })
  const result = reorderedSource.concat(reorderedDest)
  return result;
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? '#fdfaff' : '',
});

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      room: this.props.match.params.room,
      gameStage: 'before',
      player: null,
      showPlayerSelector: false,
      takenPlayers: [],
      playedTiles: [],
      beforePocketTiles: [],
      beforeWorldTiles: [],
      crossroadsPocketTiles: [],
      crossroadsWorldTiles: [],
      onwardsPocketTiles: [],
      onwardsWorldTiles: []
      // crossroadsTiles: [{ name: 'alice' }, { name: 'bertha' }, { name: 'carol' }, { name: 'diana' }]
    };
    this.selectPlayer = this.selectPlayer.bind(this);
    this.changeStage = this.changeStage.bind(this);
    this.handleMeaningUpdate = this.handleMeaningUpdate.bind(this);
    this.takenAlert = this.takenAlert.bind(this);
  }

  componentDidMount() {
    this.getRoomData();
    // Stores objects like { room: 'room-name', player: 'alice', stage: 'stage-name' }
    let gameSessions = JSON.parse(localStorage.getItem('gameSessions'))
    let currentSession = gameSessions ? gameSessions.find(s => s.room === this.state.room) : false
    // A record for this room exists, so we've set our character previously
    if (currentSession) {
      this.setState({
        player: currentSession.player,
        gameStage: currentSession.stage
      })
      // console.log("Player loaded from memory:", currentSession.player)
    } else {
      // No record for this room exists, so we have to create one and wait for user character selection
      this.setState({
        showPlayerSelector: true
      })
      // console.log("No player set")
    }
  }
  getRoomData = () => {
    let ref = Firebase.database().ref('rooms/' + this.state.room);
    ref.on('value', snapshot => {
      const room = snapshot.val();
      let takenPlayers, playedTiles

      takenPlayers = room.players
      playedTiles = room.playedTiles

      this.setState({
        takenPlayers: takenPlayers,
        playedTiles: playedTiles
      })
    });
  }

  onDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    const sourceLocation = JSON.parse(source.droppableId).location
    const sourceOwner = JSON.parse(source.droppableId).owner
    const destLocation = JSON.parse(destination.droppableId).location
    const destOwner = JSON.parse(destination.droppableId).owner

    let newArrangement;
    if (sourceLocation === destLocation && sourceOwner === destOwner) {
      // Reordering within one list
      newArrangement = reorder(
        this.state.playedTiles.filter(t => t.location === sourceLocation && t.owner === sourceOwner),
        source.index,
        destination.index
      );
    } else {
      // Moving between lists
      newArrangement = move(
        this.state.playedTiles.filter(t => t.location === sourceLocation && t.owner === sourceOwner).sort(idSort),
        this.state.playedTiles.filter(t => t.location === destLocation && t.owner === destOwner).sort(idSort),
        destOwner,
        source.index,
        destination.index,
        sourceLocation,
        destLocation
      );
    }
    let playedTiles = this.state.playedTiles
    // Terrifying function to merge two arrays of objects, updating with the new values from the second array of objects
    // https://stackoverflow.com/questions/37057746/javascript-merge-two-arrays-of-objects-and-de-duplicate-based-on-property-valu
    for (var i = 0, l = playedTiles.length; i < l; i++) {
      for (var j = 0, ll = newArrangement.length; j < ll; j++) {
        if (playedTiles[i].id === newArrangement[j].id) {
          playedTiles.splice(i, 1, newArrangement[j]);
          break;
        }
      }
    }
    this.setState({ playedTiles: playedTiles })
    Firebase.database().ref('rooms/' + this.state.room + '/playedTiles').set(
      playedTiles
    )
  };

  showModal = () => {
    this.setState({ showPlayerSelector: true });
  };

  hideModal = () => {
    this.setState({ showPlayerSelector: false });
  };

  selectPlayer(e, player) {
    let gameSessions = JSON.parse(localStorage.getItem('gameSessions'))
    if (gameSessions !== null) {
      // Add this game session
      gameSessions.push({
        room: this.state.room,
        player: player,
        stage: 'before'
      })
    } else {
      // Add this game session (and create localStorage array)
      gameSessions = [{
        room: this.state.room,
        player: player,
        stage: 'before'
      }]
    }
    localStorage.setItem('gameSessions', JSON.stringify(gameSessions))
    // Update the database
    let ref = Firebase.database().ref('rooms/' + this.state.room);
    ref.once('value').then((snapshot) => {
      const room = snapshot.val();
      if (room.players && room.players[player] && room.players[player].playerTaken) {
        // This player is already taken! Just retrieve the current state.
      } else {
        // This player was not previously claimed, so draw some tiles and pop them in the database.
        let tileStack = room.tileStack
        let playedTiles = room.playedTiles || []
        let draw1 = tileStack.slice(0, 3).map((tile, index) => ({ ...tile, index: index, owner: player, location: 'beforePocketTiles' }))
        let draw2 = tileStack.slice(3, 6).map((tile, index) => ({ ...tile, index: index, owner: player, location: 'crossroadsPocketTiles' }))
        tileStack = tileStack.splice(6)
        let combinedDraws = playedTiles.concat(draw1.concat(draw2))
        Firebase.database().ref('rooms/' + this.state.room + '/tileStack').set(tileStack)
        Firebase.database().ref('rooms/' + this.state.room + '/playedTiles').set(combinedDraws)
        Firebase.database().ref('rooms/' + this.state.room + '/players/' + player).set({
          playerTaken: true,
          currentStage: 'before'
        })
      }
    })
    this.setState({
      player: player,
      stage: 'before',
      showPlayerSelector: false
    })
    this.getRoomData();
  }

  changeStage(stage) {
    let allowedToChange = false;
    if (this.state.gameStage === "before") {
      let finalTiles = this.state.playedTiles.filter(tile => tile.owner === this.state.player && tile.location === 'beforeWorldTiles')
      if (finalTiles.some(t => !t.meaning) || finalTiles.length < 3) {
        return alert("Before proceeding to the Crossroads, you must place three tiles on the Before card, and assign each one a meaning.");
      }
      allowedToChange = true;
    } else if (this.state.gameStage === "crossroads") {
      let finalTiles = this.state.playedTiles.filter(tile => tile.location === 'crossroadsWorldTiles')
      let crossroadsPlayers = 0;
      for (var i = 0, l = Object.keys(this.state.takenPlayers).length; i < l; i++) {
        if (this.state.takenPlayers[Object.keys(this.state.takenPlayers)[i]].currentStage === "crossroads") {
          crossroadsPlayers++;
        }
      }
      if (finalTiles.some(t => !t.meaning) || finalTiles.length < (crossroadsPlayers * 4)) {
        return alert("Before proceeding Onwards, each player's card must have four tiles on it, and each must be assigned a meaning.");
      }
      allowedToChange = true;
    }
    if (allowedToChange) {
      let gameSessions = JSON.parse(localStorage.getItem('gameSessions'));
      let updatedSessions = gameSessions.map(s => {
        if (s.room === this.state.room) {
          s.stage = stage
        }
        return s;
      })
      localStorage.setItem('gameSessions', JSON.stringify(updatedSessions))
      this.setState({
        gameStage: stage
      }, () => {
        if (stage === "crossroads") {
          // Copy Before board to Crossroads board
          let playedTiles = this.state.playedTiles
          playedTiles.filter(tile => tile.owner === this.state.player && tile.location === 'beforeWorldTiles').map(tile => tile.location = 'crossroadsWorldTiles')
          this.setState({ playedTiles: playedTiles })
          Firebase.database().ref('rooms/' + this.state.room + '/playedTiles').set(
            playedTiles
          )
          Firebase.database().ref('rooms/' + this.state.room + '/players/' + this.state.player + '/currentStage').set('crossroads')
        } else if (stage === "onwards") {
          // Copy Crossroads board to Onwards pocket
          let playedTiles = this.state.playedTiles
          let movedTiles = playedTiles.map(tile => {
            if (tile.owner === this.state.player && tile.location === 'crossroadsWorldTiles') {
              tile = { ...tile, location: 'onwardsPocketTiles', owner: 'world' }
            }
            return tile;
          })
          this.setState({ playedTiles: movedTiles })
          Firebase.database().ref('rooms/' + this.state.room + '/playedTiles').set(
            movedTiles
          )
          Firebase.database().ref('rooms/' + this.state.room + '/players/' + this.state.player + '/currentStage').set('onwards')
        }
      })
    }
  }

  handleMeaningUpdate(tileId, event) {
    let inputText = event.target.value
    if (inputText.length > 9) {
      return false;
    }
    inputText = inputText.trim()
    // Update Firebase
    let playedTiles = this.state.playedTiles
    playedTiles.find(t => t.id === tileId).meaning = inputText
    this.setState({ playedTiles: playedTiles })
    Firebase.database().ref('rooms/' + this.state.room + '/playedTiles').set(
      playedTiles
    )
  }

  takenAlert(player) {
    if (this.state.takenPlayers) {
      if (Object.keys(this.state.takenPlayers).find(p => p === player)) {
        return '(Taken)'
      }
    }
  }

  render() {
    if (this.state.room === null || !this.state.gameStage.match(/^(before|crossroads|onwards)$/)) {
      return <Redirect to='/' />
    }
    return (
      <>
        <LoadingScreen show={this.state.playedTiles ? this.state.playedTiles.length ? false : true : false} />
        <Modal show={this.state.showPlayerSelector} handleClose={this.hideModal}>
          <h1>Welcome to Loving Allness</h1>
          <p>Loving Allness is a game played with <strong>two to four players</strong> and takes between <strong>twenty and forty minutes</strong> to play.</p>
          <p>Give your friends the following link to let them join the game, and come together using a method of communication you are all comfortable with.</p>
          <div className="highlight">https://loving-allness.mimir.computer/{this.state.room}</div>
          <p>To begin, select a character. Characters marked 'Taken' are already in use by someone else.</p>
          <div className="pure-button-group" role="group">
            <button type="button" className="pure-button" onClick={(e) => this.selectPlayer(e, 'alice')}>Alice {this.takenAlert('alice')}</button>
            <button type="button" className="pure-button" onClick={(e) => this.selectPlayer(e, 'bertha')}>Bertha {this.takenAlert('bertha')}</button>
            <button type="button" className="pure-button" onClick={(e) => this.selectPlayer(e, 'carol')}>Carol {this.takenAlert('carol')}</button>
            <button type="button" className="pure-button" onClick={(e) => this.selectPlayer(e, 'diana')}>Diana {this.takenAlert('diana')}</button>
          </div>

        </Modal>
        <div className="pure-g">
          <div className="pure-u-1 pure-u-md-1-4">
            <GameSidebar
              room={this.state.room}
              gameStage={this.state.gameStage}
              player={this.state.player}
              changeStage={this.changeStage} />
          </div>
          <div className="pure-u-1 pure-u-md-3-4">
            {this.state.gameStage === 'before' &&
              <Before
                player={this.state.player}
                onDragEnd={this.onDragEnd}
                getListStyle={getListStyle}
                beforePocketTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.owner === this.state.player && tile.location === 'beforePocketTiles').sort(idSort) : []}
                beforeWorldTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.owner === this.state.player && tile.location === 'beforeWorldTiles').sort(idSort) : []}
                handleMeaningUpdate={this.handleMeaningUpdate}
              />
            }
            {this.state.gameStage === 'crossroads' &&
              <Crossroads
                player={this.state.player}
                onDragEnd={this.onDragEnd}
                getListStyle={getListStyle}
                crossroadsPocketTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.owner === this.state.player && tile.location === 'crossroadsPocketTiles').sort(idSort) : []}
                crossroadsWorldTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.location === 'crossroadsWorldTiles').sort(idSort) : []}
                handleMeaningUpdate={this.handleMeaningUpdate}
                takenPlayers={this.state.takenPlayers}
                idSort={this.idSort}
              />
            }
            {this.state.gameStage === 'onwards' &&
              <Onwards
                player={this.state.player}
                onDragEnd={this.onDragEnd}
                getListStyle={getListStyle}
                onwardsPocketTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.location === 'onwardsPocketTiles').sort(idSort) : []}
                onwardsWorldTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.location === 'onwardsWorldTiles').sort(idSort) : []}
                handleMeaningUpdate={this.handleMeaningUpdate}
                takenPlayers={this.state.takenPlayers}
                idSort={this.idSort}
              />
            }
          </div>
        </div>
      </>
    );
  }
}

class GameSidebar extends React.Component {
  render() {
    let prettyStageName = this.props.gameStage.replace(/^\w/, c => c.toUpperCase());
    let prettyPlayerName = this.props.player && this.props.player.replace(/^\w/, c => c.toUpperCase());
    return (
      <div className="sidebar">
        <h1>
          {prettyStageName}
        </h1>
        {this.props.gameStage === "before" ?
          <div>
            <p>
              This is the <strong>first stage</strong> of the game.
            </p>
            <p>
              There are three tiles in your <strong>Pocket</strong>.
            </p>
            <p>
              Arrange those tiles in any order on the card named <strong>Before</strong>.
            </p>
            <p>
              The arrangement of the tiles represents the world you are from. You are now seeking to leave this world behind. What do the tiles tell you about <strong>you</strong>? What might they say about the state of the world you have come from? Why do you want to depart from it? Take a few moments to construct your story.
            </p>
            <p>
              As you arrange the tiles, give each one a <strong>one-word name</strong>. What does this tile mean to you? What concept does it convey?
            </p>
            <p>
              When you are done, press the button below.
            </p>
            <button type="button" onClick={() => this.props.changeStage('crossroads')} className="pure-button" >To the Crossroads</button>

          </div>
          : this.props.gameStage === "crossroads" ?
            <div>
              <p>
                This is the <strong>second stage</strong> of the game.
            </p>
              <button type="button" onClick={() => this.props.changeStage('onwards')} className="pure-button" >Onwards</button>
            </div>
            : this.props.gameStage === "onwards" ?
              <div>
                <p>
                  This is the <strong>third stage</strong> of the game.
            </p>
              </div>
              :
              <div>
                A mistake has been made.
          </div>
        }
        {
          prettyPlayerName &&
          <div className="sidebar__player-name">
            <p>You are playing as <strong>{prettyPlayerName}</strong>.</p>
          </div>
        }
      </div >
    )
  }
}

const Modal = ({ handleClose, show, children }) => {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {children}
      </section>
    </div>
  );
};

const LoadingScreen = ({ show, length }) => {
  const showHideClassName = show ? "loading-screen display-flex" : "loading-screen display-none";
  return (
    <div className={showHideClassName}>
      <div className="moon">
        <div className="disc"></div>
      </div>
    </div>
  )
}

export default withRouter(Game);