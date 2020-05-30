import React from 'react';
import NonDraggableTile from '../Components/NonDraggableTile'
import {
  Link
} from "react-router-dom";
import './after.css';

export default class After extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    return (
      <main className="gameboard gameboard--after">
        <div className="gameboard__notes">
          <div className="bordered-box grid-box">
            <textarea className="notes-textarea" value={this.props.archivalNotes} onChange={this.props.handleArchivalNotesChange} placeholder="You may write your archival notes here." />
          </div>
        </div>
        <div className="gameboard__notes-title">
          <div class="bordered-box grid-box" style={{ justifyContent: 'center' }}>
            <h2>Archival notes</h2>
          </div>
        </div>
        <div className="gameboard__finish-button">
          <button type="button" onClick={this.props.archiveGame} className="pure-button grid-button" >Archive world</button>
        </div>
        <div className="gameboard__return-button">
          <Link to="/" className="pure-button grid-button">Discard world</Link>
        </div>
        <div className="gameboard__information">
          <div class="bordered-box grid-box">
            <p>
              The game has ended. This is your world.
            </p>
            <p>
              You now have an opportunity to archive this world for future travellers and researchers in a publicly accessible space. If you would like to do so, write some notes on this world, drawing from your gameplay. When you are done, press the <strong>Archive</strong> button below.
            </p>
            <p>
              You may also choose to discard this world. It will vanish into the sea of worlds, and one day someone might stumble on it again. If you would like to do this, press the <strong>Return</strong> button below.
            </p>
          </div>
        </div>
        <div className="gameboard__world">
          <div className="counter-container">
            <div class="counter"></div>
            <div class="counter"></div>
            <div class="counter"></div>
          </div>
          <div className="droparea">
            <div className='world-card droparea__tilestack'>
              {this.props.onwardsWorldTiles.map((item, index) => (
                <NonDraggableTile
                  key={item.id}
                  tile={item}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="gameboard__world-title">
          <div class="bordered-box grid-box" style={{ justifyContent: 'center' }}>
            <h2>World</h2>
          </div>
        </div>
      </main>
    )
  }
}