import React from 'react';
import Firebase from 'firebase';
import {
  Redirect,
  withRouter,
  Link
} from "react-router-dom";

import Before from '../Pages/Before'
import Crossroads from '../Pages/Crossroads'
import Onwards from '../Pages/Onwards'
import After from '../Pages/After'

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
  if (destLocation === "crossroadsWorldTiles" && destination.length === 4) {
    return false;
  } else if (destLocation === "crossroadsPocketTiles" && destination.length === 3) {
    return false;
  } else if (destLocation === "onwardsWorldTiles" && destination.length === 3) {
    return false;
  } else if (destLocation === "onwardsPocketTiles" && destination.length === 16) {
    return false;
  }
  const [removed] = source.splice(sourceIndex, 1); // Remove one element and pop it into [removed]
  destination.splice(destIndex, 0, removed); // Splice [removed] at the destination index (and delete 0 elements)
  let reorderedSource = source.map((tile, index) => tile = { ...tile, index: index, modtime: Date.now(), location: sourceLocation })
  let reorderedDest = destination.map((tile, index) => tile = { ...tile, index: index, modtime: Date.now(), location: destLocation, owner: newOwner })
  const result = reorderedSource.concat(reorderedDest)
  return result;
};

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'rgba(255,255,255,0.1)' : '',
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
      onwardsWorldTiles: [],
      archivalNotes: '',
      isArchived: false
    };
    this.selectPlayer = this.selectPlayer.bind(this);
    this.changeStage = this.changeStage.bind(this);
    this.handleMeaningUpdate = this.handleMeaningUpdate.bind(this);
    this.handleArchivalNotesChange = this.handleArchivalNotesChange.bind(this);
    this.takenAlert = this.takenAlert.bind(this);
    this.archiveGame = this.archiveGame.bind(this);
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
      let takenPlayers, playedTiles, archivalNotes, isArchived

      takenPlayers = room.players
      playedTiles = room.playedTiles
      archivalNotes = room.archivalNotes
      isArchived = room.archived

      this.setState({
        isArchived: isArchived,
        takenPlayers: takenPlayers,
        playedTiles: playedTiles,
        archivalNotes: archivalNotes
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
    } else if (this.state.gameStage === "onwards") {
      let finalTiles = this.state.playedTiles.filter(tile => tile.location === 'onwardsWorldTiles')
      if (finalTiles.some(t => !t.meaning) || finalTiles.length < 3) {
        return alert("Before ending the game, you must place three tiles on the Onwards card, and assign each one a meaning.");
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
        } else if (stage === "after") {
          Firebase.database().ref('rooms/' + this.state.room + '/players/' + this.state.player + '/currentStage').set('after')
        }
      })
    }
  }

  archiveGame() {
    let archiveData = {
      date: Date.now(),
      notes: this.state.archivalNotes || 'No notes recorded.',
      world: this.state.playedTiles.filter(tile => tile.location === 'onwardsWorldTiles').sort(idSort)
    }
    Firebase.database().ref('/archives').push(
      archiveData,
      err => console.log(err ? 'Error while adding to archive' : 'Added to archive')
    )
    Firebase.database().ref('rooms/' + this.state.room + '/archived').set(true)
    return <Redirect to='/archive' />
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

  handleArchivalNotesChange(event) {
    let inputText = event.target.value
    // Update Firebase
    this.setState({ archivalNotes: inputText })
    Firebase.database().ref('rooms/' + this.state.room + '/archivalNotes').set(
      inputText
    )
  }

  takenAlert(player) {
    if (this.state.takenPlayers) {
      if (Object.keys(this.state.takenPlayers).find(p => p === player)) {
        return 'Taken'
      }
    }
  }

  render() {
    if (this.state.room === null || this.state.isArchived === true || !this.state.gameStage.match(/^(before|crossroads|onwards|after)$/)) {
      return <Redirect to='/' />
    }
    return (
      <>
        <LoadingScreen show={this.state.playedTiles ? this.state.playedTiles.length ? false : true : false} />
        <div className="centered-container">
          {/* <div className="pure-u-1 pure-u-md-1-4">
            <GameSidebar
              room={this.state.room}
              gameStage={this.state.gameStage}
              player={this.state.player}
              changeStage={this.changeStage}
              archiveGame={this.archiveGame} />
          </div> */}
          {this.state.showPlayerSelector ?
            <div style={{display: 'flex', flexDirection: 'column', maxWidth: '840px'}}>
              <div className="bordered-box grid-box" style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p>Loving Allness is a game played with <strong>2 to 4 players</strong> and takes between <strong>20 and 40 minutes</strong> to play.</p>
                <p>Give your friends the following link to let them join the game, and come together using a method of communication you are all comfortable with.</p>
                <div className="highlight">https://loving-allness.mimir.computer/world/{this.state.room}</div>
              </div>
              <div className="bordered-box grid-box" style={{ textAlign: 'center' }}>
                <p>To begin, select a character. Characters marked 'Taken' are already in use by someone else.</p>
                <div className="flex-row">
                  <div>
                    <button type="button" className="pure-button square-button square-button-sm" onClick={(e) => this.selectPlayer(e, 'bertha')}><img src="/avatars/Bertha.png" alt="Bertha" style={{width: '120px', height: '120px', display: 'block'}}/></button>
                    <p>{this.takenAlert('bertha')}</p>
                  </div>
                  <div>
                  <button type="button" className="pure-button square-button square-button-sm" onClick={(e) => this.selectPlayer(e, 'carol')}><img src="/avatars/Carol.png" alt="Carol" style={{width: '120px', height: '120px', display: 'block'}}/></button>
                  <p>{this.takenAlert('carol')}</p>
                  </div>
                  <div>
                  <button type="button" className="pure-button square-button square-button-sm" onClick={(e) => this.selectPlayer(e, 'alice')}><img src="/avatars/Alice.png" alt="Alice" style={{width: '120px', height: '120px', display: 'block'}}/></button>
                  <p>{this.takenAlert('alice')}</p>
                  </div>
                  <div>
                  <button type="button" className="pure-button square-button square-button-sm" onClick={(e) => this.selectPlayer(e, 'diana')}><img src="/avatars/Diana.png" alt="Diana" style={{width: '120px', height: '120px', display: 'block'}}/></button>
                  <p>{this.takenAlert('diana')}</p>
                  </div>

                </div>
              </div>
            </div>
            :
            <>
              {
                this.state.gameStage === 'before' &&
                <Before
                  room={this.state.room}
                  gameStage={this.state.gameStage}
                  player={this.state.player}
                  changeStage={this.changeStage}
                  archiveGame={this.archiveGame}
                  prettyPlayerName={this.state.player && this.state.player.replace(/^\w/, c => c.toUpperCase())}
                  onDragEnd={this.onDragEnd}
                  getListStyle={getListStyle}
                  beforePocketTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.owner === this.state.player && tile.location === 'beforePocketTiles').sort(idSort) : []}
                  beforeWorldTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.owner === this.state.player && tile.location === 'beforeWorldTiles').sort(idSort) : []}
                  handleMeaningUpdate={this.handleMeaningUpdate}
                />
              }
              {this.state.gameStage === 'crossroads' &&
                <Crossroads
                  room={this.state.room}
                  gameStage={this.state.gameStage}
                  player={this.state.player}
                  changeStage={this.changeStage}
                  archiveGame={this.archiveGame}
                  prettyPlayerName={this.state.player && this.state.player.replace(/^\w/, c => c.toUpperCase())}
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
                  room={this.state.room}
                  gameStage={this.state.gameStage}
                  player={this.state.player}
                  changeStage={this.changeStage}
                  archiveGame={this.archiveGame}
                  prettyPlayerName={this.state.player && this.state.player.replace(/^\w/, c => c.toUpperCase())}
                  onDragEnd={this.onDragEnd}
                  getListStyle={getListStyle}
                  onwardsPocketTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.location === 'onwardsPocketTiles').sort(idSort) : []}
                  onwardsWorldTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.location === 'onwardsWorldTiles').sort(idSort) : []}
                  handleMeaningUpdate={this.handleMeaningUpdate}
                  takenPlayers={this.state.takenPlayers}
                  idSort={this.idSort}
                />
              }
              {this.state.gameStage === 'after' &&
                <After
                  room={this.state.room}
                  gameStage={this.state.gameStage}
                  player={this.state.player}
                  changeStage={this.changeStage}
                  archiveGame={this.archiveGame}
                  prettyPlayerName={this.state.player && this.state.player.replace(/^\w/, c => c.toUpperCase())}
                  onwardsWorldTiles={this.state.playedTiles ? this.state.playedTiles.filter(tile => tile.location === 'onwardsWorldTiles').sort(idSort) : []}
                  takenPlayers={this.state.takenPlayers}
                  handleArchivalNotesChange={this.handleArchivalNotesChange}
                  archivalNotes={this.state.archivalNotes}
                />
              }
            </>
          }
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
              <p>
                You meet your fellow travellers at the <strong>Crossorads</strong>. Taking turns, tell the others the story of the world you created in the first stage.
              </p>
              <p>
                There are three new tiles in your <strong>Pocket</strong>. Taking turns again, take one tile from your Pocket, give it a name, and place it anywhere on the card of the player to your <strong>left</strong>.
              </p>
              <p>
                Explain how the tile you placed relates to the story told by this fellow traveller. Is it an object they need? An expression of emotion? An offer of help? After the last player has taken their turn, take a moment as a group to contemplate how your stories are moving, and the shape they are taking as they are loosened from their origins.
              </p>
              <p>
                When you are all done, press the button below.
              </p>
              <button type="button" onClick={() => this.props.changeStage('onwards')} className="pure-button" >Onwards</button>
            </div>
            : this.props.gameStage === "onwards" ?
              <div>
                <p>
                  This is the <strong>third and final stage</strong> of the game.
                </p>
                <p>
                  In your <strong>Pocket</strong> are all the tiles you have played - the collective language with which you have told the stories of your worlds.
                </p>
                <p>
                  Working together, choose three tiles and arrange them in any order on the card named <strong>Onwards</strong>.
                </p>
                <p>
                  The arrangement of the tiles represents the world to which you are travelling together. What do they tell you about <strong>all of you?</strong> Take a few moments to talk about this world. How will you get there? What will you bring with you? What will you leave behind?
                </p>
                <p>
                  When you are all done, press the button below.
                </p>
                <button type="button" onClick={() => this.props.changeStage('after')} className="pure-button" >Finish</button>
              </div>
              : this.props.gameStage === "after" ?
                <div>
                  <p>
                    The game has ended. This is your world.
                  </p>
                  <p>
                    You now have an opportunity to archive this world for future travellers and researchers in a publicly accessible space. If you would like to do so, write some notes on this world, drawing from your gameplay. When you are done, press the <strong>Archive</strong> button below.
                  </p>
                  <p>
                    You may also choose to discard this world. It will vanish into the sea of worlds, and one day someone might stumble on it again. If you would like to do this, press the <strong>Return</strong> button below.
                  </p>
                  <button type="button" onClick={this.props.archiveGame} className="pure-button" style={{ display: 'block' }} >Archive this game</button>
                  <Link to="/" className="pure-button" style={{ marginTop: '20px', display: 'block', width: 'min-content' }}>Return to the Introduction</Link>
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